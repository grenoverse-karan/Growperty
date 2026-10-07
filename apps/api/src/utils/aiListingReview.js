import Property from '../models/Property.js';
import { reviewListing } from './aiImageReview.js';
import { sendTemplateMessage } from './whatsappTemplates.js';
import { notifyMatchingBuyers } from './matchBuyers.js';
import logger from './logger.js';

const TEAM_CONTACT = '+91 9891117876';

// Reviews a listing with AI and records the outcome.
//
//   full review (default) — photos + all text. Needs photos, so it runs when
//                           they're uploaded.
//   textOnly              — runs right after the listing is created, before
//                           any photos exist: catches phone numbers, emails,
//                           abuse and sexual text at submission time. A text
//                           failure rejects at once; a pass changes nothing
//                           (the listing keeps waiting for its photos, whose
//                           upload triggers the full review).
//
//   pending listing  -> approved / rejected / left pending (manual review)
//   live listing     -> the result is recorded for admins, status untouched
//                       (a live listing must not be pulled by a bot)
//   rejected / other -> skipped entirely, so an earlier verdict and its
//                       reason are never overwritten
//
// The status update is conditional on the status we read, so an admin who
// approved/rejected the listing while the AI was thinking always wins.
export async function runAiReview(propertyId, { textOnly = false } = {}) {
  const prop = await Property.findById(propertyId).lean();
  if (!prop) return null;
  if (textOnly ? prop.status !== 'pending' : (!prop.images?.length || prop.status === 'rejected')) return null;

  const { approved, reason } = await reviewListing(textOnly ? { ...prop, images: [] } : prop);

  if (textOnly && approved !== false) {
    // Nothing to change yet. Leave a note for admins — but never over a full
    // review that finished first (the photo upload can race this check).
    await Property.updateOne(
      { _id: propertyId, status: 'pending', aiReviewedAt: { $exists: false } },
      { $set: { aiReviewReason: approved === true ? 'Text checked — waiting for photos' : reason, aiReviewedAt: new Date() } },
    );
    return { approved, reason, status: prop.status };
  }

  const set = { aiReviewReason: reason, aiReviewedAt: new Date() };

  let newStatus = null;
  if (prop.status === 'pending') {
    newStatus = approved === true ? 'approved' : approved === false ? 'rejected' : null; // null -> stays pending
    if (newStatus) set.status = newStatus;
    if (newStatus === 'approved') set.liveAt = new Date();
  }

  const updated = await Property.findOneAndUpdate({ _id: propertyId, status: prop.status }, { $set: set }, { new: true }).lean();
  if (!updated) {
    logger.info('[AI review] skipped — status changed during review', { id: propertyId });
    return null;
  }
  logger.info('[AI review] done', { id: propertyId, approved, status: updated.status, reason });

  // Same lister messages as a manual admin approve/reject (PUT /properties/:id).
  if (newStatus && updated.mobileNumber) {
    const userName = updated.name || 'there';
    try {
      if (newStatus === 'approved') {
        await sendTemplateMessage(updated.mobileNumber, 'property_approved', { userName, propertyUrl: `https://www.growperty.com/property/${updated._id}` });
        notifyMatchingBuyers(updated);
      } else {
        await sendTemplateMessage(updated.mobileNumber, 'property_rejected', { userName, reason, teamContact: TEAM_CONTACT });
      }
    } catch (err) {
      logger.warn('[AI review] lister notification failed', { id: propertyId, message: err.message });
    }
  }
  return { approved, reason, status: updated.status };
}

// Fire-and-forget: never blocks (or fails) the request that triggered it.
// On Vercel a function is frozen once the response is sent, so the job is also
// registered with the platform's waitUntil (a no-op everywhere else).
export function scheduleAiReview(propertyId, options) {
  const job = new Promise((resolve) => {
    setImmediate(() => {
      runAiReview(propertyId, options)
        .catch((err) => logger.warn('[AI review] job failed', { id: propertyId, message: err.message }))
        .finally(resolve);
    });
  });
  try {
    globalThis[Symbol.for('@vercel/request-context')]?.get?.()?.waitUntil?.(job);
  } catch { /* not running on Vercel */ }
}
