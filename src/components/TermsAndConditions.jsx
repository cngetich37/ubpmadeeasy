import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import logo from "/UBPMadeEasy.webp";
import { motion } from "framer-motion";

const generateToken = () => {
  const token = {
    value: Math.random().toString(36).slice(2),
    expiry: Date.now() + 2 * 60 * 60 * 1000, // 2 hours expiry
  };
  localStorage.setItem("authToken", JSON.stringify(token));
};

const handleAccept = (navigate) => {
  generateToken();
  navigate("/guide"); // Redirect to guide after accepting
};

const handleDeny = (navigate) => {
  localStorage.removeItem("authToken");
  navigate("/"); // Redirect to home if denied
};

const AuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = JSON.parse(localStorage.getItem("authToken"));
      if (!token || Date.now() > token.expiry) {
        localStorage.removeItem("authToken");
        navigate("/terms"); // Redirect to terms if token is missing/expired
      }
    };

    checkToken(); // Check on mount

    // Optional: Re-check token every minute
    const interval = setInterval(checkToken, 60 * 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [navigate]);

  return null;
};

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <>
      <AuthCheck />
      <Helmet>
        <title>Terms & Conditions - UBPMadeEasy</title>
        <meta
          name="description"
          content="Review the terms and conditions for using the UBPGuide application."
        />
      </Helmet>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 dark:from-[var(--color-bg)] dark:via-[var(--color-surface)] dark:to-[var(--color-bg)] px-2 py-8 sm:py-12 overflow-x-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-800/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-[#FFD700]/10 rounded-full blur-2xl animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
        </div>
        <motion.section
          className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-[var(--color-surface)]/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-[#FFD700] dark:border-[var(--color-primary)] p-0 sm:p-0 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Header with Logo */}
          <header className="flex flex-col items-center justify-center pt-8 pb-4 px-4 text-center">
            <img
              src={logo}
              alt="UBPMadeEasy Logo"
              className="w-24 sm:w-28 md:w-32 rounded-full border-4 border-[#FFD700] dark:border-[var(--color-primary)] shadow-lg bg-white dark:bg-[var(--color-surface)] p-1 mb-3 animate-spin-slow"
              style={{ boxShadow: '0 0 30px 0 #FFD70055' }}
            />
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] via-[#FFEC8B] to-[#FFD700] dark:from-[var(--color-primary)] dark:via-yellow-300 dark:to-[var(--color-primary)] drop-shadow-lg mb-2 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-emerald-900 dark:text-[var(--color-text)] text-lg font-medium mb-2 max-w-xl mx-auto">
              Please review and accept our terms to continue using UBPMadeEasy.
            </p>
            <div className="h-1 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 dark:from-[var(--color-primary)] dark:via-yellow-300 dark:to-[var(--color-primary)] w-2/3 mx-auto mt-2 rounded-full" />
          </header>

          {/* Disclaimer Section */}
          <motion.section
            aria-labelledby="disclaimer-title"
            className="mb-6 px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-red-100 dark:bg-red-900 border-l-8 border-red-400 dark:border-red-600 p-5 rounded-xl shadow-md flex items-center gap-4 mb-4">
              <span className="text-2xl md:text-3xl text-red-500 dark:text-red-300">⚠️</span>
              <div>
                <h2 id="disclaimer-title" className="text-lg font-bold text-emerald-900 dark:text-[var(--color-text)] mb-1">
                  Disclaimer
                </h2>
                <p className="text-emerald-900 dark:text-[var(--color-text)] text-sm font-medium italic">
                  <span className="font-semibold text-emerald-900 dark:text-[var(--color-text)]">Notice:</span> This software is provided free of charge and is intended as an informational tool. Users should not rely on this system as an official source of truth. Errors or inaccuracies may exist. It is recommended to consult the
                  <a
                    href="https://nairobi.go.ke/download/the-nairobi-city-county-finance-act2023/"
                    className="text-emerald-900 dark:text-yellow-300 hover:text-[#A71D2D] dark:hover:text-yellow-400 font-bold underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Finance Act 2023
                  </a>
                  {" "}and seek guidance from Unified Business Permit subject matter experts for accurate legal and regulatory information.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Terms List Section */}
          <motion.section
            className="bg-gradient-to-br from-yellow-200/80 via-yellow-100/90 to-yellow-50/80 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-yellow-900/10 p-8 rounded-2xl shadow-lg border border-yellow-400 dark:border-yellow-700 mx-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ul className="text-emerald-900 dark:text-[var(--color-text)] text-base sm:text-lg font-medium list-disc list-inside space-y-4">
              <li>This software is free to use and does not require any subscription or payment.</li>
              <li>This app is intended as an aid and should not replace the official NairobiPay portal.</li>
              <li>The information provided is for reference only and is not legally binding.</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of the data presented.</li>
              <li>Users should verify information independently before making a Unified Business Permit application.</li>
              <li>We are not liable for any losses or damages resulting from the use of this software.</li>
              <li>Users are responsible for ensuring the accuracy of the data they input.</li>
              <li>This application does not store sensitive personal data, and users should be mindful of their inputs.</li>
              <li>External links are provided for convenience; we are not responsible for third-party content.</li>
              <li>We reserve the right to modify or discontinue any part of this software without prior notice.</li>
              <li>This software does not provide legal, financial, or business advice. Consult Unified Business Permit subject matter experts for guidance.</li>
              <li>We may terminate access to users who misuse or violate these terms.</li>
              <li>By using this software, you agree to these terms and conditions.</li>
            </ul>
          </motion.section>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-6 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <button
              onClick={() => handleAccept(navigate)}
              className="bg-gradient-to-r from-emerald-900 to-emerald-700 dark:from-[var(--color-primary)] dark:to-emerald-800 text-white font-bold py-3 px-10 rounded-xl shadow-lg hover:bg-[#A71D2D] dark:hover:bg-yellow-700 hover:from-[#A71D2D] hover:to-[#A71D2D] hover:text-yellow-300 transition-all text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[var(--color-primary)] focus:ring-offset-2"
              aria-label="Accept Terms and Continue"
            >
              Accept
            </button>
            <button
              onClick={() => handleDeny(navigate)}
              className="bg-gradient-to-r from-red-500 to-red-700 dark:from-red-800 dark:to-red-900 text-white font-bold py-3 px-10 rounded-xl shadow-lg hover:bg-[#111] dark:hover:bg-gray-800 hover:from-[#111] hover:to-[#111] transition-all text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-700 focus:ring-offset-2"
              aria-label="Deny Terms and Exit"
            >
              Deny
            </button>
          </motion.div>
        </motion.section>
      </main>
    </>
  );
};

export default TermsAndConditions;
