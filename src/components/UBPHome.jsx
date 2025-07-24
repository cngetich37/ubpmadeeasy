import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "/UBPMadeEasy.webp";

const featureData = [
  {
    title: "Step-by-Step Guide",
    desc: "Simple, step-by-step instructions to guide you through the process.",
    icon: (
      <svg className="h-7 w-7 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
    ),
  },
  {
    title: "UBP & Advert",
    desc: "Search for unified business permit business activity and advert small format.",
    icon: (
      <svg className="h-7 w-7 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4" /></svg>
    ),
  },
  {
    title: "FAQ",
    desc: "Get answers to the frequently asked questions with the FAQ.",
    icon: (
      <svg className="h-7 w-7 text-emerald-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 14h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" /></svg>
    ),
  },
];

const UBPHome = () => {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white flex items-center justify-center px-2 sm:px-6 py-8 sm:py-12 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-emerald-800/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-[#FFD700]/10 rounded-full blur-2xl animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.header
          className="flex flex-col items-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="relative mb-5"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <img
              src={logo}
              alt="UBP Logo"
              className="w-28 sm:w-36 md:w-44 mx-auto rounded-full border-4 border-[#FFD700] shadow-2xl bg-white p-1 animate-spin-slow"
              style={{ boxShadow: '0 0 40px 0 #FFD70055' }}
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-[#FFD700]/40 blur-lg rounded-full opacity-70" />
          </motion.div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] via-[#FFEC8B] to-[#FFD700] drop-shadow-lg tracking-tight mb-3">
            UBPMadeEasy
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-light max-w-2xl mx-auto text-center text-white/90 leading-relaxed mb-2">
            Navigate the UBP application process with clarity and confidence - every step made easy.
          </p>
          <span className="inline-block bg-[#FFD700]/20 text-[#FFD700] text-xs sm:text-sm font-semibold px-4 py-1 rounded-full mt-2 tracking-wide shadow-sm">No registration needed</span>
        </motion.header>

        {/* Features Section */}
        <section className="mb-14 sm:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {featureData.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-7 sm:p-9 border border-white/20 hover:border-[#FFD700]/60 transition-all duration-300 shadow-xl group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx + 0.2 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className="flex items-center justify-center mb-5">
                  <div className="bg-[#FFD700] w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white/30 group-hover:scale-110 group-hover:shadow-2xl transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#FFD700] mb-2 text-center drop-shadow-sm">{feature.title}</h3>
                <p className="text-white/85 text-base sm:text-lg text-center font-light">
                  {feature.desc}
                </p>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow: '0 0 40px 10px #FFD70033'}} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-7 drop-shadow-md">
            Ready to <span className="text-[#FFD700]">simplify</span> your UBP journey?
          </h2>
          <Link to="/terms" aria-label="Terms and Conditions">
            <motion.button
              whileHover={{ scale: 1.07, boxShadow: "0 10px 30px -5px rgba(255, 215, 0, 0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="relative bg-gradient-to-r from-[#FFD700] to-[#FFEC8B] text-emerald-900 px-12 sm:px-16 py-4 sm:py-5 rounded-full text-xl sm:text-2xl font-extrabold shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 overflow-hidden group border-2 border-[#FFD700]/70"
              aria-label="Get Started with UBP Guide"
            >
              <span className="relative z-10">Get Started Now</span>
              {/* Animated sparkles */}
              <span className="absolute left-1/2 top-1/2 w-32 h-32 bg-[#FFD700]/30 rounded-full blur-2xl opacity-0 group-hover:opacity-80 transition-all duration-500 -translate-x-1/2 -translate-y-1/2" />
              <span className="absolute right-6 top-2 w-3 h-3 bg-[#FFD700] rounded-full blur-sm opacity-70 animate-ping" />
            </motion.button>
          </Link>
          <div className="mt-3 text-xs text-white/60">By continuing, you agree to our <Link to="/terms" className="underline text-[#FFD700] hover:text-[#FFEC8B]">Terms & Conditions</Link>.</div>
        </motion.section>
      </div>
    </main>
  );
};

export default UBPHome;
