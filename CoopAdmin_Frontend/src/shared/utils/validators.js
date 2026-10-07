/**
 * Ortak form doğrulama kuralları.
 * TC, telefon, şifre vb. tüm formlarda aynı kurallar uygulanır.
 */

import { toDigits } from "./formatters.js";

export const validateTc = (value) => {
  const digits = toDigits(value).slice(0, 11);
  if (digits.length !== 11) return "TC Kimlik No 11 haneli olmalıdır.";
  return null;
};

export const validateTelefon = (value, required = true) => {
  const digits = toDigits(value).slice(0, 11);
  if (!digits) return required ? "Telefon alanı zorunludur." : null;
  if (digits.length < 10) return "Telefon numarası en az 10 haneli olmalıdır.";
  return null;
};

export const validateSifre = (value, required = true) => {
  const s = String(value || "").trim();
  if (!s) return required ? "Şifre alanı zorunludur." : null;
  if (!/^\d{6}$/.test(s)) return "Şifre tam olarak 6 haneli rakam olmalıdır.";
  return null;
};

export const validateEmail = (value) => {
  const s = String(value || "").trim();
  if (!s) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(s)) return "Geçerli bir e-posta adresi giriniz.";
  return null;
};
