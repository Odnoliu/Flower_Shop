import React from "react";
import { motion } from "framer-motion";
import { useSidebar } from "../../context/sidebar_context";

export default function Footer() {
  const { isOpen } = useSidebar();

  return (
    <motion.footer
      animate={{
        marginLeft: isOpen ? 220 : 80,
        width: isOpen ? "calc(100% - 220px)" : "calc(100% - 80px)",
      }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-[#CDB38B] text-white py-4 text-center text-sm"
    >
      © 2025 Hale's Flower Shop — All Rights Reserved 🌸
    </motion.footer>
  );
}
