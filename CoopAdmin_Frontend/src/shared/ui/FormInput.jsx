import { CircleHelp } from "lucide-react";

const inputBaseClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:font-light placeholder:text-slate-400 outline-none transition focus:ring-2";
const inputErrorClass = "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100";
const inputNormalClass = "bg-white focus:border-blue-500 focus:ring-blue-100";

const PASSWORD_HINT = (
  <>
    Şifre kuralları:
    <br />- Tam 6 hane
    <br />- Sadece rakam (0–9)
  </>
);

export default function FormInput({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  placeholder = "",
  wrapperClassName = "",
  showPasswordHint = false,
  disabled = false,
  maxLength,
  inputMode,
  autoComplete,
}) {
  return (
    <label className={`relative block ${wrapperClassName}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
        {showPasswordHint ? (
          <span className="group relative ml-1.5 inline-flex align-middle">
            <CircleHelp size={13} className="text-slate-400" />
            <span className="pointer-events-none absolute left-0 top-full z-40 mt-1.5 w-72 max-w-[85vw] rounded-md border border-slate-200 bg-white p-2 text-[11px] normal-case tracking-normal text-slate-600 opacity-0 shadow-lg transition group-hover:opacity-100">
              {PASSWORD_HINT}
            </span>
          </span>
        ) : null}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || `${label} giriniz`}
        disabled={disabled}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`${inputBaseClass} ${error ? inputErrorClass : inputNormalClass} ${disabled ? "disabled:cursor-not-allowed disabled:bg-slate-100" : ""}`}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
