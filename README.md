# CoopAdmin Dashboard

Kooperatif yönetimi için **Yönetim Paneli**: şirketler, çalışanlar ve müstahsiller üzerinde CRUD işlemleri; özet dashboard ve Excel dışa aktarma.

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4 |
| **Backend** | ASP.NET Core Web API (`CoopAdmin_Backend/CoopAdmin.sln`) |
| **Veri** | SQL Server + Entity Framework Core |

## Depo yapısı

```
CoopAdmin-dashboard/
├── CoopAdmin_Frontend/     # React uygulaması
├── CoopAdmin_Backend/      # .NET solution (WebAPI, Service, Data, Core)
├── PROJECT_INFO.md       # Mimari, veri modeli, API özeti
└── README.md             # Bu dosya
```

## Hızlı başlangıç

**Frontend (geliştirme):**

```bash
cd CoopAdmin_Frontend
npm install
cp .env.example .env   # VITE_API_URL ile API adresini ayarlayın
npm run dev
```

**Backend:** `CoopAdmin_Backend/CoopAdmin.WebAPI` içinde `appsettings.Development.json` (veya `appsettings.json`) üzerinden bağlantı dizesini ayarlayın; API’yi IDE veya `dotnet run` ile çalıştırın.

## Ayrıntılı dokümantasyon

Tüm mimari, entity ilişkileri, endpoint listesi ve UI kuralları için **[PROJECT_INFO.md](./PROJECT_INFO.md)** dosyasına bakın.
