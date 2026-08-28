const WISHLIST_KEY = 'growperty_wishlist';

export function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
}

export function isWishlisted(propertyId) {
  return getWishlist().includes(propertyId);
}

export function toggleWishlist(propertyId) {
  const current = getWishlist();
  const wasWishlisted = current.includes(propertyId);
  const next = wasWishlisted
    ? current.filter((id) => id !== propertyId)
    : [...current, propertyId];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  return !wasWishlisted;
}
