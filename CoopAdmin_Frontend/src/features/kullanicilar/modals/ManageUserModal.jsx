import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Pencil } from "lucide-react";
import {
  deleteKullanici,
  getAllRoller,
  getAllSirketler,
  updateKullanici,
} from "../../../shared/api/index.js";
import { toDigits, formatTcKimlikNo, formatTelefon } from "../../../shared/utils/formatters.js";
import { parseBackendErrors } from "../../../shared/utils/parseBackendErrors.js";
import { validateTelefon, validateSifre } from "../../../shared/utils/validators.js";
import { FormInput, FormSelect, ModalShell } from "../../../shared/ui/index.js";

const emptyForm = { ad: "", soyad: "", tcKimlikNo: "", sifre: "", telefonNo: "", eposta: "", sirketId: "", rolId: "" };
const KULLANICI_FIELD_LABELS = { request: "Form Verisi", ad: "Ad", soyad: "Soyad", tcKimlikNo: "TC Kimlik No", sifre: "Şifre", telefonNo: "Telefon", eposta: "E-posta", sirketId: "Şirket", rolId: "Rol" };

const resolveOptionId = (rawValue, options) => {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.id;
  const byName = options.find((o) => String(o.ad || "").toLowerCase() === raw.toLowerCase());
  return byName?.id || "";
};

export default function ManageUserModal({ isOpen, user, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sirketler, setSirketler] = useState([]);
  const [roller, setRoller] = useState([]);

  const identityRoles = useMemo(
    () => roller.filter((r) => !String(r?.ad || "").toLowerCase().includes("müstahsil") && !String(r?.ad || "").toLowerCase().includes("mustahsil")),
    [roller],
  );

  useEffect(() => {
    if (!isOpen || !user) return;
    setForm({
      ad: user.ad || "",
      soyad: user.soyad || "",
      tcKimlikNo: formatTcKimlikNo(user.tcKimlikNo || ""),
      sifre: "",
      telefonNo: formatTelefon(user.telefonNo || ""),
      eposta: user.eposta || "",
      sirketId: user.sirketAdi || "",
      rolId: user.rolAdi || "",
    });
    setFieldErrors({});
    setGeneralError("");
    Promise.all([getAllSirketler(), getAllRoller()])
      .then(([sData, rData]) => {
        setSirketler(Array.isArray(sData) ? sData : []);
        setRoller(Array.isArray(rData) ? rData : []);
      })
      .catch(() => setGeneralError("Şirket ve rol listesi yüklenirken bir hata oluştu."));
  }, [isOpen, user]);

  const selectedRole = useMemo(
    () => identityRoles.find((r) => r.id === form.rolId || String(r.ad || "").toLowerCase() === String(form.rolId || "").toLowerCase()) ?? null,
    [identityRoles, form.rolId],
  );
  const title = selectedRole?.ad ? `${selectedRole.ad} Kaydı Yönetimi` : "Çalışan Kaydı Yönetimi";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === "tcKimlikNo") next = formatTcKimlikNo(value);
    if (name === "telefonNo") next = formatTelefon(value);
    if (name === "sifre") next = toDigits(value).slice(0, 6);
    setForm((p) => ({ ...p, [name]: next }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const tc = toDigits(form.tcKimlikNo).slice(0, 11);
    const telefon = toDigits(form.telefonNo).slice(0, 11);
    const sirketId = resolveOptionId(form.sirketId, sirketler);
    const rolId = resolveOptionId(form.rolId, identityRoles);
    const sifre = String(form.sifre || "").trim();

    if (!form.ad.trim()) nextErrors.ad = "Ad alanı zorunludur.";
    if (!form.soyad.trim()) nextErrors.soyad = "Soyad alanı zorunludur.";
    if (tc.length !== 11) nextErrors.tcKimlikNo = "TC Kimlik No 11 haneli olmalıdır.";
    const telErr = validateTelefon(form.telefonNo, true);
    if (telErr) nextErrors.telefonNo = telErr;
    if (!sirketId) nextErrors.sirketId = "Lütfen listeden geçerli bir şirket seçiniz.";
    if (!rolId) nextErrors.rolId = "Lütfen listeden geçerli bir rol seçiniz.";
    if (sifre) {
      const sifreErr = validateSifre(form.sifre, false);
      if (sifreErr) nextErrors.sifre = sifreErr;
    }

    return { nextErrors, sirketId, rolId };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

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
      sifre: form.sifre.trim() || null,
      telefonNo: toDigits(form.telefonNo).slice(0, 11),
      eposta: form.eposta.trim() || null,
      sirketId,
      rolId,
      mustahsilNo: null,
      cariKod: null,
      adres: null,
    };

    try {
      const updated = await updateKullanici(user.id, payload);
      onUpdated?.(updated);
      onClose();
    } catch (error) {
      const parsed = parseBackendErrors(error, KULLANICI_FIELD_LABELS);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu kaydı sistemden kaldırmak istediğinizden emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteKullanici(user.id);
      onDeleted?.(user.id);
      onClose();
    } catch (error) {
      await Swal.fire({ title: "Hata", text: error?.response?.data?.message || "Kayıt silinirken bir hata oluştu.", icon: "error" });
    }
  };

  const handleBackdropClose = () => {
    if (submitting) return;
    onClose();
  };

  if (!isOpen || !user) return null;

  const footer = (
    <div className="flex items-center justify-between">
      <button type="button" onClick={handleDelete} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100" disabled={submitting}>
        Sil
      </button>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" disabled={submitting}>
          Vazgeç
        </button>
        <button type="submit" form="manage-user-form" className="min-w-36 rounded-lg border border-blue-600 bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );

  return (
    <ModalShell title={title} subtitle="Kayıt kartı üzerinden düzenleme ve silme işlemleri." icon={Pencil} onClose={onClose} onClickBackdrop={handleBackdropClose} footer={footer}>
      <form id="manage-user-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {generalError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Ad" name="ad" value={form.ad} onChange={handleChange} error={fieldErrors.ad} required />
            <FormInput label="Soyad" name="soyad" value={form.soyad} onChange={handleChange} error={fieldErrors.soyad} required />
            <FormInput label="TC Kimlik No" name="tcKimlikNo" value={form.tcKimlikNo} onChange={handleChange} error={fieldErrors.tcKimlikNo} placeholder="12345678901" required />
            <FormInput label="Telefon" name="telefonNo" value={form.telefonNo} onChange={handleChange} error={fieldErrors.telefonNo} placeholder="05xx xxx xx xx" required />
            <FormSelect label="Şirket" name="sirketId" value={form.sirketId} onChange={handleChange} error={fieldErrors.sirketId} options={sirketler.map((s) => ({ id: s.id, ad: s.ad }))} required />
            <FormSelect label="Rol" name="rolId" value={form.rolId} onChange={handleChange} error={fieldErrors.rolId} options={identityRoles.map((r) => ({ id: r.id, ad: r.ad }))} required />
            <FormInput label="E-posta" name="eposta" value={form.eposta} onChange={handleChange} error={fieldErrors.eposta} placeholder="örnek@mail.com" wrapperClassName="col-span-2" />
            <FormInput label="Yeni Şifre (Opsiyonel)" name="sifre" type="password" value={form.sifre} onChange={handleChange} error={fieldErrors.sifre} wrapperClassName="col-span-2" placeholder="6 haneli rakam veya boş bırakın" showPasswordHint maxLength={6} inputMode="numeric" autoComplete="new-password" />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
