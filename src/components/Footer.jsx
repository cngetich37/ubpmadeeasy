import React from "react";

const Footer = () => {
  return (
    <footer
      className="bg-white dark:bg-[var(--color-surface)] border-t-4 border-t-[#FFD700] dark:border-t-[var(--color-primary)] text-emerald-900 dark:text-[var(--color-text)] font-medium px-2 py-2 md:py-0 shadow-inner"
      role="contentinfo"
      aria-label="Footer section"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-xs md:text-sm">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/logo.svg"
            alt="UBPMadeEasy Logo"
            className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md mt-1 rounded-full"
            loading="lazy"
          />
          <span className="font-bold tracking-wide text-emerald-900 dark:text-[var(--color-text)] whitespace-nowrap">UBPMadeEasy</span>
          <span className="text-emerald-800 dark:text-[var(--color-text)] italic truncate max-w-[160px] md:max-w-xs ml-2">UBP, The Easy Way.</span>
        </div>

        {/* Quick Links */}
        <nav className="flex gap-2 md:gap-4 text-center" aria-label="Footer navigation">
          <a href="/" className="hover:text-[#FFD700] dark:hover:text-[var(--color-primary)] transition-colors duration-200">Home</a>
          <a href="/guide" className="hover:text-[#FFD700] dark:hover:text-[var(--color-primary)] transition-colors duration-200">Guide</a>
          <a href="/faqs" className="hover:text-[#FFD700] dark:hover:text-[var(--color-primary)] transition-colors duration-200">FAQs</a>
          <a href="/advert" className="hover:text-[#FFD700] dark:hover:text-[var(--color-primary)] transition-colors duration-200">Advert Formats</a>
        </nav>

        {/* Copyright */}
        <span className="text-gray-500 dark:text-white whitespace-nowrap">&copy; {new Date().getFullYear()} UBPMadeEasy. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
