import { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import UBPHome from "./components/UBPHome";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";
import { lazyPage } from "./lib/lazyPage";
import { FINANCE_ACT_URL, NAIROBI_PAY_URL } from "./config";

// The home page and layout load up front; every other page is its own chunk,
// downloaded on first visit, so the landing page stays small.
const TermsAndConditions = lazyPage(() => import("./components/TermsAndConditions"));
const FAQS = lazyPage(() => import("./components/FAQs"));
const Guide = lazyPage(() => import("./components/Guide"));
const AdvertFormat = lazyPage(() => import("./components/AdvertFormat"));
const CombinedSearch = lazyPage(() => import("./components/CombinedSearch"));
const UBPAgent = lazyPage(() => import("./components/UBPAgent"));
const UBPTutorial = lazyPage(() => import("./components/UBPTutorial"));

// Old in-app paths that should forward to these external sites.
const exceptionLinks = [FINANCE_ACT_URL, NAIROBI_PAY_URL];

const RedirectHandler = () => {
  const location = useLocation();

  // Check if the current path matches an exception. Ignore links whose path is
  // just "/" - every path contains it, which would redirect all unknown routes.
  const matchingException = exceptionLinks.find((link) => {
    const linkPath = new URL(link).pathname.replace(/\/+$/, "");
    return linkPath !== "" && location.pathname.startsWith(linkPath);
  });

  if (matchingException) {
    window.location.href = matchingException;
    return null;
  }

  return <Navigate to="/terms" replace />;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UBPHome />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/faqs" element={<FAQS />} />
            <Route path="/ubp" element={<CombinedSearch />} />
            <Route path="/advert" element={<AdvertFormat />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/agent" element={<UBPAgent />} />
            <Route path="/tutorial" element={<UBPTutorial />} />
          </Route>

          {/* Redirect unknown routes, allowing exceptions */}
          <Route path="*" element={<RedirectHandler />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
};

export default App;
