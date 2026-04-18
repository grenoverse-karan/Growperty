export const formatPriceInWords = (value) => {
  if (!value || isNaN(value)) return '';
  const num = Number(value);
  if (num === 0) return 'Zero';
  
  if (num >= 10000000) {
    const crores = num / 10000000;
    return `${crores % 1 === 0 ? crores : crores.toFixed(2).replace(/\.00$/, '')} Crore`;
  }
  if (num >= 100000) {
    const lakhs = num / 100000;
    return `${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(2).replace(/\.00$/, '')} Lakh`;
  }
  if (num >= 1000) {
    const thousands = num / 1000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(2).replace(/\.00$/, '')} Thousand`;
  }
  return num.toString();
};

export const formatIndianPrice = (value) => {
  if (!value || isNaN(value)) return '';
  return new Intl.NumberFormat('en-IN').format(Number(value));
};