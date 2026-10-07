const textareaBaseClass =
  "w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2";
const textareaErrorClass = "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100";
const textareaNormalClass = "bg-white focus:border-blue-500 focus:ring-blue-100";

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  rows = 2,
  placeholder = "",
  wrapperClassName = "",
  disabled = false,
}) {
  return (
    <label className={`block ${wrapperClassName}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
      <textarea
        disabled={disabled}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder || `${label} giriniz`}
        className={`${textareaBaseClass} ${error ? textareaErrorClass : textareaNormalClass} ${disabled ? "disabled:cursor-not-allowed disabled:bg-slate-100" : ""}`}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
