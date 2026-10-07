/**
 * Ortak formatlama fonksiyonları.
 * Telefon, TC, tarih vb. formatları tek yerden yönetir.
 */

export const toDigits = (value) => (value || "").replace(/\D/g, "");

export const formatTcKimlikNo = (value) => toDigits(value).slice(0, 11);

export const formatTelefon = (value) => {
  const digits = toDigits(value).slice(0, 11);
  if (!digits) return "";
  let output = `(${digits.slice(0, 4)}`;
  if (digits.length >= 4) output += ")";
  if (digits.length > 4) output += ` ${digits.slice(4, 7)}`;
  if (digits.length > 7) output += ` ${digits.slice(7, 9)}`;
  if (digits.length > 9) output += ` ${digits.slice(9, 11)}`;
  return output;
};

export const formatDateTr = (dateValue) => {
  if (!dateValue) return "-";
  try {
    return new Date(dateValue).toLocaleDateString("tr-TR");
  } catch {
    return "-";
  }
};
