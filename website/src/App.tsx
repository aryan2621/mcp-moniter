import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { EditionsPage } from "./pages/Editions";
import { FaqPage } from "./pages/Faq";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { SdkPage } from "./pages/Sdk";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ScrollToTop />
      <Nav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sdk" element={<SdkPage />} />
          <Route path="/editions" element={<EditionsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Shell />
    </BrowserRouter>
  );
}
