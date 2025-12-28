"use client";
import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
    {
        quote: "QuickChat is a game-changer! The fastest way to start a chat. I use it daily for team standups.",
        name: "John Doe",
        role: "Senior Developer",
        avatar: "/images/user1.png",
        rating: 5,
    },
    {
        quote: "The encryption is top-notch. I feel secure using QuickChat for all my private conversations.",
        name: "Jane Smith",
        role: "Product Designer",
        avatar: "/images/user2.png",
        rating: 5,
    },
    {
        quote: "Finally, a chat app that just works. No sign-ups, no downloads. Pure simplicity.",
        name: "Mike Johnson",
        role: "Startup Founder",
        avatar: "/images/user3.png",
        rating: 5,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -10 },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut" as const,
        },
    },
};

function ReviewCard({ review, index }: { review: typeof reviews[0]; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

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
            variants={cardVariants}
            whileHover={{ y: -10, scale: 1.02 }}
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-transparent transition-all duration-300">
                {/* Quote Icon */}
                <motion.div
                    className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    style={{ translateZ: 30 }}
                >
                    <Quote className="w-5 h-5 text-white" />
                </motion.div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                    ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                    &ldquo;{review.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                    <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        style={{ translateZ: 20 }}
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-0.5">
                            <img
                                src={review.avatar}
                                alt={review.name}
                                className="w-full h-full rounded-full object-cover bg-white"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.name}&background=6366f1&color=fff`;
                                }}
                            />
                        </div>
                    </motion.div>
                    <div>
                        <div className="font-semibold text-gray-900">{review.name}</div>
                        <div className="text-sm text-gray-500">{review.role}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function UserReviews() {
    return (
        <section className="relative py-24 px-4 md:px-8 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-10 left-10 w-64 h-64 bg-indigo-100 rounded-full filter blur-3xl opacity-40"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-10 right-10 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl opacity-40"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center mb-16"
            >
                <motion.span
                    className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4"
                    whileHover={{ scale: 1.05 }}
                >
                    Testimonials
                </motion.span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                    Loved by{" "}
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        thousands
                    </span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Do not just take our word for it. Here is what our users have to say.
                </p>
            </motion.div>

            {/* Reviews Grid */}
            <motion.div
                className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} index={index} />
                ))}
            </motion.div>

            {/* Floating Elements */}
            <motion.div
                className="absolute top-1/2 left-4 opacity-10"
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
            >
                <Quote className="w-24 h-24 text-indigo-600" />
            </motion.div>
            <motion.div
                className="absolute top-1/3 right-4 opacity-10"
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
            >
                <Star className="w-16 h-16 text-purple-600" />
            </motion.div>
        </section>
    );
}
