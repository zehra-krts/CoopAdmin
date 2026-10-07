import SirketCard from "./SirketCard.jsx";

export default function SirketTable({ sirketler, onDetail, onEdit, onToggleDurum, togglingDurumId }) {
  return (
    <div className="space-y-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2.5">
      <div className="grid min-w-[980px] grid-cols-12 items-center rounded-md bg-slate-800 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
        <div className="col-span-6">İsim / İletişim</div>
        <div className="col-span-2">Operasyonel Güç</div>
        <div className="col-span-2 text-center">Durum</div>
        <div className="col-span-2 text-right">İşlemler</div>
      </div>

      {sirketler.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">Kayıt bulunamadı.</div>
      ) : (
        sirketler.map((sirket) => (
          <SirketCard
            key={sirket.id}
            sirket={sirket}
            onDetail={onDetail}
            onEdit={onEdit}
            onToggleDurum={onToggleDurum}
            togglingDurumId={togglingDurumId}
          />
        ))
      )}
    </div>
  );
}
