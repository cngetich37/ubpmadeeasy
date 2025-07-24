import React from "react";

const Footer = () => {
  return (
    <footer
      className="bg-white border-t-4 border-t-[#FFD700] text-emerald-900 font-medium px-4 py-8 md:py-10 mt-8 shadow-inner"
      role="contentinfo"
      aria-label="Footer section"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-8">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <img
            src="/logo.svg"
            alt="UBPMadeEasy Logo"
            className="w-16 h-16 mb-1 drop-shadow-md hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <span className="text-lg font-bold tracking-wide text-emerald-900">UBPMadeEasy</span>
          <span className="text-sm text-emerald-800 italic">Empowering Your Business Journey, One Permit at a Time!</span>
        </div>

        {/* Quick Links */}
        <nav className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-left mt-6 md:mt-0" aria-label="Footer navigation">
          <a href="/" className="hover:text-[#FFD700] transition-colors duration-200">Home</a>
          <a href="/guide" className="hover:text-[#FFD700] transition-colors duration-200">Guide</a>
          <a href="/faqs" className="hover:text-[#FFD700] transition-colors duration-200">FAQs</a>
          <a href="/advert" className="hover:text-[#FFD700] transition-colors duration-200">Advert Formats</a>
        </nav>

        {/* Copyright */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <span className="text-xs text-gray-500">&copy; {new Date().getFullYear()} UBPMadeEasy. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
