import React from "react";
import { Link } from "react-router-dom";
import { LiaSignSolid } from "react-icons/lia";
import { FcFeedback } from "react-icons/fc";
import { LuSearch } from "react-icons/lu";
import { MdOutlineBusinessCenter, MdImageSearch } from "react-icons/md";
import { BsFillQuestionSquareFill, BsQuestionSquare } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const SideBar = () => {
  const [key, setKey] = useState(0);
  const menuItems = [
    { href: "/guide", icon: <FiUser />, label: "User Guide" },
    { href: "/ubp", icon: <LuSearch />, label: "UBP/Advert" },
    { href: "/advert", icon: <LiaSignSolid />, label: "Advert Formats" },
    { href: "/advertsearch", icon: <MdImageSearch />, label: "Search Advert" },
    { href: "/app", icon: <BsFillQuestionSquareFill />, label: "UBP process" },
    { href: "/naics", icon: <MdOutlineBusinessCenter />, label: "NAICS" },
    { href: "/contact", icon: <FcFeedback />, label: "Feedback" },
    { href: "/faqs", icon: <BsQuestionSquare />, label: "FAQs" }
  ];
  const divStyle = {
    marginTop: "0.5rem",
    marginLeft: "0.5rem",
    fontSize: "1.3rem",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prevKey) => prevKey + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <nav className="hidden bg-white dark:bg-[var(--color-surface)] md:flex flex-col w-1/5 h-screen rounded-md overflow-y-auto">
      <motion.div
        key={key}
        style={divStyle}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
        }}
        className="flex flex-row font-bold italic justify-center mb-2"
      >
        <motion.span
          className="text-[#065A38] dark:text-[var(--color-primary)]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            delay: 0.3,
          }}
        >
          UBP
        </motion.span>
        <motion.span
          className="text-[#FBCC1A] dark:text-[var(--color-primary)]"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            delay: 0.6,
          }}
        >
          Jiji
        </motion.span>
      </motion.div>
      <ul className="grid grid-cols-1 gap-6">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.href} className="group">
            <li className="flex items-center gap-5 bg-[#FBCC1A] dark:bg-[var(--color-primary)] text-[#065A38] dark:text-[var(--color-bg)] p-4 rounded-lg shadow-md cursor-pointer transition duration-300 hover:bg-[#FFD700] dark:hover:bg-yellow-300 hover:scale-105">
              <span className="text-3xl">{item.icon}</span>
              <span className="font-medium text-lg">{item.label}</span>
            </li>
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default SideBar;
