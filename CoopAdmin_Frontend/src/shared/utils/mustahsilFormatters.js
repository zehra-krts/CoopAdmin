/**
 * Müstahsil (Kullanıcı + İşletme) mapping/transform katmanı.
 * API'den gelen ham veriyi tablo/detay/Excel formatına çevirir.
 * Hem Dashboard hem Müstahsil sayfası bu fonksiyonları kullanır.
 */

const normalizeText = (value) => String(value || "").toLocaleLowerCase("tr").trim();

/**
 * Yetkili Ad Soyad: yetkiliAdSoyad varsa onu, yoksa ad+soyad birleşimini döner.
 * Kullanıcı-İşletme eşleşmesinde backend bazen yetkiliAdSoyad gönderir.
 * null/undefined güvenli.
 */
export const getMustahsilKullaniciAdSoyad = (row) => {
  if (!row) return "-";
  const fromYetkili = String(row?.yetkiliAdSoyad ?? "").trim();
  if (fromYetkili) return fromYetkili;
  return `${row?.ad ?? ""} ${row?.soyad ?? ""}`.trim() || "-";
};

/**
 * Tablo için: Ad Soyad + (Ünvan) parantezli format.
 * Ünvan ile Ad Soyad aynıysa gizlenir (tekrara düşmemek için).
 * null/undefined güvenli: unvan boş gelirse parantez gösterilmez.
 */
export const getMustahsilDisplayName = (row) => {
  if (!row) return { primary: "-", unvanSuffix: null };
  const adSoyad = getMustahsilKullaniciAdSoyad(row);
  const unvan = String(row?.isletmeUnvani ?? "").trim();
  const showUnvan = unvan.length > 0 && normalizeText(unvan) !== normalizeText(adSoyad);
  return {
    primary: adSoyad,
    unvanSuffix: showUnvan ? unvan : null,
  };
};

/**
 * Tablo alt satırı: "Müstahsil No: X • TC: Y"
 * null/undefined güvenli.
 */
export const getMustahsilSubline = (row) => {
  const no = row?.no ?? "-";
  const tc = row?.tcKimlikNo ?? "-";
  return `Müstahsil No: ${no} • TC: ${tc}`;
};

/**
 * Detay modal / Excel için yetkili ad soyad.
 */
export const getMustahsilYetkiliAdSoyad = (row) => {
  return getMustahsilKullaniciAdSoyad(row);
};

/**
 * Excel export için satır objesi.
 */
export const formatMustahsilForExcel = (row) => ({
  "İşletme Ünvanı": row?.isletmeUnvani || "",
  "İşletme No": row?.no || "",
  "Cari Kod": row?.cariKod || "",
  Şirket: row?.sirketAdi || "",
  "Yetkili Ad Soyad": getMustahsilYetkiliAdSoyad(row),
  "Yetkili TC": row?.tcKimlikNo || "",
  "Yetkili Telefon": row?.telefon || "",
  "Yetkili Eposta": row?.eposta || "",
  Adres: row?.adres || "",
  Durum: Number(row?.durum) === 1 ? "Aktif" : "Pasif",
});
