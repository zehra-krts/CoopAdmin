import { useEffect, useMemo, useState } from "react";
import { Factory, Tractor, Users } from "lucide-react";
import {
  getAllKullanicilar,
  getAllMustahsiller,
  getAllSirketler,
} from "../../shared/api/index.js";

export default function Dashboard() {
  const [sirketler, setSirketler] = useState([]);
  const [mustahsiller, setMustahsiller] = useState([]);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSirket, setSearchSirket] = useState("");
  const [sortBy, setSortBy] = useState("mustahsil_desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadDashboard = async () => {
      const [sRes, mRes, kRes] = await Promise.allSettled([
        getAllSirketler(),
        getAllMustahsiller(),
        getAllKullanicilar(),
      ]);

      if (sRes.status === "fulfilled") setSirketler(Array.isArray(sRes.value) ? sRes.value : []);
      if (mRes.status === "fulfilled") setMustahsiller(Array.isArray(mRes.value) ? mRes.value : []);
      if (kRes.status === "fulfilled") setKullanicilar(Array.isArray(kRes.value) ? kRes.value : []);

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const cards = useMemo(
    () => [
      { title: "Toplam Şirket", value: String(sirketler.length), Icon: Factory },
      { title: "Toplam Müstahsil", value: String(mustahsiller.length), Icon: Tractor },
      { title: "Toplam Çalışan", value: String(kullanicilar.length), Icon: Users },
    ],
    [sirketler.length, mustahsiller.length, kullanicilar.length],
  );

  const mustahsilDagilimi = useMemo(() => {
    const countBySirket = new Map();

    sirketler.forEach((sirket) => {
      countBySirket.set(sirket.id, {
        id: sirket.id,
        ad: sirket.ad || "-",
        mustahsilCount: 0,
        kullaniciCount: 0,
      });
    });

    mustahsiller.forEach((mustahsil) => {
      const sirketId = mustahsil.sirketId;
      if (!sirketId) return;
      const existing = countBySirket.get(sirketId);
      if (existing) existing.mustahsilCount += 1;
      else countBySirket.set(sirketId, { id: sirketId, ad: "Bilinmeyen Şirket", mustahsilCount: 1, kullaniciCount: 0 });
    });

    kullanicilar.forEach((kullanici) => {
      const sirketId = kullanici.sirketId;
      if (!sirketId) return;
      const existing = countBySirket.get(sirketId);
      if (existing) existing.kullaniciCount += 1;
      else countBySirket.set(sirketId, { id: sirketId, ad: "Bilinmeyen Şirket", mustahsilCount: 0, kullaniciCount: 1 });
    });

    return Array.from(countBySirket.values()).sort((a, b) => b.mustahsilCount - a.mustahsilCount);
  }, [sirketler, mustahsiller, kullanicilar]);

  const filteredAndSortedDagilim = useMemo(() => {
    const query = searchSirket.trim().toLowerCase();
    const filtered = mustahsilDagilimi.filter((item) => String(item.ad || "").toLowerCase().includes(query));
    const sorted = [...filtered];
    switch (sortBy) {
      case "mustahsil_asc":
        sorted.sort((a, b) => a.mustahsilCount - b.mustahsilCount);
        break;
      case "calisan_desc":
        sorted.sort((a, b) => b.kullaniciCount - a.kullaniciCount);
        break;
      case "calisan_asc":
        sorted.sort((a, b) => a.kullaniciCount - b.kullaniciCount);
        break;
      case "mustahsil_desc":
      default:
        sorted.sort((a, b) => b.mustahsilCount - a.mustahsilCount);
        break;
    }
    return sorted;
  }, [mustahsilDagilimi, searchSirket, sortBy]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedDagilim.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchSirket, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedDagilim = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDagilim.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDagilim, currentPage]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
          <span className="text-sm font-medium">Dashboard yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map(({ title, value, Icon }) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-blue-50 p-3 text-blue-700">
              <Icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-blue-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Şirket Bazlı Operasyonel Dağılım</h3>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-10">
            <div className="md:col-span-7">
              <input
                type="text"
                value={searchSirket}
                onChange={(e) => setSearchSirket(e.target.value)}
                placeholder="Şirket adına göre ara..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="mustahsil_desc">Müstahsil Sayısı (Çoktan Aza)</option>
                <option value="mustahsil_asc">Müstahsil Sayısı (Azdan Çoğa)</option>
                <option value="calisan_desc">Çalışan Sayısı (Çoktan Aza)</option>
                <option value="calisan_asc">Çalışan Sayısı (Azdan Çoğa)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Şirket</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">Müstahsil Sayısı</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">Çalışanlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pagedDagilim.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                pagedDagilim.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.ad}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.mustahsilCount}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{item.kullaniciCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Toplam {filteredAndSortedDagilim.length} şirket • Sayfa {currentPage}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
