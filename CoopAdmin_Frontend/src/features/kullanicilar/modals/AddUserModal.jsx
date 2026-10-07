import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import {
  createKullanici,
  getAllRoller,
  getAllSirketler,
} from "../../../shared/api/index.js";
import { toDigits, formatTcKimlikNo, formatTelefon } from "../../../shared/utils/formatters.js";
import { parseBackendErrors } from "../../../shared/utils/parseBackendErrors.js";
import { validateTelefon, validateSifre } from "../../../shared/utils/validators.js";
import { FormInput, FormSelect, ModalShell } from "../../../shared/ui/index.js";

const initialForm = { ad: "", soyad: "", tcKimlikNo: "", sifre: "", telefonNo: "", eposta: "", sirketId: "", rolId: "" };
const KULLANICI_FIELD_LABELS = { request: "Form Verisi", ad: "Ad", soyad: "Soyad", tcKimlikNo: "TC Kimlik No", sifre: "Şifre", telefonNo: "Telefon", eposta: "E-posta", sirketId: "Şirket", rolId: "Rol" };

const resolveOptionId = (rawValue, options) => {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.id;
  const byName = options.find((o) => String(o.ad || "").toLowerCase() === raw.toLowerCase());
  return byName?.id || "";
};

export default function AddUserModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [sirketler, setSirketler] = useState([]);
  const [roller, setRoller] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const identityRoles = useMemo(
    () => roller.filter((r) => !String(r?.ad || "").toLowerCase().includes("müstahsil") && !String(r?.ad || "").toLowerCase().includes("mustahsil")),
    [roller],
  );

  useEffect(() => {
    if (!isOpen) return;
    setGeneralError("");
    setLoadingOptions(true);
    Promise.all([getAllSirketler(), getAllRoller()])
      .then(([sData, rData]) => {
        setSirketler(Array.isArray(sData) ? sData : []);
        setRoller(Array.isArray(rData) ? rData : []);
      })
      .catch(() => setGeneralError("Şirket ve rol listesi yüklenirken bir hata oluştu."))
      .finally(() => setLoadingOptions(false));
  }, [isOpen]);

  const selectedRole = useMemo(
    () => identityRoles.find((r) => r.id === form.rolId || String(r.ad || "").toLowerCase() === String(form.rolId || "").toLowerCase()) ?? null,
    [identityRoles, form.rolId],
  );
  const modalTitle = selectedRole?.ad ? `Yeni ${selectedRole.ad} Tanımla` : "Yeni Çalışan Tanımla";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === "tcKimlikNo") next = formatTcKimlikNo(value);
    if (name === "telefonNo") next = formatTelefon(value);
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
    const tc = toDigits(form.tcKimlikNo).slice(0, 11);
    const telefon = toDigits(form.telefonNo).slice(0, 11);
    const sirketId = resolveOptionId(form.sirketId, sirketler);
    const rolId = resolveOptionId(form.rolId, identityRoles);

    if (!form.ad.trim()) nextErrors.ad = "Ad alanı zorunludur.";
    if (!form.soyad.trim()) nextErrors.soyad = "Soyad alanı zorunludur.";
    if (tc.length !== 11) nextErrors.tcKimlikNo = "TC Kimlik No 11 haneli olmalıdır.";
    const telErr = validateTelefon(form.telefonNo, true);
    if (telErr) nextErrors.telefonNo = telErr;
    if (!sirketId) nextErrors.sirketId = "Lütfen listeden geçerli bir şirket seçiniz.";
    if (!rolId) nextErrors.rolId = "Lütfen listeden geçerli bir rol seçiniz.";
    const sifreErr = validateSifre(form.sifre, true);
    if (sifreErr) nextErrors.sifre = sifreErr;

    return { nextErrors, sirketId, rolId };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneralError("");
    setFieldErrors({});

    const { nextErrors, sirketId, rolId } = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setGeneralError(Object.values(nextErrors)[0]);
      setSubmitting(false);
      return;
    }

    const payload = {
      ad: form.ad.trim(),
      soyad: form.soyad.trim(),
      tcKimlikNo: toDigits(form.tcKimlikNo).slice(0, 11),
      sifre: form.sifre,
      telefonNo: toDigits(form.telefonNo).slice(0, 11),
      eposta: form.eposta.trim() || null,
      sirketId,
      rolId,
      mustahsilNo: null,
      cariKod: null,
      adres: null,
    };

    try {
      const created = await createKullanici(payload);
      onCreated(created);
      setForm(initialForm);
      setFieldErrors({});
      setGeneralError("");
      onClose();
    } catch (error) {
      const parsed = parseBackendErrors(error, KULLANICI_FIELD_LABELS);
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
      <button type="submit" form="add-user-form" className="min-w-40 rounded-lg border border-blue-600 bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={submitting || loadingOptions}>
        {submitting ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  );

  return (
    <ModalShell title={modalTitle} subtitle="Sadece sistem çalışanı rollerini yönetir." icon={User} onClose={handleClose} onClickBackdrop={handleClose} footer={footer}>
      <form id="add-user-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {generalError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p> : null}
          {loadingOptions ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">Şirket ve rol listeleri yükleniyor...</div> : null}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Ad" name="ad" value={form.ad} onChange={handleChange} error={fieldErrors.ad} placeholder="Örn: Ahmet" required />
            <FormInput label="Soyad" name="soyad" value={form.soyad} onChange={handleChange} error={fieldErrors.soyad} placeholder="Örn: Yılmaz" required />
            <FormInput label="TC Kimlik No" name="tcKimlikNo" value={form.tcKimlikNo} onChange={handleChange} error={fieldErrors.tcKimlikNo} placeholder="12345678901" required />
            <FormInput label="Telefon" name="telefonNo" value={form.telefonNo} onChange={handleChange} error={fieldErrors.telefonNo} placeholder="05xx xxx xx xx" required />
            <FormSelect label="Şirket" name="sirketId" value={form.sirketId} onChange={handleChange} error={fieldErrors.sirketId} options={sirketler.map((s) => ({ id: s.id, ad: s.ad }))} required />
            <FormSelect label="Rol" name="rolId" value={form.rolId} onChange={handleChange} error={fieldErrors.rolId} options={identityRoles.map((r) => ({ id: r.id, ad: r.ad }))} required />
            <FormInput label="E-posta" name="eposta" value={form.eposta} onChange={handleChange} error={fieldErrors.eposta} placeholder="örnek@mail.com" wrapperClassName="col-span-2" />
            <FormInput label="Şifre" name="sifre" type="password" value={form.sifre} onChange={handleChange} error={fieldErrors.sifre} placeholder="6 haneli rakam (örn: 123456)" wrapperClassName="col-span-2" showPasswordHint required maxLength={6} inputMode="numeric" autoComplete="new-password" />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
