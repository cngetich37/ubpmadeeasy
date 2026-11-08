import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import UBPHome from "./components/UBPHome";
import AdvertFormat from "./components/AdvertFormat";
import Guide from "./components/Guide";
import FAQS from "./components/FAQs";
import TermsAndConditions from "./components/TermsAndConditions";
import ProtectedRoute from "./components/ProtectedRoute";
import CombinedSearch from "./components/CombinedSearch";
import UBPAgent from "./components/UBPAgent";
import UBPTutorial from "./components/UBPTutorial";
import { FINANCE_ACT_URL, NAIROBI_PAY_URL } from "./config";

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
          <Route path="/agent" element={<UBPAgent/>}/>
          <Route path="/tutorial" element={<UBPTutorial/>}/>
        </Route>

        {/* Redirect unknown routes, allowing exceptions */}
        <Route path="*" element={<RedirectHandler />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
