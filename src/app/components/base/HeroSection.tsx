"use client";
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, Sparkles, Zap, Shield } from "lucide-react";

const floatingAnimation = {
    initial: { y: 0 },
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" as const,
        },
    },
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut" as const,
        },
    },
};

export default function HeroSection() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 150 });
    const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 150 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Normalize to -1 to 1
            const x = (clientX / innerWidth - 0.5) * 2;
            const y = (clientY / innerHeight - 0.5) * 2;

            setMousePosition({ x: clientX, y: clientY });
            mouseX.set(x * 50);
            mouseY.set(y * 50);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs with Cursor Following */}
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
                    style={{
                        x: smoothMouseX,
                        y: smoothMouseY,
                    }}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
                    style={{
                        x: useSpring(mouseX, { damping: 40, stiffness: 100 }),
                        y: useSpring(mouseY, { damping: 40, stiffness: 100 }),
                    }}
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
                    style={{
                        x: useSpring(mouseX, { damping: 25, stiffness: 120 }),
                        y: useSpring(mouseY, { damping: 25, stiffness: 120 }),
                    }}
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* Main Content */}
            <motion.div
                className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {/* Badge */}
                <motion.div
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-100 shadow-lg mb-8"
                >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                        Real-time messaging made simple
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    variants={fadeInUp}
                    className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
                >
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                        Chat Links for
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Seamless Conversations
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    variants={fadeInUp}
                    className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    QuickChat makes it effortless to create secure chat rooms and start
                    conversations in seconds. No downloads, no hassle.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/dashboard">
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                size="lg"
                                className="group relative px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300"
                            >
                                <span className="flex items-center gap-2">
                                    Start Chatting
                                    <motion.span
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        →
                                    </motion.span>
                                </span>
                            </Button>
                        </motion.div>
                    </Link>

                    <Link href="#features">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="px-8 py-6 text-lg border-2 border-gray-200 hover:border-indigo-300 rounded-xl hover:bg-indigo-50 transition-all"
                            >
                                Learn More
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16"
                >
                    {[
                        { value: "10K+", label: "Active Users" },
                        { value: "50K+", label: "Messages Sent" },
                        { value: "99.9%", label: "Uptime" },
                    ].map((stat, index) => (
                        <motion.div key={index} className="text-center" whileHover={{ y: -5 }}>
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Floating Chat Bubbles Animation with Parallax */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[
                    { icon: MessageCircle, top: "20%", left: "10%", delay: 0, speed: 0.02 },
                    { icon: Zap, top: "60%", left: "5%", delay: 1, speed: 0.03 },
                    { icon: Shield, top: "30%", right: "8%", delay: 0.5, speed: 0.025 },
                    { icon: MessageCircle, top: "70%", right: "12%", delay: 1.5, speed: 0.015 },
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{
                            top: item.top,
                            left: item.left,
                            right: item.right,
                            x: useSpring(mouseX, { damping: 50, stiffness: 100 }),
                            y: useSpring(mouseY, { damping: 50, stiffness: 100 }),
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.2, scale: 1 }}
                        transition={{ delay: item.delay, duration: 0.5 }}
                    >
                        <motion.div
                            variants={floatingAnimation}
                            initial="initial"
                            animate="animate"
                            style={{
                                x: useSpring(mouseX, { damping: 30 }),
                                y: useSpring(mouseY, { damping: 30 }),
                            }}
                        >
                            <item.icon className="w-8 h-8 md:w-12 md:h-12 text-indigo-400" />
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1.5 h-3 bg-indigo-500 rounded-full"
                        animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}
