/**
 * Müstahsiller sayfası - API'den gelen veriyi kullanır (mock yok).
 * API alan eşlemesi: isletmeUnvani, no, kullaniciId, tcKimlikNo, telefon, sirketAdi, ad, soyad, yetkiliAdSoyad, cariKod, adres, durum
 */
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Plus } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  getAllMustahsiller,
  getAllSirketler,
  updateMustahsilDurum,
} from "../../shared/api/index.js";
import { FilterCombobox, FILTER_BAR_TEXT_INPUT_CLASS } from "../../shared/ui/index.js";
import { getMustahsilYetkiliAdSoyad, formatMustahsilForExcel } from "../../shared/utils/mustahsilFormatters.js";
import MustahsilTable from "./components/MustahsilTable.jsx";
import AddMustahsilModal from "./modals/AddMustahsilModal.jsx";
import ManageMustahsilModal from "./modals/ManageMustahsilModal.jsx";

export default function Mustahsiller() {
  const [mustahsiller, setMustahsiller] = useState([]);
  const [sirketler, setSirketler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedMustahsil, setSelectedMustahsil] = useState(null);
  const [togglingDurumId, setTogglingDurumId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sirketFilter, setSirketFilter] = useState("");
  const [durumFilter, setDurumFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [mRes, sRes] = await Promise.allSettled([getAllMustahsiller(), getAllSirketler()]);
        if (mRes.status === "fulfilled") {
          setMustahsiller(Array.isArray(mRes.value) ? mRes.value : []);
          setError("");
        } else {
          setError("Müstahsil verileri alınırken bir hata oluştu.");
        }
        if (sRes.status === "fulfilled") setSirketler(Array.isArray(sRes.value) ? sRes.value : []);
      } catch {
        setError("Müstahsil verileri alınırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []); // Sadece API response.data kullanılır, mock/dummy veri yok

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleOpenManage = (m) => {
    setSelectedMustahsil(m);
    setIsManageModalOpen(true);
  };

  const handleCreated = (created) => {
    setMustahsiller((prev) => [created, ...prev]);
    setToastMessage("Müstahsil kaydı oluşturuldu");
  };

  const handleUpdated = (updated) => {
    setMustahsiller((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setToastMessage("Müstahsil kaydı güncellendi");
  };

  const handleDeleted = (deletedId) => {
    setMustahsiller((prev) => prev.filter((item) => item.id !== deletedId));
    setToastMessage("Kayıt Başarıyla Silindi");
  };

  const handleOpenDetail = async (mustahsil) => {
    const yetkili = getMustahsilYetkiliAdSoyad(mustahsil);
    await Swal.fire({
      title: mustahsil?.isletmeUnvani || "Müstahsil Detayı",
      icon: "info",
      confirmButtonText: "Kapat",
      confirmButtonColor: "#2563eb",
      html: `
        <div style="text-align:left;font-size:13px;color:#334155;line-height:1.7">
          <div><strong>Ünvan:</strong> ${mustahsil?.isletmeUnvani || "-"}</div>
          <div><strong>İşletme No:</strong> ${mustahsil?.no || "-"}</div>
          <div><strong>Cari Kod:</strong> ${mustahsil?.cariKod || "-"}</div>
          <div><strong>Şirket / Kooperatif:</strong> ${mustahsil?.sirketAdi || "-"}</div>
          <hr style="margin:8px 0;border:none;border-top:1px solid #e2e8f0;" />
          <div><strong>Yetkili:</strong> ${yetkili}</div>
          <div><strong>Telefon:</strong> ${mustahsil?.telefon || "-"}</div>
          <div><strong>TC No:</strong> ${mustahsil?.tcKimlikNo || "-"}</div>
          <div><strong>Adres:</strong> ${mustahsil?.adres || "-"}</div>
        </div>
      `,
    });
  };

  const handleToggleDurum = async (mustahsil) => {
    const current = Number(mustahsil.durum);
    const nextDurum = current === 1 ? 2 : 1;
    const nextDurumLabel = nextDurum === 1 ? "Aktif" : "Pasif";
    const { isConfirmed } = await Swal.fire({
      title: "Durum güncellensin mi?",
      text: `Bu müstahsilin durumu ${nextDurumLabel} olarak güncellenecek.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#2563eb",
    });
    if (!isConfirmed) return;
    setTogglingDurumId(mustahsil.id);
    try {
      const updated = await updateMustahsilDurum(mustahsil.id, nextDurum);
      setMustahsiller((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      await Swal.fire({ title: "Hata", text: err?.response?.data?.message || "Durum güncellenirken bir hata oluştu.", icon: "error" });
    } finally {
      setTogglingDurumId("");
    }
  };

  const sirketOptions = useMemo(
    () =>
      (Array.isArray(sirketler) ? sirketler : [])
        .map((s) => ({ id: s.id, ad: s.ad || "-" }))
        .sort((a, b) => a.ad.localeCompare(b.ad, "tr")),
    [sirketler],
  );

  const filteredMustahsiller = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const sirketQuery = sirketFilter.trim().toLowerCase();
    return mustahsiller.filter((item) => {
      if (!item) return false;
      const adSoyad = getMustahsilYetkiliAdSoyad(item).toLowerCase();
      const unvan = String(item?.isletmeUnvani ?? "").toLowerCase();
      const tc = String(item?.tcKimlikNo || "").toLowerCase();
      const no = String(item?.no || "").toLowerCase();
      const matchesSearch = query.length === 0 || adSoyad.includes(query) || unvan.includes(query) || tc.includes(query) || no.includes(query);
      const sirketAdi = String(item?.sirketAdi || "").toLowerCase().trim();
      const matchesSirket = sirketQuery.length === 0 || sirketAdi.includes(sirketQuery);
      const matchesDurum = durumFilter === "all" || Number(item?.durum) === Number(durumFilter);
      return matchesSearch && matchesSirket && matchesDurum;
    });
  }, [mustahsiller, searchText, sirketFilter, durumFilter]);

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredMustahsiller.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, sirketFilter, durumFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedMustahsiller = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMustahsiller.slice(start, start + itemsPerPage);
  }, [filteredMustahsiller, currentPage]);

  const handleExportExcel = () => {
    const rows = filteredMustahsiller.map(formatMustahsilForExcel);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Müstahsiller");
    XLSX.writeFile(workbook, "mustahsiller_rapor.xlsx");
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
          <span className="text-sm font-medium">Veriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {toastMessage ? (
        <div className="fixed right-6 top-6 z-[60] inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      ) : null}

      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800">Müstahsiller</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
            <Download size={16} />
            Excel'e Aktar
          </button>
          <button type="button" onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <Plus size={16} />
            Yeni Müstahsil Ekle
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 items-stretch gap-3 rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 shadow-sm md:grid-cols-12 md:items-center">
        <div className="min-w-0 md:col-span-5">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Kimlik araması: Ad Soyad, Ünvan, TC veya Müstahsil No"
            className={FILTER_BAR_TEXT_INPUT_CLASS}
          />
        </div>
        <div className="min-w-0 md:col-span-4">
          <FilterCombobox
            name="sirketFilter"
            value={sirketFilter}
            onChange={(e) => setSirketFilter(e.target.value)}
            options={sirketOptions}
            placeholder="Şirket filtrele"
            panelMinWidth={420}
          />
        </div>
        <div className="flex min-w-0 md:col-span-3">
          <div className="grid h-11 w-full grid-cols-3 gap-1.5">
            <button type="button" onClick={() => setDurumFilter("1")} className={`h-full min-h-0 rounded-lg px-2 text-xs font-semibold transition ${durumFilter === "1" ? "bg-green-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100"}`}>
              Aktif
            </button>
            <button type="button" onClick={() => setDurumFilter("2")} className={`h-full min-h-0 rounded-lg px-2 text-xs font-semibold transition ${durumFilter === "2" ? "bg-slate-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100"}`}>
              Pasif
            </button>
            <button type="button" onClick={() => setDurumFilter("all")} className={`h-full min-h-0 rounded-lg px-2 text-xs font-semibold transition ${durumFilter === "all" ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100"}`}>
              Tümü
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <>
          <MustahsilTable mustahsiller={pagedMustahsiller} onDetail={handleOpenDetail} onEdit={handleOpenManage} onToggleDurum={handleToggleDurum} togglingDurumId={togglingDurumId} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Toplam {filteredMustahsiller.length} müstahsil • Sayfa {currentPage}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Önceki
              </button>
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Sonraki
              </button>
            </div>
          </div>
        </>
      )}

      <AddMustahsilModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(created) => {
          handleCreated(created);
          setIsAddModalOpen(false);
        }}
      />
      <ManageMustahsilModal isOpen={isManageModalOpen} mustahsil={selectedMustahsil} onClose={() => { setIsManageModalOpen(false); setSelectedMustahsil(null); }} onUpdated={handleUpdated} onDeleted={handleDeleted} />
    </div>
  );
}
