/**
 * Backend validation hatalarını Türkçe mesajlara çevirir.
 * Tüm form modallarında ortak kullanılır.
 */

const normalizeFieldKey = (key) => (key ? key.charAt(0).toLowerCase() + key.slice(1) : "");

const toTurkishValidationMessage = (message, fieldLabel) => {
  const text = String(message || "").trim();
  if (!text) return "Geçersiz değer.";
  if (text.toLowerCase().includes("the request field is required"))
    return "Form verisi okunamadı. Lütfen alanları kontrol edip tekrar deneyiniz.";
  if (text.toLowerCase().includes("one or more validation errors occurred"))
    return "Lütfen zorunlu alanları kontrol ediniz.";
  if (text.includes("must not be empty")) return `${fieldLabel} alanı zorunludur.`;
  if (text.includes("must not be equal to")) return `${fieldLabel} seçimi zorunludur.`;
  if (text.includes("must be 11 characters")) return `${fieldLabel} 11 haneli olmalıdır.`;
  if (text.includes("is not in the correct format")) return `${fieldLabel} formatı geçersiz.`;
  if (text.includes("is not a valid email address")) return "Geçerli bir e-posta adresi giriniz.";
  if (text.includes("must be at least 8 characters")) return "Şifre en az 8 karakter olmalıdır.";
  return text;
};

/**
 * @param {Error} error - axios error
 * @param {Record<string, string>} fieldLabelMap - alan adı -> Türkçe etiket
 * @returns {{ fieldErrors: Record<string, string>, message: string }}
 */
export const parseBackendErrors = (error, fieldLabelMap = {}) => {
  const fieldErrors = {};
  const payload = error?.response?.data;
  const summary = [];

  if (payload?.errors && typeof payload.errors === "object") {
    Object.entries(payload.errors).forEach(([key, messages]) => {
      const normalizedKey = normalizeFieldKey(key);
      const label = fieldLabelMap[normalizedKey] || normalizedKey || "Alan";
      const rawMessage = Array.isArray(messages) ? messages[0] : String(messages);
      const translated = toTurkishValidationMessage(rawMessage, label);
      fieldErrors[normalizedKey] = translated;
      summary.push(`${label}: ${translated}`);
    });
  }

  const fallbackRaw = payload?.message || payload?.title || "";
  const fallback = toTurkishValidationMessage(fallbackRaw, "Form");
  const message = summary[0] || fallback || "Lütfen zorunlu alanları kontrol ediniz.";
  return { fieldErrors, message };
};
