import MainLayout from "./layouts/MainLayout.jsx";
import Dashboard from "./features/dashboard/Dashboard.jsx";
import Sirketler from "./features/sirketler/Sirketler.jsx";
import Kullanicilar from "./features/kullanicilar/Kullanicilar.jsx";
import Mustahsiller from "./features/mustahsiller/Mustahsiller.jsx";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="sirketler" element={<Sirketler />} />
        <Route path="mustahsiller" element={<Mustahsiller />} />
        <Route path="kullanicilar" element={<Kullanicilar />} />
      </Route>
    </Routes>
  );
}

export default App;
