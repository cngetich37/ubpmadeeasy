import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaRegLightbulb, FaCheckCircle, FaArrowRight } from "react-icons/fa";

const steps = [
  {
    title: "UBP/Advert",
    description: (
      <>
        Go to the <strong>UBP/Advert</strong> page and select a business activity.
      </>
    ),
  },
  {
    title: "Record Codes",
    description: (
      <>
        Write down the <strong>Industry code</strong>, <strong>Business Category code</strong>, <strong>Business Subcategory code</strong>, and <strong>Business Activity code</strong>.
      </>
    ),
  },
  {
    title: "Visit NairobiPay Portal",
    description: (
      <>Visit the <strong>NairobiPay</strong> portal to apply for a Unified Business Permit.</>
    ),
  },
  {
    title: "Navigate to UBP Section",
    description: (
      <>
        On the NairobiPay portal, go to the
        <span className="inline-flex gap-1 font-semibold text-emerald-900 ml-1">
          <span>Services</span>
          <FaArrowRight className="inline-block text-yellow-500" />
          <span>Business Licensing</span>
          <FaArrowRight className="inline-block text-yellow-500" />
          <span>Unified Business Permit</span>
        </span>
      </>
    ),
  },
  {
    title: "Select Business Activity",
    description: (
      <>
        Use the codes you wrote down to select the correct business activity on the <strong>Business Activity Information</strong> page.
      </>
    ),
  },
  {
    title: "Quick Access",
    description: (
      <>
        To proceed, click {" "}
        <Link
          to="/ubp"
          className="text-yellow-600 font-semibold underline hover:text-yellow-500 transition-colors"
        >
          UBP/Advert
        </Link>
        .
      </>
    ),
  },
];

const Guide = () => {
  return (
    <>
      <Helmet>
        <title>User Guide - UBPGuide</title>
        <meta
          name="description"
          content="Learn how to navigate the NairobiPay Portal and apply for a Unified Business Permit. Follow step-by-step guidance on business activity classification and permit application."
        />
        <meta
          name="keywords"
          content="Unified Business Permit, NairobiPay Portal, business activity, business category, business subcategory, industry, business licensing, UBP application, NAICS classification"
        />
        <meta name="author" content="Collins Ngetich" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col items-center justify-center px-2 py-8">
        {/* Hero Section */}
        <section className="w-full max-w-3xl flex flex-col items-center text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <span className="bg-yellow-400 rounded-full p-4 shadow-lg shadow-yellow-500/30">
              <FaRegLightbulb className="text-4xl text-emerald-900" />
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2 drop-shadow-lg">
            User Guide
          </h1>
          <p className="text-lg text-emerald-100 max-w-xl mb-2">
            Step-by-step instructions to help you navigate the NairobiPay Portal and apply for your Unified Business Permit with ease.
          </p>
          <div className="h-1 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 w-2/3 mx-auto mt-2 rounded-full"></div>
        </section>

        {/* Steps Section */}
        <section className="w-full max-w-3xl bg-white/90 p-6 md:p-10 rounded-2xl border-4 border-yellow-500 shadow-xl shadow-yellow-500/30 animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-emerald-900 mb-8 tracking-tight">
            How to Apply
          </h2>
          <ol className="flex flex-col gap-8">
            {steps.map((step, idx) => (
              <li
                key={idx}
                className="relative flex items-start group transition-transform duration-200 hover:scale-[1.02]"
              >
                <span className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                  idx === steps.length - 1
                    ? "border-yellow-500 bg-yellow-400"
                    : "border-emerald-900 bg-emerald-900"
                } shadow-lg mr-5 transition-colors duration-200 group-hover:bg-yellow-400 group-hover:border-yellow-500`}>
                  {idx === steps.length - 1 ? (
                    <FaCheckCircle className="text-3xl text-emerald-900" />
                  ) : (
                    <span className="text-2xl text-yellow-400 font-bold">{idx + 1}</span>
                  )}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold text-emerald-900 mb-1">
                    {step.title}
                  </h3>
                  <div className="text-emerald-900/90 text-base md:text-lg leading-relaxed">
                    {step.description}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </>
  );
};

export default Guide;
