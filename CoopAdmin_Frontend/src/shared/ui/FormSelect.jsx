/**
 * Form: modal seçimleri.
 * FilterCombobox: filtre satırı — metin alanı “Hızlı Bul” ile aynı ölçü ve stilde.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Check, ChevronDown } from "lucide-react";

/** Filtre satırında tüm kontroller aynı yükseklikte */
export const FILTER_CONTROL_HEIGHT = "h-11";

/** Tek başına kullanılan tam genişlik arama kutusu (Hızlı Bul / Kimlik araması) — dropdown metin alanıyla hizalı */
export const FILTER_BAR_TEXT_INPUT_CLASS = `w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${FILTER_CONTROL_HEIGHT}`;

const triggerNormalClass =
  "border border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const triggerErrorClass =
  "border border-red-500 bg-white ring-1 ring-red-200/80 focus:border-red-500 focus:ring-2 focus:ring-red-100";

const panelClass =
  "max-h-56 overflow-y-auto rounded-lg border border-slate-300 bg-white py-0 shadow-lg ring-1 ring-slate-900/[0.04]";

const itemClass =
  "flex w-full cursor-pointer items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5 text-left text-sm leading-snug text-slate-900 last:border-b-0 hover:bg-slate-50";

const focusRingInset = "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-100";

function getDisplayLabel(value, options) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.ad;
  const byName = options.find((o) => String(o.ad || "").toLowerCase() === raw.toLowerCase());
  if (byName) return byName.ad;
  return raw;
}

function useDropdownPosition(open, triggerRef) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  useEffect(() => {
    if (!open) return undefined;
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, triggerRef]);
  return pos;
}

function useClickOutside(open, onClose, triggerRef, panelRef) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      const t = e.target;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose, triggerRef, panelRef]);
}

function panelWidthStyle(pos, fallbackWidth) {
  const w = pos.width > 12 ? pos.width : fallbackWidth;
  if (typeof window === "undefined") {
    return { top: pos.top, left: pos.left, width: w, minWidth: w };
  }
  const maxLeft = window.innerWidth - w - 12;
  const left = Math.min(pos.left, Math.max(8, maxLeft));
  return { top: pos.top, left, width: w, minWidth: w };
}

export function FilterCombobox({
  name = "",
  value,
  onChange,
  options = [],
  placeholder = "",
  className = "",
  error = false,
  panelMinWidth = 280,
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const pos = useDropdownPosition(open, triggerRef);
  const panelDims = useMemo(() => panelWidthStyle(pos, panelMinWidth), [pos, panelMinWidth]);

  const filtered = useMemo(() => {
    if (!open) return [];
    const list = Array.isArray(options) ? options : [];
    const q = String(value ?? "").trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => String(o.ad || "").toLowerCase().includes(q));
  }, [options, open, value]);

  const close = () => setOpen(false);

  useClickOutside(open, close, triggerRef, panelRef);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const selectOption = (opt) => {
    onChange({ target: { name, value: opt.ad } });
    close();
  };

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: panelDims.top,
          left: panelDims.left,
          width: panelDims.width,
          minWidth: panelDims.minWidth,
          maxWidth: panelDims.width,
          zIndex: 10000,
        }}
        className={panelClass}
      >
        <ul className="py-0" role="listbox">
          {filtered.length === 0 ? (
            <li className="border-0 px-3.5 py-3 text-sm text-slate-500">Sonuç yok</li>
          ) : (
            filtered.map((opt) => (
              <li key={String(opt.id)} className="m-0 list-none p-0">
                <button
                  type="button"
                  title={opt.ad}
                  className={itemClass}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(opt)}
                >
                  <span className="min-w-0 flex-1 break-words">{opt.ad}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>,
      document.body,
    );

  const boxRing = error ? "border-red-500 ring-1 ring-red-200/80" : "border-slate-300";

  return (
    <div ref={triggerRef} className={`relative min-w-0 ${className}`}>
      <div
        className={`flex min-h-0 min-w-0 items-stretch overflow-hidden rounded-lg border bg-white shadow-sm ${boxRing} ${FILTER_CONTROL_HEIGHT}`}
      >
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e)}
          placeholder={placeholder}
          title={value || placeholder}
          className={`min-h-0 min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm text-slate-800 placeholder:text-slate-400 ${focusRingInset} ${error ? "focus:ring-red-100" : ""}`}
        />
        <button
          type="button"
          aria-label="Listeyi aç"
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex w-11 shrink-0 items-center justify-center gap-0.5 border-l border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 ${error ? "border-red-200" : ""}`}
        >
          {error ? <AlertCircle size={15} className="shrink-0 text-red-500" aria-hidden /> : null}
          <ChevronDown size={17} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {panel}
    </div>
  );
}

function FormCombo({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Listeden seçin veya arayın",
  error,
  required = false,
  panelMinWidth = 300,
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const listId = useId();
  const pos = useDropdownPosition(open, triggerRef);
  const panelDims = useMemo(() => panelWidthStyle(pos, panelMinWidth), [pos, panelMinWidth]);

  const selectedLabel = useMemo(() => getDisplayLabel(value, options), [value, options]);

  const listItems = useMemo(() => (Array.isArray(options) ? options : []), [options]);

  const close = () => setOpen(false);

  useClickOutside(open, close, triggerRef, panelRef);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.ad } });
    close();
  };

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: panelDims.top,
          left: panelDims.left,
          width: panelDims.width,
          minWidth: panelDims.minWidth,
          maxWidth: panelDims.width,
          zIndex: 10000,
        }}
        className={panelClass}
        role="listbox"
        id={listId}
      >
        <ul className="py-0">
          {listItems.length === 0 ? (
            <li className="border-0 px-3.5 py-3 text-sm text-slate-500">Seçenek yok</li>
          ) : (
            listItems.map((opt) => {
              const selected =
                selectedLabel && String(selectedLabel).toLowerCase() === String(opt.ad || "").toLowerCase();
              return (
                <li key={String(opt.id)} className="m-0 list-none p-0">
                  <button
                    type="button"
                    role="option"
                    title={opt.ad}
                    aria-selected={selected}
                    className={`${itemClass} ${selected ? "bg-blue-50/90" : ""}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="min-w-0 flex-1 break-words">{opt.ad}</span>
                    {selected ? <Check size={16} className="shrink-0 text-blue-600" /> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>,
      document.body,
    );

  return (
    <>
      <div ref={triggerRef} className="relative min-w-0">
        <button
          type="button"
          id={`${name}-trigger`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error}
          aria-required={required}
          aria-controls={listId}
          title={selectedLabel || placeholder}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3.5 text-left text-sm outline-none transition focus:ring-2 ${FILTER_CONTROL_HEIGHT} ${
            error ? triggerErrorClass : triggerNormalClass
          } ${!selectedLabel ? "text-slate-500" : "text-slate-900"}`}
        >
          <span className="min-w-0 flex-1 truncate text-left">{selectedLabel || placeholder}</span>
          <span className="flex shrink-0 items-center gap-1.5">
            {error ? <AlertCircle size={16} className="text-red-500" aria-hidden /> : null}
            <ChevronDown size={18} className={`text-slate-600 transition ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      </div>
      {panel}
    </>
  );
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  error,
  options = [],
  required = false,
  wrapperClassName = "",
  placeholder = "Listeden seçin veya arayın",
  panelMinWidth = 300,
}) {
  return (
    <label className={`block min-w-0 ${wrapperClassName}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <FormCombo
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        error={!!error}
        required={!!required}
        panelMinWidth={panelMinWidth}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
