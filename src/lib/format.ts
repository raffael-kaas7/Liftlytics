import { format } from "date-fns";

export function formatWeight(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} kg`;
}

export function formatMetric(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function formatDate(value: Date | string) {
  return format(new Date(value), "MMM d, yyyy");
}
