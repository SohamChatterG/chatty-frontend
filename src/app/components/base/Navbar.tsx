"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LoginModal from "../auth/LoginModal";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Navbar({ user }: { user: CustomUser | null }) {
    const [scrolled, setScrolled] = useState(false);
    const [isNavigatingToDashboard, setIsNavigatingToDashboard] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleDashboardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isNavigatingToDashboard) return;
        setIsNavigatingToDashboard(true);
        router.push("/dashboard");
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center transition-all duration-300 ${scrolled
                    ? "bg-white/80 backdrop-blur-lg shadow-lg"
                    : "bg-transparent"
                }`}
        >
            <motion.h1
                className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
            >
                <Link href="/">QuickChat</Link>
            </motion.h1>

            <div className="flex items-center space-x-4 md:space-x-8">
                <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Link
                        href="/"
                        className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                        Home
                    </Link>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Link
                        href="#features"
                        className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                    >
                        Features
                    </Link>
                </motion.div>

                {!user ? (
                    <LoginModal />
                ) : (
                    <motion.div
                        whileHover={{ scale: isNavigatingToDashboard ? 1 : 1.05 }}
                        whileTap={{ scale: isNavigatingToDashboard ? 1 : 0.95 }}
                    >
                        <Button 
                            onClick={handleDashboardClick}
                            disabled={isNavigatingToDashboard}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                        >
                            {isNavigatingToDashboard ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Dashboard"
                            )}
                        </Button>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}