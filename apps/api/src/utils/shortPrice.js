// Same display rule as apps/web/src/lib/shortPrice.js (kept in sync by hand —
// the API can't import from the web app): 500000 -> "₹5 L", 10000000 -> "₹1 Cr",
// 9958480068 -> "₹995.8 Cr".
const oneDecimal = (x) => String(Math.round(x * 10) / 10);

export function formatShortPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '₹0';
  const lakhs = Math.round((n / 1e5) * 10) / 10;
  if (n >= 1e7 || lakhs >= 100) return `₹${oneDecimal(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${oneDecimal(n / 1e5)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
