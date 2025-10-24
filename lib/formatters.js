const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 0,
});

export function formatCurrency(amount) {
  return CURRENCY_FORMATTER.format(amount);
}

export function formatVolume(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + "B"; // Billions
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M"; // Millions
  if (value >= 1e3) return (value / 1e3).toFixed(1) + "K"; // Thousands
  return value.toString(); // Less than 1,000 stays as is
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNumber(number) {
  return NUMBER_FORMATTER.format(number);
}

const PERCENT_FORMATTER = new Intl.NumberFormat("en-US", { style: "percent" });

export function formatDiscountCode({ discountAmount, discountType }) {
  switch (discountType) {
    case "PERCENTAGE":
      return PERCENT_FORMATTER.format(discountAmount / 100);
    case "FIXED":
      return formatCurrency(discountAmount);
    default:
      throw new Error(`Invalid discount code type: ${discountType}`);
  }
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(date) {
  return DATE_TIME_FORMATTER.format(date);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export function formatDate(date) {
  return DATE_FORMATTER.format(date);
}