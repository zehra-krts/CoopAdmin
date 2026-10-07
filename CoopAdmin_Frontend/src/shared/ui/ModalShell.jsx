import { X } from "lucide-react";

/**
 * Sağ panel modal kabuğu.
 * title, subtitle, icon, onClose, children, footer alanları parent tarafından belirlenir.
 */
export default function ModalShell({
  title,
  subtitle = "",
  icon: Icon = null,
  onClose,
  children,
  footer,
  onClickBackdrop,
}) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && onClickBackdrop) {
      onClickBackdrop();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-[1px]"
      onClick={handleBackdrop}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between bg-blue-600 px-5 py-4 text-white">
          <div className="flex items-start gap-3">
            {Icon ? (
              <span className="mt-0.5 inline-flex rounded-lg bg-white/20 p-2">
                <Icon size={16} />
              </span>
            ) : null}
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {subtitle ? <p className="text-xs text-blue-100">{subtitle}</p> : null}
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 hover:text-white"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
          {footer ? (
            <div className="mt-auto border-t border-slate-200 bg-white px-5 py-3">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
