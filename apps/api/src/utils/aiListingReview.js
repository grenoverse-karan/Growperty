import Property from '../models/Property.js';
import { reviewListing } from './aiImageReview.js';
import { sendTemplateMessage } from './whatsappTemplates.js';
import { notifyMatchingBuyers } from './matchBuyers.js';
import logger from './logger.js';

const TEAM_CONTACT = '+91 9891117876';

// Reviews a whole listing (all photos + all text) with AI and records the outcome.
//
//   pending listing  -> approved / rejected / left pending (manual review)
//   any other status -> the result is recorded for admins but the status is
//                       never touched (a live listing must not be pulled, and a
//                       sold/unlisted/rejected one must not be revived, by a bot)
//
// The status update is conditional on the status we read, so an admin who
// approved/rejected the listing while the AI was thinking always wins.
export async function runAiReview(propertyId) {
  // The whole listing: every photo plus all its text fields. Listings are
  // reviewed once their photos are in (that is when this is scheduled); a
  // listing that never gets photos simply stays with the admins.
  const prop = await Property.findById(propertyId).lean();
  if (!prop?.images?.length) return null;

  const { approved, reason } = await reviewListing(prop);
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
export function scheduleAiReview(propertyId) {
  const job = new Promise((resolve) => {
    setImmediate(() => {
      runAiReview(propertyId)
        .catch((err) => logger.warn('[AI review] job failed', { id: propertyId, message: err.message }))
        .finally(resolve);
    });
  });
  try {
    globalThis[Symbol.for('@vercel/request-context')]?.get?.()?.waitUntil?.(job);
  } catch { /* not running on Vercel */ }
}
