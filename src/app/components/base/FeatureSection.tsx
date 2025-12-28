"use client";
import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Rocket, Shield, Globe, Zap, Users, Lock } from "lucide-react";

const features = [
    {
        icon: Rocket,
        title: "Instant Setup",
        description: "Generate a room link in seconds. No account required to join.",
        gradient: "from-orange-400 to-pink-500",
        bgGradient: "from-orange-50 to-pink-50",
    },
    {
        icon: Shield,
        title: "End-to-End Secure",
        description: "Passcode protection and encryption for your private conversations.",
        gradient: "from-green-400 to-emerald-500",
        bgGradient: "from-green-50 to-emerald-50",
    },
    {
        icon: Globe,
        title: "Cross-Platform",
        description: "Works seamlessly on any device with a modern web browser.",
        gradient: "from-blue-400 to-indigo-500",
        bgGradient: "from-blue-50 to-indigo-50",
    },
    {
        icon: Zap,
        title: "Real-Time Messaging",
        description: "Instant message delivery with typing indicators and read receipts.",
        gradient: "from-yellow-400 to-orange-500",
        bgGradient: "from-yellow-50 to-orange-50",
    },
    {
        icon: Users,
        title: "Group Chats",
        description: "Create public or private groups with admin controls and moderation.",
        gradient: "from-purple-400 to-violet-500",
        bgGradient: "from-purple-50 to-violet-50",
    },
    {
        icon: Lock,
        title: "Privacy First",
        description: "Your conversations stay private. No data selling, ever.",
        gradient: "from-red-400 to-rose-500",
        bgGradient: "from-red-50 to-rose-50",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut" as const,
        },
    },
};

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isHovered) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: useSpring(rotateX, { damping: 20, stiffness: 200 }),
                rotateY: useSpring(rotateY, { damping: 20, stiffness: 200 }),
                transformStyle: "preserve-3d",
            }}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <motion.div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    style={{ translateZ: 20 }}
                >
                    <feature.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                {/* Hover Arrow */}
                <motion.div
                    className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                >
                    <span className="text-indigo-600 text-2xl">→</span>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function FeatureSection() {
    return (
        <section
            id="features"
            className="relative py-24 px-4 md:px-8 lg:px-12 bg-white overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center mb-16"
            >
                <motion.span
                    className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    Features
                </motion.span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                    Everything you need to{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        connect
                    </span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Powerful features designed to make your conversations seamless and secure.
                </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {features.map((feature, index) => (
                    <FeatureCard key={index} feature={feature} index={index} />
                ))}
            </motion.div>
        </section>
    );
}
