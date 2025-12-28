"use client";
import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Heart } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function FooterDashboard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <footer
            className={`relative mt-20 border-t backdrop-blur-sm transition-colors duration-300 ${isDark
                    ? "border-white/10 bg-slate-900/50"
                    : "border-slate-200 bg-white/50"
                }`}
        >
            <div className="container mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Left section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        <span>© 2025 QuickChat. Made with</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </motion.span>
                    </motion.div>

                    {/* Center links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`flex gap-6 text-sm ${isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        <motion.a
                            href="#"
                            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-slate-900"
                                }`}
                            whileHover={{ y: -2 }}
                        >
                            Privacy Policy
                        </motion.a>
                        <motion.a
                            href="#"
                            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-slate-900"
                                }`}
                            whileHover={{ y: -2 }}
                        >
                            Terms of Service
                        </motion.a>
                        <motion.a
                            href="#"
                            className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-slate-900"
                                }`}
                            whileHover={{ y: -2 }}
                        >
                            Contact
                        </motion.a>
                    </motion.div>

                    {/* Social links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4"
                    >
                        <motion.a
                            href="https://github.com/SohamChatterG"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark
                                    ? "bg-white/10 hover:bg-white/20"
                                    : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
                                }`}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Github
                                className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-slate-700"
                                    }`}
                            />
                        </motion.a>
                        <motion.a
                            href="https://www.linkedin.com/in/sohamchatterg/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark
                                    ? "bg-white/10 hover:bg-white/20"
                                    : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
                                }`}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Linkedin
                                className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-slate-700"
                                    }`}
                            />
                        </motion.a>
                    </motion.div>
                </div>

                {/* Version info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className={`text-center mt-6 text-sm ${isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                >
                    Version 1.0.3 | Last Updated: March 2025
                </motion.div>
            </div>
        </footer>
    );
}

export default FooterDashboard;
