import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { createMustahsil, getAllSirketler } from "../../../shared/api/index.js";
import { toDigits, formatTelefon, formatTcKimlikNo } from "../../../shared/utils/formatters.js";
import { parseBackendErrors } from "../../../shared/utils/parseBackendErrors.js";
import { validateTc, validateTelefon, validateSifre } from "../../../shared/utils/validators.js";
import { FormInput, FormSelect, FormTextarea, ModalShell } from "../../../shared/ui/index.js";

const initialForm = { isletmeUnvani: "", no: "", cariKod: "", adres: "", sirketId: "", ad: "", soyad: "", tcKimlikNo: "", telefon: "", eposta: "", sifre: "" };
const MUSTAHSIL_FIELD_LABELS = { request: "Form Verisi", isletmeUnvani: "Ünvan", no: "İşletme No", cariKod: "Cari Kod", adres: "Adres", sirketId: "Şirket", ad: "Yetkili Ad", soyad: "Yetkili Soyad", tcKimlikNo: "TC Kimlik No", telefon: "Telefon", eposta: "E-posta", sifre: "Şifre" };

const resolveSirketId = (rawValue, sirketler) => {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  const byId = sirketler.find((s) => s.id === raw);
  if (byId) return byId.id;
  const byName = sirketler.find((s) => String(s.ad || "").toLowerCase() === raw.toLowerCase());
  return byName?.id || "";
};

export default function AddMustahsilModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [sirketler, setSirketler] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    getAllSirketler()
      .then((data) => setSirketler(Array.isArray(data) ? data : []))
      .catch(() => setGeneralError("Şirket listesi yüklenirken bir hata oluştu."));
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === "tcKimlikNo") next = formatTcKimlikNo(value);
    if (name === "telefon") next = formatTelefon(value);
    if (name === "sifre") next = toDigits(value).slice(0, 6);
    setForm((p) => ({ ...p, [name]: next }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setFieldErrors({});
    setGeneralError("");
    onClose();
  };

  const validateForm = () => {
    const nextErrors = {};
    const tcErr = validateTc(form.tcKimlikNo);
    if (tcErr) nextErrors.tcKimlikNo = tcErr;
    const telErr = validateTelefon(form.telefon, true);
    if (telErr) nextErrors.telefon = telErr;
    const sifreErr = validateSifre(form.sifre, true);
    if (sifreErr) nextErrors.sifre = sifreErr;
    if (!form.no.trim()) nextErrors.no = "İşletme No alanı zorunludur.";
    if (!resolveSirketId(form.sirketId, sirketler)) nextErrors.sirketId = "Lütfen listeden geçerli bir şirket seçiniz.";
    if (!form.ad.trim()) nextErrors.ad = "Yetkili Ad alanı zorunludur.";
    if (!form.soyad.trim()) nextErrors.soyad = "Yetkili Soyad alanı zorunludur.";
    const sirketId = resolveSirketId(form.sirketId, sirketler);
    return { nextErrors, sirketId };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneralError("");
    setFieldErrors({});

    const { nextErrors, sirketId } = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setGeneralError(Object.values(nextErrors)[0]);
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      isletmeUnvani: form.isletmeUnvani.trim() || null,
      no: form.no.trim(),
      tcKimlikNo: toDigits(form.tcKimlikNo).slice(0, 11),
      telefon: toDigits(form.telefon).slice(0, 11),
      sirketId,
      cariKod: form.cariKod.trim() || null,
      adres: form.adres.trim() || null,
      eposta: form.eposta.trim() || null,
    };

    try {
      const created = await createMustahsil(payload);
      onCreated?.(created);
      handleClose();
    } catch (error) {
      const parsed = parseBackendErrors(error, MUSTAHSIL_FIELD_LABELS);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={handleClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={submitting}>
        Vazgeç
      </button>
      <button type="submit" form="add-mustahsil-form" className="rounded-lg border border-blue-600 bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300" disabled={submitting}>
        {submitting ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );

  return (
    <ModalShell title="Yeni Müstahsil Ekle" subtitle="İşletme kaydı ve bağlı çalışan oluşturulur." icon={Building2} onClose={handleClose} onClickBackdrop={handleClose} footer={footer}>
      <form id="add-mustahsil-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {generalError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="İşletme No" name="no" value={form.no} onChange={handleChange} error={fieldErrors.no} placeholder="Örn: ISL-0001" required />
            <FormSelect label="Şirket" name="sirketId" value={form.sirketId} onChange={handleChange} error={fieldErrors.sirketId} options={sirketler.map((s) => ({ id: s.id, ad: s.ad }))} required />
            <FormInput label="Yetkili Ad" name="ad" value={form.ad} onChange={handleChange} error={fieldErrors.ad} required />
            <FormInput label="Yetkili Soyad" name="soyad" value={form.soyad} onChange={handleChange} error={fieldErrors.soyad} required />
            <FormInput label="TC Kimlik No" name="tcKimlikNo" value={form.tcKimlikNo} onChange={handleChange} error={fieldErrors.tcKimlikNo} placeholder="12345678901" required />
            <FormInput label="Telefon" name="telefon" value={form.telefon} onChange={handleChange} error={fieldErrors.telefon} placeholder="05xx xxx xx xx" required />
            <FormInput label="Şifre" name="sifre" type="password" value={form.sifre} onChange={handleChange} error={fieldErrors.sifre} placeholder="6 haneli rakam (örn: 123456)" wrapperClassName="col-span-2" showPasswordHint required maxLength={6} inputMode="numeric" autoComplete="new-password" />
            <FormInput label="Ünvan" name="isletmeUnvani" value={form.isletmeUnvani} onChange={handleChange} error={fieldErrors.isletmeUnvani} />
            <FormInput label="Cari Kod" name="cariKod" value={form.cariKod} onChange={handleChange} error={fieldErrors.cariKod} />
            <FormInput label="E-posta" name="eposta" value={form.eposta} onChange={handleChange} error={fieldErrors.eposta} placeholder="örnek@mail.com" wrapperClassName="col-span-2" />
            <FormTextarea label="Adres" name="adres" value={form.adres} onChange={handleChange} error={fieldErrors.adres} wrapperClassName="col-span-2" />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
