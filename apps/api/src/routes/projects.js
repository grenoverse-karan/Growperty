import express from 'express';
import multer from 'multer';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { moderateFreeTextFields } from '../utils/contactModeration.js';
import { sanitizeConnectivity } from '../utils/connectivity.js';

// fileSize is a single ceiling across every field in the request — set to
// the largest field (projectVideo, up to 100MB client-side); other fields
// are capped tighter client-side (see ProjectListingForm.jsx handleFileChange).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// Project "Documents" section — one optional file each, sent as `doc_<key>`
// (keys match PROJECT_DOCUMENT_TYPES in the web app's listingOptions.js).
const DOCUMENT_KEYS = ['reraCertificate', 'gstCertificate', 'isoCertificate', 'approvalDocs', 'sitePlan', 'masterPlan', 'paymentPlan', 'priceList', 'possessionLetter'];

const MAX_PRICE_LISTS = 10;

const uploadFields = upload.fields([
  { name: 'projectImages', maxCount: 20 },
  { name: 'floorPlans', maxCount: 10 },
  { name: 'brochure', maxCount: 1 },
  { name: 'projectVideo', maxCount: 1 },
  { name: 'priceLists', maxCount: MAX_PRICE_LISTS },
  ...DOCUMENT_KEYS.map(key => ({ name: `doc_${key}`, maxCount: 1 })),
]);

const router = express.Router();

// Cloudinary refuses files over its plan limit (10MB for PDFs/images, 100MB for
// video) with a plain "File size too large" error — say so, instead of a bare 500.
const isTooLargeError = (err) => /file size too large/i.test(err?.message || '');
const TOO_LARGE_MESSAGE = 'A file is too large to store. PDFs and images can be up to 10MB, videos up to 100MB — please upload a smaller file.';

// Price lists: any number of PDF/image files. documents.priceList keeps the
// first (so older readers still work) and priceListMore holds the rest.
const uploadPriceLists = (files) => Promise.all((files.priceLists || []).map(f => uploadBufferToCloudinary(f.buffer, {
  folder: 'growperty/projects/documents',
  resourceType: f.mimetype === 'application/pdf' ? 'raw' : 'image',
})));
const splitPriceLists = (urls) => ({ first: urls[0], more: urls.slice(1) });

// Multipart fields arrive as strings; blank → undefined so it isn't stored as 0.
const parseNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const parseJson = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};

// =====================
// POST / — Create project
// =====================
router.post('/', uploadFields, async (req, res) => {
  try {
    const data = req.body || {};
    const isDraft = data.saveAsDraft === 'true' || data.saveAsDraft === true;
    if (isDraft) {
      if (!data.projectName?.trim()) return res.status(400).json({ success: false, message: 'Enter at least the Project Name to save a draft' });
    } else if (!data.projectName || !data.builderName || !data.projectType || !data.city || !data.sector || !data.projectStatus) {
      return res.status(400).json({ success: false, message: 'Missing required project fields' });
    }

    const files = req.files || {};

    const [projectImages, floorPlans, brochureUrls, projectVideoUrls, documentUrls] = await Promise.all([
      Promise.all((files.projectImages || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/images', resourceType: 'image' }))),
      Promise.all((files.floorPlans || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/floorplans', resourceType: 'image' }))),
      Promise.all((files.brochure || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/brochures', resourceType: 'raw' }))),
      Promise.all((files.projectVideo || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/videos', resourceType: 'video' }))),
      Promise.all(DOCUMENT_KEYS.map(async key => {
        const f = files[`doc_${key}`]?.[0];
        if (!f) return [key, undefined];
        const isPdf = f.mimetype === 'application/pdf';
        const url = await uploadBufferToCloudinary(f.buffer, {
          folder: 'growperty/projects/documents',
          resourceType: isPdf ? 'raw' : 'image',
        });
        return [key, url];
      })),
    ]);
    const documents = Object.fromEntries(documentUrls.filter(([, url]) => url));
    const priceLists = splitPriceLists(await uploadPriceLists(files));
    if (priceLists.first) documents.priceList = priceLists.first;

    const cleanedText = await moderateFreeTextFields({
      projectUSP: data.projectUSP,
      specialOffers: data.specialOffers,
      description: data.description,
      nearbyFamousPlace: data.nearbyFamousPlace,
      offerTitle: data.offerTitle,
      offerDetails: data.offerDetails,
    });

    const project = new Project({
      projectName: data.projectName,
      builderName: data.builderName,
      projectType: data.projectType,
      propertyTypes: parseJson(data.propertyTypes, []),
      landArea: parseNumber(data.landArea),
      landAreaUnit: data.landAreaUnit || undefined,
      totalTowers: parseNumber(data.totalTowers),
      totalFloors: data.totalFloors?.trim() || undefined,
      totalUnits: parseNumber(data.totalUnits),
      unitsAvailable: parseNumber(data.unitsAvailable),
      greenAreaPercent: parseNumber(data.greenAreaPercent),
      overviewMinSize: parseNumber(data.overviewMinSize),
      overviewMaxSize: parseNumber(data.overviewMaxSize),
      overviewSizeUnit: data.overviewSizeUnit || undefined,
      overviewMinRate: parseNumber(data.overviewMinRate),
      overviewMaxRate: parseNumber(data.overviewMaxRate),
      propertyTypePricing: parseJson(data.propertyTypePricing, {}),
      configurationAvailable: parseJson(data.configurationAvailable, []),
      paymentPlans: parseJson(data.paymentPlans, []),
      projectStatus: data.projectStatus,
      launchYear: data.launchYear,
      expectedPossession: data.expectedPossession,
      reraNumber: data.reraNumber,
      reraApplied: data.reraApplied === 'true' || data.reraApplied === true,
      gstNumber: data.gstNumber,
      city: data.city,
      sector: data.sector,
      landmark: data.landmark,
      societyName: data.societyName,
      projectAddress: data.projectAddress,
      amenities: parseJson(data.amenities, []),
      contactPersonName: data.contactPersonName,
      designation: data.designation,
      mobileNumber: data.mobileNumber,
      email: data.email,
      companyWebsite: data.companyWebsite,
      officeAddress: data.officeAddress,
      projectUSP: cleanedText.projectUSP,
      hasSpecialOffer: data.hasSpecialOffer === 'true' || data.hasSpecialOffer === true,
      specialOffers: cleanedText.specialOffers,
      description: cleanedText.description,
      nearbyFamousPlace: cleanedText.nearbyFamousPlace,
      bestFor: parseJson(data.bestFor, []),
      connectivity: sanitizeConnectivity(data.connectivity),
      offerTitle: cleanedText.offerTitle,
      offerDetails: cleanedText.offerDetails,
      offerValidTill: data.offerValidTill || undefined,
      confirmationCheckbox1: data.confirmationCheckbox1 === 'true' || data.confirmationCheckbox1 === true,
      confirmationCheckbox2: data.confirmationCheckbox2 === 'true' || data.confirmationCheckbox2 === true,
      projectImages,
      floorPlans,
      brochure: brochureUrls[0],
      projectVideo: projectVideoUrls[0],
      documents,
      priceListMore: priceLists.more,
      documentsApplied: parseJson(data.documentsApplied, []).filter(k => ['gstCertificate', 'isoCertificate', 'approvalDocs'].includes(k)),
      status: isDraft ? 'draft' : 'pending',
    });

    const saved = await project.save();
    logger.info('Project created', { id: saved._id });

    return res.status(201).json({ success: true, projectId: saved._id.toString() });
  } catch (err) {
    logger.error('POST /api/projects error', { message: err.message });
    if (isTooLargeError(err)) return res.status(413).json({ success: false, message: TOO_LARGE_MESSAGE });
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: `Validation failed: ${Object.keys(err.errors).join(', ')}` });
    }
    return res.status(500).json({ success: false, message: err.message || 'Something went wrong' });
  }
});

// =====================
// GET / — List projects
// =====================
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter.city = req.query.city;

    const [items, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: items.map(p => ({ ...p, id: p._id.toString() })),
      page,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    logger.error('GET /api/projects error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// GET /:id — Get single project
// =====================
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.status(200).json({ ...project, id: project._id.toString() });
  } catch (err) {
    logger.error('GET /api/projects/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Cloudinary's account security settings block public delivery of anything
// it recognizes as a PDF (our 'raw' brochures/documents) — it 200s images
// fine but 401s a PDF regardless of signing or delivery type. These routes
// fetch the file server-side (which Cloudinary does allow) and re-serve it
// ourselves with correct headers, so "View" opens inline in the browser
// instead of downloading an extension-less file the OS can't open.
const safeFilename = (s) => (s || 'file').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'file';

const proxyCloudinaryFile = async (res, url, filename) => {
  if (!url) return res.status(404).json({ success: false, message: 'File not found' });
  if (!url.includes('/raw/upload/')) return res.redirect(url);
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(502).json({ success: false, message: 'Could not fetch file' });
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${safeFilename(filename)}.pdf"`);
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (err) {
    logger.error('Cloudinary proxy fetch failed', { message: err.message, url });
    return res.status(502).json({ success: false, message: 'Could not fetch file' });
  }
};

router.get('/:id/brochure', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id, { brochure: 1, projectName: 1 }).lean();
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return proxyCloudinaryFile(res, project.brochure, `${project.projectName}-brochure`);
  } catch (err) {
    logger.error('GET /api/projects/:id/brochure error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Price list #n (0 = documents.priceList, 1.. = priceListMore[n-1]).
router.get('/:id/price-list/:n', async (req, res) => {
  try {
    const n = Number(req.params.n);
    const project = await Project.findById(req.params.id, { documents: 1, priceListMore: 1, projectName: 1 }).lean();
    if (!project || !Number.isInteger(n) || n < 0) return res.status(404).json({ success: false, message: 'File not found' });
    const url = n === 0 ? project.documents?.priceList : project.priceListMore?.[n - 1];
    return proxyCloudinaryFile(res, url, `${project.projectName}-price-list-${n + 1}`);
  } catch (err) {
    logger.error('GET /api/projects/:id/price-list/:n error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/documents/:key', async (req, res) => {
  try {
    if (!DOCUMENT_KEYS.includes(req.params.key)) {
      return res.status(404).json({ success: false, message: 'Unknown document type' });
    }
    const project = await Project.findById(req.params.id, { documents: 1, projectName: 1 }).lean();
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return proxyCloudinaryFile(res, project.documents?.[req.params.key], `${project.projectName}-${req.params.key}`);
  } catch (err) {
    logger.error('GET /api/projects/:id/documents/:key error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// PUT /:id — Update project. Two shapes hit this route:
//  - Plain JSON (admin status/boost toggles from AdminProjectsPage) — passes
//    straight through as before, untouched by anything below.
//  - Multipart (the edit form, ProjectListingForm with initialData) — carries
//    the same fields POST does, plus `existing*` fields listing which
//    already-uploaded media to keep; anything left out of those is dropped,
//    and newly uploaded files are added on top. uploadFields quietly no-ops
//    on a non-multipart request, so it's safe to attach to both shapes.
// =====================
router.put('/:id', uploadFields, async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;

    const isFormEdit = Boolean(req.files);

    if (isFormEdit) {
      // "Save as Draft" always lands in Drafts (even for a project that was
      // pending or live); the first normal save of a draft submits it for
      // review. Any other normal save leaves the status alone.
      const current = await Project.findById(req.params.id, { status: 1 }).lean();
      if (data.saveAsDraft === 'true') data.status = 'draft';
      else if (current?.status === 'draft') data.status = 'pending';
      delete data.saveAsDraft;
      const files = req.files || {};

      const [projectImages, floorPlans, brochureUrls, projectVideoUrls, documentUrls] = await Promise.all([
        Promise.all((files.projectImages || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/images', resourceType: 'image' }))),
        Promise.all((files.floorPlans || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/floorplans', resourceType: 'image' }))),
        Promise.all((files.brochure || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/brochures', resourceType: 'raw' }))),
        Promise.all((files.projectVideo || []).map(f => uploadBufferToCloudinary(f.buffer, { folder: 'growperty/projects/videos', resourceType: 'video' }))),
        Promise.all(DOCUMENT_KEYS.map(async key => {
          const f = files[`doc_${key}`]?.[0];
          if (!f) return [key, undefined];
          const isPdf = f.mimetype === 'application/pdf';
          const url = await uploadBufferToCloudinary(f.buffer, {
            folder: 'growperty/projects/documents',
            resourceType: isPdf ? 'raw' : 'image',
          });
          return [key, url];
        })),
      ]);

      // Arrays/objects: kept-existing + newly uploaded. Anything the lister
      // removed in the UI is simply absent from the "existing" list sent up,
      // so it drops out here too — this $set fully replaces each field.
      data.projectImages = [...parseJson(data.existingProjectImages, []), ...projectImages];
      data.floorPlans = [...parseJson(data.existingFloorPlans, []), ...floorPlans];
      data.documents = { ...parseJson(data.existingDocuments, {}), ...Object.fromEntries(documentUrls.filter(([, url]) => url)) };
      if (data.existingPriceLists !== undefined) {
        const priceLists = splitPriceLists([...parseJson(data.existingPriceLists, []), ...(await uploadPriceLists(files))]);
        if (priceLists.first) data.documents.priceList = priceLists.first; else delete data.documents.priceList;
        data.priceListMore = priceLists.more;
      }

      // Single-file fields: a new upload replaces it; otherwise keep exactly
      // what the client says to keep (including '' to explicitly clear it) —
      // checked with `!== undefined` so an intentional '' isn't lost to `||`.
      data.brochure = brochureUrls[0] !== undefined ? brochureUrls[0] : (data.existingBrochure !== undefined ? data.existingBrochure : undefined);
      data.projectVideo = projectVideoUrls[0] !== undefined ? projectVideoUrls[0] : (data.existingProjectVideo !== undefined ? data.existingProjectVideo : undefined);

      delete data.existingProjectImages;
      delete data.existingFloorPlans;
      delete data.existingBrochure;
      delete data.existingProjectVideo;
      delete data.existingDocuments;
      delete data.existingPriceLists;

      // The rest of the form's JSON-shaped / typed fields, sent as FormData strings.
      data.propertyTypes = parseJson(data.propertyTypes, []);
      data.propertyTypePricing = parseJson(data.propertyTypePricing, {});
      data.configurationAvailable = parseJson(data.configurationAvailable, []);
      data.paymentPlans = parseJson(data.paymentPlans, []);
      data.amenities = parseJson(data.amenities, []);
      data.bestFor = parseJson(data.bestFor, []);
      data.connectivity = sanitizeConnectivity(data.connectivity);
      data.documentsApplied = parseJson(data.documentsApplied, []).filter(k => ['gstCertificate', 'isoCertificate', 'approvalDocs'].includes(k));
      data.reraApplied = data.reraApplied === 'true' || data.reraApplied === true;
      data.confirmationCheckbox1 = data.confirmationCheckbox1 === 'true' || data.confirmationCheckbox1 === true;
      data.confirmationCheckbox2 = data.confirmationCheckbox2 === 'true' || data.confirmationCheckbox2 === true;
      for (const key of ['landArea', 'totalTowers', 'totalUnits', 'unitsAvailable', 'greenAreaPercent', 'overviewMinSize', 'overviewMaxSize', 'overviewMinRate', 'overviewMaxRate']) {
        data[key] = parseNumber(data[key]);
      }
      if (!data.offerValidTill) delete data.offerValidTill;
    }

    const textFields = {};
    if (data.projectUSP !== undefined) textFields.projectUSP = data.projectUSP;
    if (data.specialOffers !== undefined) textFields.specialOffers = data.specialOffers;
    for (const key of ['description', 'nearbyFamousPlace', 'offerTitle', 'offerDetails']) {
      if (data[key] !== undefined) textFields[key] = data[key];
    }
    if (Object.keys(textFields).length > 0) {
      Object.assign(data, await moderateFreeTextFields(textFields));
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.status(200).json({ success: true, project: { ...updated, id: updated._id.toString() } });
  } catch (err) {
    logger.error('PUT /api/projects/:id error', { message: err.message });
    if (isTooLargeError(err)) return res.status(413).json({ success: false, message: TOO_LARGE_MESSAGE });
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: `Validation failed: ${Object.keys(err.errors).join(', ')}` });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// DELETE /:id — Delete project
// =====================
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('DELETE /api/projects/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
