import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Plus } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  getAllKullanicilar,
  getAllRoller,
  getAllSirketler,
  updateKullaniciDurum,
} from "../../shared/api/index.js";
import { formatDateTr } from "../../shared/utils/formatters.js";
import KullaniciTable from "./components/KullaniciTable.jsx";
import { FilterCombobox, FILTER_BAR_TEXT_INPUT_CLASS } from "../../shared/ui/index.js";
import AddUserModal from "./modals/AddUserModal.jsx";
import ManageUserModal from "./modals/ManageUserModal.jsx";

export default function Kullanicilar() {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [roller, setRoller] = useState([]);
  const [sirketler, setSirketler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedKullanici, setSelectedKullanici] = useState(null);
  const [togglingDurumId, setTogglingDurumId] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [sirketFilter, setSirketFilter] = useState("");
  const [durumFilter, setDurumFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchKullanicilar = useCallback(async () => {
    try {
      const [kRes, rRes, sRes] = await Promise.allSettled([getAllKullanicilar(), getAllRoller(), getAllSirketler()]);
      if (kRes.status === "fulfilled") setKullanicilar(Array.isArray(kRes.value) ? kRes.value : []);
      else setError("Çalışan verileri alınırken bir hata oluştu.");
      if (kRes.status === "fulfilled") setError("");
      if (rRes.status === "fulfilled") setRoller(Array.isArray(rRes.value) ? rRes.value : []);
      if (sRes.status === "fulfilled") setSirketler(Array.isArray(sRes.value) ? sRes.value : []);
    } catch {
      setError("Çalışan verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKullanicilar();
  }, [fetchKullanicilar]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleCreated = (created) => {
    setKullanicilar((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setToastMessage("Çalışan başarıyla oluşturuldu.");
  };

  const handleOpenManage = (k) => {
    setSelectedKullanici(k);
    setIsManageModalOpen(true);
  };

  const handleUpdated = (updated) => {
    setKullanicilar((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setToastMessage("Çalışan başarıyla güncellendi.");
  };

  const handleDeleted = (deletedId) => {
    setKullanicilar((prev) => prev.filter((item) => item.id !== deletedId));
    setToastMessage("Kayıt Başarıyla Silindi");
  };

  const handleOpenDetail = async (kullanici) => {
    const kayitTarihi = formatDateTr(kullanici?.olusturmaTarih || kullanici?.kayitTarihi || kullanici?.createdAt);
    await Swal.fire({
      title: `${kullanici?.ad || ""} ${kullanici?.soyad || ""}`.trim() || "Çalışan Detayı",
      icon: "info",
      confirmButtonText: "Kapat",
      confirmButtonColor: "#2563eb",
      html: `
        <div style="text-align:left;font-size:13px;color:#334155;line-height:1.7">
          <div><strong>Rol:</strong> ${kullanici?.rolAdi || "-"}</div>
          <div><strong>Şirket:</strong> ${kullanici?.sirketAdi || "-"}</div>
          <div><strong>Durum:</strong> ${Number(kullanici?.durum) === 1 ? "Aktif" : "Pasif"}</div>
          <hr style="margin:8px 0;border:none;border-top:1px solid #e2e8f0;" />
          <div><strong>TC No:</strong> ${kullanici?.tcKimlikNo || "-"}</div>
          <div><strong>Telefon:</strong> ${kullanici?.telefonNo || "-"}</div>
          <div><strong>E-posta:</strong> ${kullanici?.eposta || "-"}</div>
          <div><strong>Tam Adres:</strong> ${kullanici?.adres || "-"}</div>
          <div><strong>Kayıt Tarihi:</strong> ${kayitTarihi}</div>
        </div>
      `,
    });
  };

  const handleToggleDurum = async (kullanici) => {
    const current = Number(kullanici.durum);
    const nextDurum = current === 1 ? 2 : 1;
    const nextDurumLabel = nextDurum === 1 ? "Aktif" : "Pasif";
    const { isConfirmed } = await Swal.fire({
      title: "Durum güncellensin mi?",
      text: `Bu çalışanın durumu ${nextDurumLabel} olarak güncellenecek.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#2563eb",
    });
    if (!isConfirmed) return;
    setTogglingDurumId(kullanici.id);
    try {
      const updated = await updateKullaniciDurum(kullanici.id, nextDurum);
      setKullanicilar((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
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

  const roleOptions = useMemo(
    () =>
      (Array.isArray(roller) ? roller : [])
        .map((r) => String(r?.ad || "").trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "tr")),
    [roller],
  );

  const filteredKullanicilar = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const roleQuery = rolFilter.trim().toLowerCase();
    const sirketQuery = sirketFilter.trim().toLowerCase();
    return kullanicilar.filter((item) => {
      const adSoyad = `${item?.ad || ""} ${item?.soyad || ""}`.toLowerCase();
      const telefon = String(item?.telefonNo || "").toLowerCase();
      const matchesSearch = query.length === 0 || adSoyad.includes(query) || telefon.includes(query);
      const role = String(item?.rolAdi || "").toLowerCase().trim();
      const matchesRole = roleQuery.length === 0 || role.includes(roleQuery);
      const sirketAdi = String(item?.sirketAdi || "").toLowerCase().trim();
      const matchesSirket = sirketQuery.length === 0 || sirketAdi.includes(sirketQuery);
      const matchesDurum = durumFilter === "all" || Number(item?.durum) === Number(durumFilter);
      return matchesSearch && matchesRole && matchesSirket && matchesDurum;
    });
  }, [kullanicilar, searchText, rolFilter, sirketFilter, durumFilter]);

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredKullanicilar.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, rolFilter, sirketFilter, durumFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedKullanicilar = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredKullanicilar.slice(start, start + itemsPerPage);
  }, [filteredKullanicilar, currentPage]);

  const handleExportExcel = () => {
    const rows = filteredKullanicilar.map((item) => ({
      Ad: item?.ad || "",
      Soyad: item?.soyad || "",
      "TC Kimlik No": item?.tcKimlikNo || "",
      "Telefon No": item?.telefonNo || "",
      "E-posta": item?.eposta || "",
      Şirket: item?.sirketAdi || "",
      Rol: item?.rolAdi || "",
      Durum: Number(item?.durum) === 1 ? "Aktif" : "Pasif",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Çalışanlar");
    XLSX.writeFile(workbook, "calisanlar_rapor.xlsx");
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
        <h2 className="text-xl font-semibold text-slate-800">Çalışanlar</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-white px-3.5 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
            <Download size={16} />
            Excel'e Aktar
          </button>
          <button type="button" onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <Plus size={16} />
            Yeni Çalışan
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 items-stretch gap-3 rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 shadow-sm md:grid-cols-12 md:items-center">
        <div className="min-w-0 md:col-span-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Hızlı Bul: Ad, Soyad veya Telefon"
            className={FILTER_BAR_TEXT_INPUT_CLASS}
          />
        </div>
        <div className="min-w-0 md:col-span-3">
          <FilterCombobox
            name="rolFilter"
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
            options={roleOptions.map((r) => ({ id: r, ad: r }))}
            placeholder="Rol filtrele (örn. Yönetici)"
            panelMinWidth={240}
          />
        </div>
        <div className="min-w-0 md:col-span-3">
          <FilterCombobox
            name="sirketFilter"
            value={sirketFilter}
            onChange={(e) => setSirketFilter(e.target.value)}
            options={sirketOptions}
            placeholder="Şirket filtrele"
            panelMinWidth={400}
          />
        </div>
        <div className="flex min-w-0 md:col-span-2">
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
          <KullaniciTable kullanicilar={pagedKullanicilar} onDetail={handleOpenDetail} onManage={handleOpenManage} onToggleDurum={handleToggleDurum} togglingDurumId={togglingDurumId} />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Toplam {filteredKullanicilar.length} çalışan • Sayfa {currentPage}/{totalPages}
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

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreated={handleCreated} />
      <ManageUserModal isOpen={isManageModalOpen} user={selectedKullanici} onClose={() => { setIsManageModalOpen(false); setSelectedKullanici(null); }} onUpdated={handleUpdated} onDeleted={handleDeleted} />
    </div>
  );
}
