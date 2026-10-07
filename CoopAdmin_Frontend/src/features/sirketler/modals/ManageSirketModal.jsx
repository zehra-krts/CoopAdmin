import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Pencil } from "lucide-react";
import { deleteSirket, updateSirket } from "../../../shared/api/index.js";
import { parseBackendErrors } from "../../../shared/utils/parseBackendErrors.js";
import { validateTelefon, validateEmail } from "../../../shared/utils/validators.js";
import { FormInput, FormTextarea, ModalShell } from "../../../shared/ui/index.js";

// SirketUpdateDto ile uyumlu; tel/telefon API'den gelebilir.
const emptyForm = { ad: "", eposta: "", telefon: "", vergiNo: "", adres: "" };
const SIRKET_FIELD_LABELS = { request: "Form Verisi", ad: "Şirket Adı", eposta: "E-posta", telefon: "Telefon", vergiNo: "Vergi No", adres: "Adres" };

export default function ManageSirketModal({ isOpen, sirket, loading, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (!isOpen || !sirket) return;
    setForm({
      ad: sirket.ad || "",
      eposta: sirket.eposta || "",
      telefon: sirket.telefon || sirket.tel || "",
      vergiNo: sirket.vergiNo || "",
      adres: sirket.adres || "",
    });
    setFieldErrors({});
    setGeneralError("");
  }, [isOpen, sirket]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!sirket?.id) return;

    setSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    const nextErrors = {};
    if (!form.ad.trim()) nextErrors.ad = "Şirket Adı alanı zorunludur.";
    const emailErr = !form.eposta.trim()
      ? "E-posta alanı zorunludur."
      : validateEmail(form.eposta);
    if (emailErr) nextErrors.eposta = emailErr;
    const telErr = validateTelefon(form.telefon, true);
    if (telErr) nextErrors.telefon = telErr;

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setGeneralError(Object.values(nextErrors)[0]);
      setSubmitting(false);
      return;
    }

    const payload = {
      ad: form.ad.trim(),
      eposta: form.eposta.trim(),
      telefon: form.telefon.trim(),
      vergiNo: form.vergiNo.trim(),
      adres: form.adres.trim(),
    };

    try {
      const updated = await updateSirket(sirket.id, payload);
      onUpdated?.(updated);
      onClose?.();
    } catch (error) {
      const parsed = parseBackendErrors(error, SIRKET_FIELD_LABELS);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.message);
      if (parsed.message) {
        await Swal.fire({ title: "Uyarı", text: parsed.message, icon: "warning", confirmButtonColor: "#2563eb", confirmButtonText: "Tamam" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!sirket?.id) return;
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
      await deleteSirket(sirket.id);
      onDeleted?.(sirket.id);
      onClose?.();
    } catch (error) {
      await Swal.fire({ title: "Hata", text: error?.response?.data?.message || "Kayıt silinirken bir hata oluştu.", icon: "error", confirmButtonColor: "#2563eb" });
    }
  };

  const handleBackdropClose = () => {
    if (submitting || loading) return;
    onClose?.();
  };

  const footer = (
    <div className="flex items-center justify-between">
      <button type="button" className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100" onClick={handleDelete} disabled={submitting || loading}>
        Sil
      </button>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={onClose} disabled={submitting}>
          Vazgeç
        </button>
        <button type="submit" form="manage-sirket-form" className="rounded-md border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting || loading}>
          {submitting ? "Güncelleniyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );

  return (
    <ModalShell title="Şirket Kaydı Yönetimi" subtitle="Mevcut şirket bilgilerini güncelleyin." icon={Pencil} onClose={onClose} onClickBackdrop={handleBackdropClose} footer={footer}>
      <form id="manage-sirket-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {loading ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">Şirket bilgileri yükleniyor...</div> : null}
          {generalError ? <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p> : null}
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Şirket Adı" name="ad" value={form.ad} onChange={handleChange} error={fieldErrors.ad} required disabled={loading} />
            <FormInput label="E-posta" name="eposta" type="email" value={form.eposta} onChange={handleChange} error={fieldErrors.eposta} placeholder="ornek@sirket.com" required disabled={loading} />
            <FormInput label="Telefon" name="telefon" value={form.telefon} onChange={handleChange} error={fieldErrors.telefon} placeholder="05xx xxx xx xx" required disabled={loading} />
            <FormInput label="Vergi No" name="vergiNo" value={form.vergiNo} onChange={handleChange} error={fieldErrors.vergiNo} placeholder="1234567890" disabled={loading} />
          </div>
          <FormTextarea label="Adres" name="adres" value={form.adres} onChange={handleChange} error={fieldErrors.adres} rows={4} wrapperClassName="col-span-2" disabled={loading} />
        </div>
      </form>
    </ModalShell>
  );
}
