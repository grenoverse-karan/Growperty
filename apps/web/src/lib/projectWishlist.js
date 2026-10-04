// Separate storage from wishlist.js (properties) — deliberately not the
// same key/array. CpWishlistPage reads every saved id and fetches it via
// GET /properties/:id; mixing project ids into that same list would 404
// for each one. Kept as an independent, parallel module instead.
const PROJECT_WISHLIST_KEY = 'growperty_project_wishlist';

export function getProjectWishlist() {
  try { return JSON.parse(localStorage.getItem(PROJECT_WISHLIST_KEY) || '[]'); }
  catch { return []; }
}

export function isProjectWishlisted(projectId) {
  return getProjectWishlist().includes(projectId);
}

export function toggleProjectWishlist(projectId) {
  const current = getProjectWishlist();
  const wasWishlisted = current.includes(projectId);
  const next = wasWishlisted
    ? current.filter((id) => id !== projectId)
    : [...current, projectId];
  localStorage.setItem(PROJECT_WISHLIST_KEY, JSON.stringify(next));
  return !wasWishlisted;
}
