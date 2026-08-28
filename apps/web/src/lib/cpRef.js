const COOKIE_NAME = 'cpRef';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getCpRef() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function setCpRef({ cpPublicId, refToken, cpName, cpPhone }) {
  const value = encodeURIComponent(JSON.stringify({ cpPublicId, refToken, cpName, cpPhone }));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/`;
}

// { cpName, cpPhone } if a referral cookie is active, otherwise null.
export function getActiveCpContact() {
  const ref = getCpRef();
  if (!ref?.cpPhone) return null;
  return { cpName: ref.cpName, cpPhone: ref.cpPhone };
}

// { cpPublicId, refToken } to attach to lead submissions for CP credit, otherwise null.
export function getCpRefAttribution() {
  const ref = getCpRef();
  if (!ref?.cpPublicId || !ref?.refToken) return null;
  return { cpPublicId: ref.cpPublicId, refToken: ref.refToken };
}
