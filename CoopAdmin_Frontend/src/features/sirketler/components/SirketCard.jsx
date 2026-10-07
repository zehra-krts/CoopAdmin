export default function SirketCard({ sirket, onDetail, onEdit, onToggleDurum, togglingDurumId }) {
  const isAktif = Number(sirket?.durum) === 1;
  const isToggling = togglingDurumId === sirket?.id;

  return (
    <div
      className="grid min-w-[980px] grid-cols-12 items-center rounded-lg border-l-4 border-blue-500 border-y border-r border-blue-100 bg-blue-50/60 px-3 py-2.5 shadow-sm transition hover:bg-blue-100/50 cursor-pointer"
      onClick={() => onDetail?.(sirket)}
    >
      <div className="col-span-6 min-w-0 pr-4">
        <div className="inline-flex max-w-full items-center gap-2.5">
          <h3 className="min-w-0 max-w-full truncate text-sm font-semibold text-slate-900">{sirket.ad || "-"}</h3>
          <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-semibold text-white">
            {sirket.tel || sirket.telefon || "-"}
          </span>
        </div>
      </div>

      <div className="col-span-2">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-md border border-blue-200 bg-white/90 px-1.5 py-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Müstahsil</p>
            <p className="text-sm font-bold text-slate-900">{sirket.mustahsilSayisi ?? 0}</p>
          </div>
          <div className="rounded-md border border-blue-200 bg-white/90 px-1.5 py-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Çalışan</p>
            <p className="text-sm font-bold text-slate-900">{sirket.kullaniciSayisi ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="col-span-2 text-center">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleDurum?.(sirket);
          }}
          disabled={isToggling}
          className={`rounded-md px-3 py-1 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isAktif ? "bg-green-500 hover:bg-green-600" : "bg-slate-500 hover:bg-slate-600"
          }`}
        >
          {isToggling ? "Güncelleniyor..." : isAktif ? "Aktif" : "Pasif"}
        </button>
      </div>

      <div className="col-span-2">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
            onClick={(event) => {
              event.stopPropagation();
              onDetail?.(sirket);
            }}
          >
            Detay
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(sirket);
            }}
          >
            Düzenle
          </button>
        </div>
      </div>
    </div>
  );
}
