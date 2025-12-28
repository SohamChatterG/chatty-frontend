"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import ProfileMenu from "../../auth/ProfileMenu";
import { useTheme } from "@/contexts/ThemeContext";

export function DashNav({ name, image }: { name: string; image?: string | null }) {
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`sticky top-0 z-50 p-6 flex justify-between items-center transition-all duration-300 ${scrolled
                    ? isDark
                        ? "bg-slate-900/80 backdrop-blur-lg shadow-lg border-b border-white/10"
                        : "bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200"
                    : "bg-transparent"
                }`}
        >
            <Link href="/">
                <motion.h1
                    className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${isDark
                            ? "from-purple-400 via-pink-400 to-indigo-400"
                            : "from-purple-600 via-pink-600 to-indigo-600"
                        } bg-clip-text text-transparent cursor-pointer`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    QuickChat
                </motion.h1>
            </Link>
            <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
                <motion.button
                    onClick={toggleTheme}
                    className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isDark ? "bg-slate-700" : "bg-purple-200"
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-purple-500" : "bg-white"
                            } shadow-lg`}
                        animate={{
                            left: isDark ? "4px" : "36px",
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        {isDark ? (
                            <Moon className="w-4 h-4 text-white" />
                        ) : (
                            <Sun className="w-4 h-4 text-yellow-500" />
                        )}
                    </motion.div>
                </motion.button>
                <ProfileMenu name={name} image={image} />
            </div>
        </motion.nav>
    );
}
