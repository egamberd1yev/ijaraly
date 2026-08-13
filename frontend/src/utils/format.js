export function formatPrice(price, currency = "som") {
  const amount = Number(price).toLocaleString("uz-UZ");
  if (currency === "dollar") {
    return `$${amount}/oy`;
  }
  return `${amount} so'm/oy`;
}