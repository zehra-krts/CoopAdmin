import { useState } from "react";
import Swal from "sweetalert2";
import { Building2 } from "lucide-react";
import { createSirket } from "../../../shared/api/index.js";
import { parseBackendErrors } from "../../../shared/utils/parseBackendErrors.js";
import { validateTelefon, validateEmail } from "../../../shared/utils/validators.js";
import { FormInput, FormTextarea, ModalShell } from "../../../shared/ui/index.js";

// Alanlar SirketCreateDto ile uyumlu (Eposta zorunlu — veritabanı NOT NULL).
const initialForm = {
  ad: "",
  eposta: "",
  telefon: "",
  vergiNo: "",
  adres: "",
};

const SIRKET_FIELD_LABELS = {
  request: "Form Verisi",
  ad: "Şirket Adı",
  eposta: "E-posta",
  telefon: "Telefon",
  vergiNo: "Vergi No",
  adres: "Adres",
};

export default function AddSirketModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setFieldErrors({});
    setGeneralError("");
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      const created = await createSirket(payload);
      onCreated?.(created);
      setForm(initialForm);
      onClose?.();
    } catch (error) {
      const parsed = parseBackendErrors(error, SIRKET_FIELD_LABELS);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.message);
      if (parsed.message) {
        await Swal.fire({
          title: "Uyarı",
          text: parsed.message,
          icon: "warning",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Tamam",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        onClick={handleClose}
        disabled={submitting}
      >
        Vazgeç
      </button>
      <button
        type="submit"
        form="add-sirket-form"
        className="rounded-md border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Kaydediliyor..." : "Şirketi Kaydet"}
      </button>
    </div>
  );

  return (
    <ModalShell
      title="Yeni Şirket Tanımla"
      subtitle="Şirket kaydını sisteme güvenle ekleyin."
      icon={Building2}
      onClose={handleClose}
      onClickBackdrop={handleClose}
      footer={footer}
    >
      <form id="add-sirket-form" onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          {generalError ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Şirket Adı" name="ad" value={form.ad} onChange={handleChange} error={fieldErrors.ad} required />
            <FormInput label="E-posta" name="eposta" type="email" value={form.eposta} onChange={handleChange} error={fieldErrors.eposta} placeholder="ornek@sirket.com" required />
            <FormInput label="Telefon" name="telefon" value={form.telefon} onChange={handleChange} error={fieldErrors.telefon} placeholder="05xx xxx xx xx" required />
            <FormInput label="Vergi No" name="vergiNo" value={form.vergiNo} onChange={handleChange} error={fieldErrors.vergiNo} placeholder="1234567890" />
          </div>
          <FormTextarea label="Adres" name="adres" value={form.adres} onChange={handleChange} error={fieldErrors.adres} rows={4} wrapperClassName="col-span-2" />
        </div>
      </form>
    </ModalShell>
  );
}
