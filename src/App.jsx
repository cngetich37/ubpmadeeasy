import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import UBPHome from "./components/UBPHome";
// import FinanceAct from "./components/FinanceAct";
import AdvertFormat from "./components/AdvertFormat";
import Guide from "./components/Guide";
import FAQS from "./components/FAQs";
import TermsAndConditions from "./components/TermsAndConditions";
import ProtectedRoute from "./components/ProtectedRoute";
import CombinedSearch from "./components/CombinedSearch";
import UBPAgent from "./components/UBPAgent";
import UBPTutorial from "./components/UBPTutorial";

const exceptionLinks = [
  "https://nairobi.go.ke/download/the-nairobi-city-county-finance-act2023/",
  "https://www.nairobiservices.go.ke/",
];

const RedirectHandler = () => {
  const location = useLocation();

  // Check if the current path matches an exception
  const matchingException = exceptionLinks.find((link) =>
    location.pathname.includes(new URL(link).pathname)
  );

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
          {/* <Route path="/financeact" element={<FinanceAct />} /> */}
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
