# CoopAdmin — Proje Teknik Dokümantasyonu

## 1. Proje Özeti

**CoopAdmin**, kooperatif yönetim süreçleri için geliştirilmiş bir **Yönetim Paneli (Admin Portal)** uygulamasıdır. Şirketler (kooperatifler), çalışanlar ve müstahsiller arasındaki hiyerarşiyi yönetir.

**Temel iş akışı:**

- **Şirket** → üst çatı kooperatif / şirket kaydı  
- **Çalışan** → şirkete bağlı `Kullanici` (roller: Yönetici, vb.)  
- **Müstahsil** → işletme kaydı (`Mustahsil`); yetkili bilgileri aynı veya bağlı `Kullanici` üzerinden gelir  

---

## 2. Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend** | React 19 + Vite 7 | HMR, `CoopAdmin_Frontend/` |
| **UI** | Tailwind CSS 4 | Utility-first |
| **HTTP** | Axios | `shared/api/axios.js`, `VITE_API_URL` |
| **Etkileşim** | SweetAlert2 | Onay / bilgi |
| **Dışa aktarma** | xlsx (SheetJS) | Excel |
| **Backend** | ASP.NET Core | `CoopAdmin_Backend/` |
| **ORM** | Entity Framework Core | `CoopAdminContext` |
| **Mapping** | AutoMapper | `EntityToDtoProfile` |
| **Validasyon** | FluentValidation | DTO doğrulama |

---

## 3. Mimari

### 3.1 Frontend (feature tabanlı)

```
CoopAdmin_Frontend/src/
├── features/
│   ├── dashboard/
│   ├── sirketler/        # modals, tablo
│   ├── kullanicilar/
│   └── mustahsiller/
├── shared/
│   ├── api/              # Tüm API çağrıları (axios + servis modülleri)
│   │   ├── axios.js
│   │   ├── index.js
│   │   ├── sirketService.js
│   │   ├── rolService.js
│   │   ├── kullaniciService.js
│   │   └── mustahsilService.js
│   ├── ui/               # FormInput, FormSelect, ModalShell, …
│   └── utils/            # validators, formatters, parseBackendErrors
├── layouts/
└── App.jsx
```

Özet: Özellik modülleri `features/` altında; **HTTP katmanı tek merkezde** `shared/api/`.

### 3.2 Backend (katmanlı)

```
CoopAdmin_Backend/
├── CoopAdmin.WebAPI/     # Controllers, Program.cs
├── CoopAdmin.Service/    # Ef*Service, Mapping, Validation
├── CoopAdmin.Data/       # CoopAdminContext
└── CoopAdmin.Core/       # Entities, DTOs, Enums
```

---

## 4. Veri Modeli ve İlişkiler

### 4.1 Hiyerarşi (özet)

```
Şirket (Sirketler)
  ├── Kullanici (Kullanicilar) — Rol ile
  └── Mustahsil (Mustahsiller) — SirketId + KullaniciId
```

- **Şirket ↔ Kullanici:** çok-a-bir (bir şirkette birden çok çalışan).  
- **Şirket ↔ Mustahsil:** çok-a-bir.  
- **Kullanici ↔ Mustahsil:** **bire-çok (1-N)** — bir kullanıcıya birden fazla `Mustahsil` satırı bağlanabilir (EF: `Kullanici.Mustahsiller` koleksiyonu, FK `Mustahsiller.KullaniciId`).

### 4.2 Müstahsil = işletme + yetkili verisi

`Mustahsil` tablosunda işletmeye özel alanlar (`No`, ünvan için `Ad`, adres, vb.) tutulur; yetkili adı/soyadı/TC/telefon genelde bağlı `Kullanici` üzerinden AutoMapper ile DTO’ya birleştirilir.

### 4.3 Backend mapping (`EntityToDtoProfile`)

`Mustahsil` → `MustahsilDto` eşlemesi özetle: `Kullanici` alanları + `Mustahsil` işletme alanları + `Sirket.Ad` → `SirketAdi`. Güncel tanım: `CoopAdmin_Backend/CoopAdmin.Service/Mapping/EntityToDtoProfile.cs`.

### 4.4 Frontend

`shared/utils/mustahsilFormatters.js` — görünen ad, Excel sütunları vb.

---

## 5. Yönetim Arayüzü

| Prensip | Uygulama |
|---------|----------|
| Özet | Dashboard: sayılar ve şirket bazlı tablo |
| Filtre | Arama + rol / şirket / durum; filtre satırında ortak yükseklik ve `FilterCombobox` |
| Tablolar | Türkçe başlıklar, durum anahtarları |
| Onay | SweetAlert2 |
| Dışa aktarma | Filtrelenmiş liste Excel |

---

## 6. Durum ve silme

- Enum `Durum`: **Aktif = 1**, **Pasif = 2**, **Silindi = 3** (`CoopAdmin.Core.Enums`).  
- Listelerde `HasQueryFilter` ile `Silindi` kayıtları genelde gizlenir.  
- Silme işlemi çoğunlukla **yumuşak silme** (`Durum = Silindi`).

---

## 7. API özeti

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/sirketler` | GET, POST | Liste, oluştur |
| `/api/sirketler/{id}` | GET, PUT, PATCH, DELETE | Detay, güncelle, durum, sil |
| `/api/kullanicilar` | GET, POST | Liste, oluştur |
| `/api/kullanicilar/{id}` | GET, PUT, PATCH, DELETE | Detay, güncelle, durum, sil |
| `/api/mustahsiller` | GET, POST | Liste, oluştur |
| `/api/mustahsiller/{id}` | GET, PUT, PATCH, DELETE | Detay, güncelle, durum, sil |
| `/api/roller` | GET | Rol listesi |

---

## 8. Entity ↔ veritabanı tablosu

C# tarafında `DbSet` adları ile SQL **tablo** adları farklı olabilir; aşağıdaki tablo **`[Table("...")]`** eşlemesine göredir.

| Entity | DbSet (kod) | SQL tablosu |
|--------|-------------|-------------|
| `Sirket` | `Sirkets` | **Sirketler** |
| `Kullanici` | `Kullanicis` | **Kullanicilar** |
| `Mustahsil` | `Mustahsils` | **Mustahsiller** |
| `Rol` | `Rols` | **Roller** |

---

## 9. Hızlı başlangıç

1. **Backend:** `CoopAdmin_Backend/CoopAdmin.WebAPI/appsettings*.json` içinde bağlantı dizesini ayarlayın.  
2. **Frontend:** `CoopAdmin_Frontend/.env` içinde `VITE_API_URL` (ör. `https://localhost:7xxx/api`) tanımlayın; `npm install` ve `npm run dev`.  
3. Ayrıntılar: depo kökündeki **[README.md](./README.md)**.
