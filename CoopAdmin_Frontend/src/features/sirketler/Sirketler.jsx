import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Plus } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { getAllSirketler, getSirketById, updateSirketDurum } from "../../shared/api/index.js";
import SirketTable from "./components/SirketTable.jsx";
import AddSirketModal from "./modals/AddSirketModal.jsx";
import ManageSirketModal from "./modals/ManageSirketModal.jsx";

/** Şirket listesi: API /api/sirketler, ekleme/düzenleme modalları, Excel dışa aktarma. */
export default function Sirketler() {
  const [sirketler, setSirketler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedSirket, setSelectedSirket] = useState(null);
  const [loadingSelectedSirket, setLoadingSelectedSirket] = useState(false);
  const [togglingDurumId, setTogglingDurumId] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [durumFilter, setDurumFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSirketler = useCallback(async () => {
    try {
      const data = await getAllSirketler();
      setSirketler(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      const status = err?.response?.status;
      const isNetwork = err?.code === "ERR_NETWORK" || err?.message === "Network Error";
      let hint = "";
      if (isNetwork) {
        hint = " API adresine ulaşılamıyor (backend çalışıyor mu, VITE_API_URL doğru mu?).";
      } else if (status === 500) {
        hint = " Sunucu hatası (çoğunlukla veritabanı bağlantısı veya sorgu).";
      } else if (status) {
        hint = ` HTTP ${status}.`;
      }
      setError(`Şirket verileri alınırken bir hata oluştu.${hint}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSirketler();
  }, [fetchSirketler]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleOpenDetail = async (sirket) => {
    await Swal.fire({
      title: sirket.ad || "Şirket Detayı",
      html: `
        <div style="text-align:left;font-size:13px;color:#334155;line-height:1.6">
          <div><strong>E-posta:</strong> ${sirket.eposta || "-"}</div>
          <div><strong>Telefon:</strong> ${sirket.tel || sirket.telefon || "-"}</div>
          <div><strong>Vergi No:</strong> ${sirket.vergiNo || "-"}</div>
          <div><strong>Adres:</strong> ${sirket.adres || "-"}</div>
          <div><strong>Bağlı Müstahsil:</strong> ${sirket.mustahsilSayisi ?? 0}</div>
          <div><strong>Bağlı Çalışan:</strong> ${sirket.kullaniciSayisi ?? 0}</div>
        </div>
      `,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "Kapat",
      confirmButtonColor: "#2563eb",
    });
  };

  const handleOpenEdit = async (sirket) => {
    setIsManageModalOpen(true);
    setLoadingSelectedSirket(true);
    setSelectedSirket(sirket);
    try {
      const detail = await getSirketById(sirket.id);
      setSelectedSirket((prev) => ({ ...(prev || {}), ...(detail || {}) }));
    } catch {
      // Detay alınamazsa satır verisiyle devam
    } finally {
      setLoadingSelectedSirket(false);
    }
  };

  const handleCreated = (created) => {
    setSirketler((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setToastMessage("Şirket Başarıyla Eklendi");
  };

  const handleUpdated = (updated) => {
    setSirketler((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    setToastMessage("Şirket Başarıyla Güncellendi");
    setIsManageModalOpen(false);
    setSelectedSirket(null);
  };

  const handleDeleted = (deletedId) => {
    setSirketler((prev) => prev.filter((item) => item.id !== deletedId));
    setToastMessage("Kayıt Başarıyla Silindi");
    setIsManageModalOpen(false);
    setSelectedSirket(null);
    setLoadingSelectedSirket(false);
  };

  const handleToggleDurum = async (sirket) => {
    const current = Number(sirket?.durum);
    const nextDurum = current === 1 ? 2 : 1;
    const nextDurumLabel = nextDurum === 1 ? "Aktif" : "Pasif";
    const { isConfirmed } = await Swal.fire({
      title: "Durum güncellensin mi?",
      text: `Bu şirketin durumu ${nextDurumLabel} olarak güncellenecek.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#2563eb",
    });
    if (!isConfirmed) return;
    setTogglingDurumId(sirket.id);
    try {
      const updated = await updateSirketDurum(sirket.id, nextDurum);
      setSirketler((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setToastMessage("Şirket Durumu Güncellendi");
    } catch (err) {
      await Swal.fire({ title: "Hata", text: err?.response?.data?.message || "Durum güncellenirken bir hata oluştu.", icon: "error", confirmButtonColor: "#2563eb" });
    } finally {
      setTogglingDurumId("");
    }
  };

  const filteredSirketler = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return sirketler.filter((item) => {
      const matchesSearch = String(item?.ad || "").toLowerCase().includes(query);
      const matchesDurum = durumFilter === "all" || Number(item?.durum) === Number(durumFilter);
      return matchesSearch && matchesDurum;
    });
  }, [sirketler, searchText, durumFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredSirketler.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, durumFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedSirketler = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSirketler.slice(start, start + itemsPerPage);
  }, [filteredSirketler, currentPage]);

  const handleExportExcel = () => {
    const rows = filteredSirketler.map((item) => ({
      Şirket: item?.ad || "",
      "E-posta": item?.eposta || "",
      Telefon: item?.tel || item?.telefon || "",
      "Vergi No": item?.vergiNo || "",
      Adres: item?.adres || "",
      "Müstahsil Sayısı": item?.mustahsilSayisi ?? 0,
      "Çalışan Sayısı": item?.kullaniciSayisi ?? 0,
      Durum: Number(item?.durum) === 1 ? "Aktif" : Number(item?.durum) === 2 ? "Pasif" : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Şirketler");
    XLSX.writeFile(workbook, "sirketler_rapor.xlsx");
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
        <h2 className="text-xl font-semibold text-slate-800">Şirketler</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
            <Download size={16} />
            Excel'e Aktar
          </button>
          <button type="button" onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <Plus size={16} />
            Yeni Şirket
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-2.5 md:grid-cols-12">
        <div className="md:col-span-8">
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Hızlı Bul: Şirket adı" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div className="md:col-span-4">
          <div className="grid grid-cols-3 gap-1">
            <button type="button" onClick={() => setDurumFilter("1")} className={`h-10 rounded-md px-3 text-xs font-semibold transition ${durumFilter === "1" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              Aktif
            </button>
            <button type="button" onClick={() => setDurumFilter("2")} className={`h-10 rounded-md px-3 text-xs font-semibold transition ${durumFilter === "2" ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              Pasif
            </button>
            <button type="button" onClick={() => setDurumFilter("all")} className={`h-10 rounded-md px-3 text-xs font-semibold transition ${durumFilter === "all" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              Tümü
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <>
          <SirketTable sirketler={pagedSirketler} onDetail={handleOpenDetail} onEdit={handleOpenEdit} onToggleDurum={handleToggleDurum} togglingDurumId={togglingDurumId} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Toplam {filteredSirketler.length} şirket • Sayfa {currentPage}/{totalPages}
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

      <AddSirketModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreated={handleCreated} />
      <ManageSirketModal
        isOpen={isManageModalOpen}
        loading={loadingSelectedSirket}
        sirket={selectedSirket}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedSirket(null);
          setLoadingSelectedSirket(false);
        }}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
