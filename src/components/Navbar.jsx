import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import customPic from "/UBPMadeEasy.webp";
import { LuSearch } from "react-icons/lu";
import { LiaSignSolid } from "react-icons/lia";
import {
  FaQuestionCircle,
  FaListAlt,
  FaRobot,
  FaMagic
} from "react-icons/fa";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const location = useLocation();
  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { href: "/tutorial", icon: <FaMagic />, label: "UBP Tutorial" },
    { href: "/ubp", icon: <LuSearch />, label: "UBP/Advert" },
    { href: "/advert", icon: <LiaSignSolid />, label: "Advert Formats" },
    { href: "/agent", icon: <FaRobot />, label: "UBP Agent" },
    { href: "/faqs", icon: <FaQuestionCircle />, label: "FAQ" }
  ];

  return (
    <>
      {/* Modern Glassmorphism Navbar */}
      <nav
        className="backdrop-blur-md bg-white/70 dark:bg-[var(--color-surface)]/80 shadow-lg rounded-b-2xl border-b-4 border-b-[#FBCC1A] dark:border-b-[var(--color-primary)] sticky top-0 z-40 flex items-center justify-between px-4 py-2 md:px-8 transition-all duration-300"
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="flex items-center gap-3">
          {location.pathname !== "/" && location.pathname !== "/terms" && location.pathname !== "/guide" && (
            <button
              onClick={toggleDrawer}
              className="text-3xl text-emerald-900 hover:text-[#FBCC1A] focus:outline-none focus:ring-2 focus:ring-[#FBCC1A] rounded-full p-1 transition"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <IoMdMenu />
            </button>
          )}
          <Link to="/" className="flex items-center group" title="UBP Made Easy Home">
            <img
              className="rounded-full shadow-md border-2 border-emerald-900 dark:border-[var(--color-primary)] w-12 h-12 group-hover:scale-105 transition"
              src={customPic}
              alt="UBPMadeEasy Logo - Home"
              loading="lazy"
            />
            <span className="font-extrabold text-2xl ml-2 tracking-tight">
              <span className="text-emerald-900 dark:text-[var(--color-text)]">UBP</span>
              <span className="text-[#FBCC1A] dark:text-[var(--color-primary)]">Made</span>
              <span className="text-emerald-900 dark:text-[var(--color-text)]">Easy</span>
            </span>
          </Link>
        </div>
        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-2 items-center">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-lg transition shadow-sm hover:bg-[#FBCC1A]/80 hover:text-emerald-900 dark:hover:bg-[var(--color-primary)]/80 dark:hover:text-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[#FBCC1A] dark:focus:ring-[var(--color-primary)] ${location.pathname === item.href ? 'bg-[#FBCC1A]/90 text-emerald-900 dark:bg-[var(--color-primary)]/90 dark:text-[var(--color-surface)]' : 'text-emerald-900 dark:text-[var(--color-text)]'}`}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <ThemeSwitcher />
          </li>
        </ul>
        {/* Mobile Theme Switcher */}
        <div className="flex md:hidden items-center">
          <ThemeSwitcher />
        </div>
      </nav>

      {/* Sidebar Drawer with Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={drawerRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed top-0 left-0 h-screen w-72 max-w-full bg-white/90 dark:bg-[var(--color-bg)] backdrop-blur-xl shadow-2xl rounded-r-3xl z-40 border-r-4 border-[#FBCC1A] dark:border-[var(--color-primary)] overflow-y-auto flex flex-col"
            role="navigation"
            aria-label="Sidebar Navigation"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100 dark:border-[var(--color-primary)] px-2 pt-2">
              <div className="flex flex-row items-center">
                <Link to="/" title="Go to Home" onClick={() => setIsOpen(false)}>
                  <img
                    className="w-10 h-10 rounded-full border-2 border-emerald-900 dark:border-[var(--color-primary)] shadow-md"
                    src={customPic}
                    alt="UBPMadeEasy Sidebar Logo"
                  />
                </Link>
                <Link to="/" title="Go to Home" onClick={() => setIsOpen(false)}>
                  <span className="font-bold text-lg ml-1">
                    <span className="text-emerald-900 dark:text-[var(--color-text)]">UBP</span>
                    <span className="text-[#FBCC1A] dark:text-[var(--color-primary)]">Made</span>
                    <span className="text-emerald-900 dark:text-[var(--color-text)]">Easy</span>
                  </span>
                </Link>
              </div>
              <button
                onClick={toggleDrawer}
                className="text-3xl text-emerald-900 dark:text-[var(--color-primary)] hover:text-[#FBCC1A] dark:hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-[#FBCC1A] dark:focus:ring-[var(--color-primary)] rounded-full p-1 transition"
                aria-label="Close menu"
              >
                <IoMdClose />
              </button>
            </div>

            {/* Sidebar Menu */}
            <ul className="mt-8 space-y-3 px-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 text-emerald-900 dark:text-[var(--color-text)] px-4 py-3 rounded-2xl cursor-pointer shadow-md bg-white/90 dark:bg-[var(--color-surface)] hover:bg-[#FBCC1A]/90 dark:hover:bg-[var(--color-primary)] hover:text-emerald-900 dark:hover:text-[var(--color-bg)] transition duration-200 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#FBCC1A] dark:focus:ring-[var(--color-primary)] ${location.pathname === item.href ? 'bg-[#FBCC1A]/90 dark:bg-[var(--color-primary)]/90 text-emerald-900 dark:text-[var(--color-bg)]' : ''}`}
                    title={item.label}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li className="flex md:hidden justify-end mt-6 pr-2">
                <ThemeSwitcher />
              </li>
            </ul>
            <div className="flex-1" />
            {/* Optional: Add a footer or social links here */}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
