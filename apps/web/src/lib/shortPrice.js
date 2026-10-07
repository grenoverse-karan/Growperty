// Display-only short price: 500000 -> "₹5 L", 7500000 -> "₹75 L",
// 10000000 -> "₹1 Cr", 9958480068 -> "₹995.8 Cr". One decimal at most.
//
// Used wherever a listing's price is shown to the public. It deliberately
// throws away the exact digits, so a phone number typed into the price field
// shows up as an unrecognisable "₹995.8 Cr". The stored number is untouched.
//
// Plain module with no imports so the Vercel edge middleware can use it too.
const oneDecimal = (x) => String(Math.round(x * 10) / 10);

export function formatShortPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '₹0';
  const lakhs = Math.round((n / 1e5) * 10) / 10;
  if (n >= 1e7 || lakhs >= 100) return `₹${oneDecimal(n / 1e7)} Cr`; // also catches 99.96 L -> 1 Cr
  if (n >= 1e5) return `₹${oneDecimal(n / 1e5)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
