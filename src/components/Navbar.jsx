import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { motion } from "framer-motion";
import customPic from "/UBPMadeEasy.webp";
import { LuSearch } from "react-icons/lu";
import { LiaSignSolid } from "react-icons/lia";
// import { ImBooks } from "react-icons/im";
import {
  // FaMagic,
  FaQuestionCircle,
  FaListAlt,
  FaRobot
} from "react-icons/fa";

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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    // { href: "/guide", icon: <FaListAlt />, label: "User Guide" },
    { href: "/app", icon: <FaListAlt />, label: "UBP Process" },
    { href: "/ubp", icon: <LuSearch />, label: "UBP/Advert" },
    { href: "/advert", icon: <LiaSignSolid />, label: "Advert Formats" },
    { href: "/agent", icon: <FaRobot />, label: "UBP Agent" },
    // { href: "/financeact", icon: <ImBooks />, label: "Finance Act" },
    { href: "/faqs", icon: <FaQuestionCircle />, label: "FAQ" }

  ];

  return (
    <>
      {/* SEO-friendly Navbar */}
      <nav
        className="bg-white text-[#001F3F] sticky top-0 z-20 flex items-center justify-between p-2 shadow-md border-b-4 border-b-[#FBCC1A]"
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="flex items-center gap-3">
          {location.pathname !== "/" && location.pathname !== "/terms" && location.pathname !== "/guide" && (
            <button
              onClick={toggleDrawer}
              className="text-3xl text-emerald-900"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <IoMdMenu />
            </button>
          )}
          <Link to="/" className="flex items-center" title="UBP Made Easy Home">
            <img
              className="rounded-full shadow-sm border-2 border-emerald-900 w-10 h-10"
              src={customPic}
              alt="UBPMadeEasy Logo - Home"
              loading="lazy"
            />
            <span className="font-bold text-xl ml-2">
              <span className="text-emerald-900">UBP</span>
              <span className="text-emerald-900">Made</span>
              <span className="text-emerald-900">Easy</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* SEO-friendly Sidebar Drawer */}
      <motion.aside
        ref={drawerRef}
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 h-screen w-64 bg-white shadow-xl p-5 z-30 border-r-4 border-[#FBCC1A] overflow-y-auto"
        role="navigation"
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex flex-row items-center">
            <Link to="/" title="Go to Home">
              <img
                className="w-10 h-10 rounded-full border-2 border-emerald-900 shadow-sm"
                src={customPic}
                alt="UBPMadeEasy Sidebar Logo"
              />
            </Link>
            <Link to="/" title="Go to Home">
              <span className="font-bold text-lg ml-1">
                <span className="text-emerald-900">UBP</span>
                <span className="text-emerald-900">Made</span>
                <span className="text-emerald-900">Easy</span>
              </span>
            </Link>
          </div>
          <button
            onClick={toggleDrawer}
            className="text-2xl text-emerald-900"
            aria-label="Close menu"
          >
            <IoMdClose />
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="mt-6 space-y-3">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className="flex items-center gap-4 text-emerald-900 p-3 rounded-lg cursor-pointer shadow-md hover:bg-[#FBCC1A] transition duration-300"
                title={item.label}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-lg">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.aside>
    </>
  );
};

export default Navbar;
