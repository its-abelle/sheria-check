import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { CategoryBrowse } from "./pages/CategoryBrowse";
import { OffenseDetail } from "./pages/OffenseDetail";
import { Disclaimer } from "./pages/Disclaimer";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryBrowse />} />
          <Route path="/offense/:offenseId" element={<OffenseDetail />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
