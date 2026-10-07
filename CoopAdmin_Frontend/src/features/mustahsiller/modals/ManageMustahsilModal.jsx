import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Pencil } from "lucide-react";
import {
  deleteMustahsil,
  getAllSirketler,
  updateMustahsil,
} from "../../../shared/api/index.js";
import { toDigits, formatTelefon, formatTcKimlikNo } from "../../../shared/utils/formatters.js";
import { parseBackendErrors } from "../../../shared/utils/parseBackendErrors.js";
import { validateTc, validateTelefon, validateSifre } from "../../../shared/utils/validators.js";
import { FormInput, FormSelect, FormTextarea, ModalShell } from "../../../shared/ui/index.js";

const emptyForm = { isletmeUnvani: "", no: "", cariKod: "", adres: "", sirketId: "", ad: "", soyad: "", tcKimlikNo: "", telefon: "", eposta: "", sifre: "" };
const MUSTAHSIL_FIELD_LABELS = { request: "Form Verisi", isletmeUnvani: "Ünvan", no: "İşletme No", cariKod: "Cari Kod", adres: "Adres", sirketId: "Şirket", ad: "Yetkili Ad", soyad: "Yetkili Soyad", tcKimlikNo: "TC Kimlik No", telefon: "Telefon", eposta: "E-posta", sifre: "Şifre" };

const resolveSirketId = (rawValue, sirketler) => {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  const byId = sirketler.find((s) => s.id === raw);
  if (byId) return byId.id;
  const byName = sirketler.find((s) => String(s.ad || "").toLowerCase() === raw.toLowerCase());
  return byName?.id || "";
};

export default function ManageMustahsilModal({ isOpen, mustahsil, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState(emptyForm);
  const [sirketler, setSirketler] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !mustahsil) return;
    setForm({
      isletmeUnvani: mustahsil.isletmeUnvani || "",
      no: mustahsil.no || "",
      cariKod: mustahsil.cariKod || "",
      adres: mustahsil.adres || "",
      sirketId: mustahsil.sirketAdi || "",
      ad: mustahsil.ad || "",
      soyad: mustahsil.soyad || "",
      tcKimlikNo: formatTcKimlikNo(mustahsil.tcKimlikNo || ""),
      telefon: formatTelefon(mustahsil.telefon || ""),
      eposta: mustahsil.eposta || "",
      sifre: "",
    });
    setFieldErrors({});
    setGeneralError("");
    getAllSirketler()
      .then((data) => setSirketler(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [isOpen, mustahsil]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === "tcKimlikNo") next = formatTcKimlikNo(value);
    if (name === "telefon") next = formatTelefon(value);
    if (name === "sifre") next = toDigits(value).slice(0, 6);
    setForm((p) => ({ ...p, [name]: next }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const tcErr = validateTc(form.tcKimlikNo);
    if (tcErr) nextErrors.tcKimlikNo = tcErr;
    const telErr = validateTelefon(form.telefon, true);
    if (telErr) nextErrors.telefon = telErr;
    const sifre = String(form.sifre || "").trim();
    if (sifre) {
      const sifreErr = validateSifre(form.sifre, false);
      if (sifreErr) nextErrors.sifre = sifreErr;
    }
    if (!form.no.trim()) nextErrors.no = "İşletme No alanı zorunludur.";
    if (!form.ad.trim()) nextErrors.ad = "Yetkili Ad alanı zorunludur.";
    if (!form.soyad.trim()) nextErrors.soyad = "Yetkili Soyad alanı zorunludur.";
    if (!resolveSirketId(form.sirketId, sirketler)) nextErrors.sirketId = "Lütfen listeden geçerli bir şirket seçiniz.";
    const sirketId = resolveSirketId(form.sirketId, sirketler);
    return { nextErrors, sirketId };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mustahsil) return;
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    const { nextErrors, sirketId } = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setGeneralError(Object.values(nextErrors)[0]);
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      tcKimlikNo: toDigits(form.tcKimlikNo).slice(0, 11),
      telefon: toDigits(form.telefon).slice(0, 11),
      sirketId,
      cariKod: form.cariKod.trim() || null,
      adres: form.adres.trim() || null,
      eposta: form.eposta.trim() || null,
      sifre: form.sifre.trim() || null,
    };

    try {
      const updated = await updateMustahsil(mustahsil.id, payload);
      onUpdated?.(updated);
      onClose();
    } catch (error) {
      const parsed = parseBackendErrors(error, MUSTAHSIL_FIELD_LABELS);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!mustahsil) return;
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kaydı silmek üzeresiniz. Bu işlem geri alınabilir ancak listeden kaldırılacaktır.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMustahsil(mustahsil.id);
      onDeleted?.(mustahsil.id);
      onClose();
    } catch (error) {
      await Swal.fire({ title: "Hata", text: error?.response?.data?.message || "Kayıt silinemedi.", icon: "error" });
    }
  };

  const handleBackdropClose = () => {
    if (submitting) return;
    onClose();
  };

  if (!isOpen || !mustahsil) return null;

  const footer = (
    <div className="flex items-center justify-between">
      <button type="button" onClick={handleDelete} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100" disabled={submitting}>
        Sil
      </button>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={submitting}>
          Vazgeç
        </button>
        <button type="submit" form="manage-mustahsil-form" className="rounded-lg border border-blue-600 bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );

  return (
    <ModalShell title="Müstahsil Kaydı Yönetimi" subtitle="İşletme ve bağlı çalışan bilgilerini düzenleyin." icon={Pencil} onClose={onClose} onClickBackdrop={handleBackdropClose} footer={footer}>
      <form id="manage-mustahsil-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {generalError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Ünvan" name="isletmeUnvani" value={form.isletmeUnvani} onChange={handleChange} error={fieldErrors.isletmeUnvani} />
            <FormInput label="Cari Kod" name="cariKod" value={form.cariKod} onChange={handleChange} error={fieldErrors.cariKod} />
            <FormInput label="İşletme No" name="no" value={form.no} onChange={handleChange} error={fieldErrors.no} placeholder="Örn: ISL-0001" required />
            <FormSelect label="Şirket" name="sirketId" value={form.sirketId} onChange={handleChange} error={fieldErrors.sirketId} options={sirketler.map((s) => ({ id: s.id, ad: s.ad }))} required />
            <FormInput label="Yetkili Ad" name="ad" value={form.ad} onChange={handleChange} error={fieldErrors.ad} required />
            <FormInput label="Yetkili Soyad" name="soyad" value={form.soyad} onChange={handleChange} error={fieldErrors.soyad} required />
            <FormInput label="TC Kimlik No" name="tcKimlikNo" value={form.tcKimlikNo} onChange={handleChange} error={fieldErrors.tcKimlikNo} placeholder="12345678901" required />
            <FormInput label="Telefon" name="telefon" value={form.telefon} onChange={handleChange} error={fieldErrors.telefon} placeholder="05xx xxx xx xx" required />
            <FormInput label="E-posta" name="eposta" value={form.eposta} onChange={handleChange} error={fieldErrors.eposta} placeholder="örnek@mail.com" wrapperClassName="col-span-2" />
            <FormInput label="Yeni Şifre (Opsiyonel)" name="sifre" type="password" value={form.sifre} onChange={handleChange} error={fieldErrors.sifre} wrapperClassName="col-span-2" placeholder="6 haneli rakam veya boş bırakın" showPasswordHint maxLength={6} inputMode="numeric" autoComplete="new-password" />
            <FormTextarea label="Adres" name="adres" value={form.adres} onChange={handleChange} error={fieldErrors.adres} wrapperClassName="col-span-2" />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
