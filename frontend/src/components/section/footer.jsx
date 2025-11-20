import React from "react";
import { motion } from "framer-motion";


export default function Footer() {
  return (
    <motion.footer
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-[#CDB38B] text-white py-4 text-center text-sm"
    >
      © 2025 Hale's Flower Shop — All Rights Reserved 
    </motion.footer>
  );
}
