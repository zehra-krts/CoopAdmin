export default function KullaniciTable({ kullanicilar, onDetail, onManage, onToggleDurum, togglingDurumId }) {
  const getDurumButton = (durum) => {
    const value = Number(durum);
    if (value === 1) return { label: "Aktif", className: "bg-green-500 text-white hover:bg-green-600" };
    return { label: "Pasif", className: "bg-slate-500 text-white hover:bg-slate-600" };
  };

  return (
    <div className="space-y-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2.5">
      <div className="grid min-w-[980px] grid-cols-12 rounded-md bg-slate-800 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
        <div className="col-span-4">Çalışan Kimliği</div>
        <div className="col-span-4">Görev ve Yetki</div>
        <div className="col-span-2">Durum</div>
        <div className="col-span-2 text-right">İşlemler</div>
      </div>

      {kullanicilar.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">Kayıt bulunamadı.</div>
      ) : (
        kullanicilar.map((kullanici) => {
          const durumButton = getDurumButton(kullanici.durum);
          const isLoading = togglingDurumId === kullanici.id;
          return (
            <div
              key={kullanici.id}
              className="grid min-w-[980px] grid-cols-12 items-center rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50 cursor-pointer"
              onClick={() => onDetail?.(kullanici)}
            >
              <div className="col-span-4">
                <div className="text-sm font-semibold text-slate-900">
                  {kullanici.ad} {kullanici.soyad}
                </div>
                <div className="mt-0.5 text-sm text-slate-500">{kullanici.telefonNo || "-"}</div>
              </div>
              <div className="col-span-4">
                <div className="text-sm font-medium text-slate-800">{kullanici.rolAdi || "-"}</div>
                <div className="mt-0.5 text-sm text-slate-500">{kullanici.sirketAdi || "-"}</div>
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${durumButton.className}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDurum?.(kullanici);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Güncelleniyor..." : durumButton.label}
                </button>
              </div>
              <div className="col-span-2">
                <div className="flex justify-end gap-2">
                  <button type="button" className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100" onClick={(e) => { e.stopPropagation(); onDetail?.(kullanici); }}>
                    Detay
                  </button>
                  <button type="button" className="rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200" onClick={(e) => { e.stopPropagation(); onManage?.(kullanici); }}>
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
