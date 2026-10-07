import { Bell, Building2, Home, Tractor, Users } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Özet", Icon: Home, to: "/" },
  { label: "Şirketler", Icon: Building2, to: "/sirketler" },
  { label: "Çalışanlar", Icon: Users, to: "/kullanicilar" },
  { label: "Müstahsiller", Icon: Tractor, to: "/mustahsiller" },
];

export default function MainLayout() {
  const { pathname } = useLocation();

  const getPageTitle = () => {
    if (pathname === "/") return "Sistem Özeti";
    if (pathname.startsWith("/sirketler")) return "Bağlı Kurumlar";
    if (pathname.startsWith("/kullanicilar")) return "Çalışan Yönetimi";
    if (pathname.startsWith("/mustahsiller")) return "Müstahsil Yönetimi";
    return "CoopAdmin Panel";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 p-6 text-white">
        <h2 className="mb-8 text-xl font-semibold">CoopAdmin Panel</h2>
        <nav>
          <ul className="space-y-3">
            {menuItems.map(({ label, Icon, to }) => (
              <li key={label}>
                {to ? (
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition ${
                        isActive
                          ? "bg-blue-500/25 text-blue-100"
                          : "hover:bg-slate-800"
                      }`
                    }
                    end={to === "/"}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="ml-64 min-h-screen border-l border-slate-200">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
            </div>

            <button
              type="button"
              className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Bildirimler"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
