"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Github, Twitter, Linkedin, Heart, MessageCircle } from "lucide-react";

const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const footerLinks = {
    Product: ["Features", "Pricing", "Security", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Resources: ["Documentation", "Help Center", "API", "Status"],
    Legal: ["Privacy", "Terms", "Cookie Policy", "GDPR"],
};

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <footer className="relative bg-gray-900 text-white overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Glow Effect */}
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500 rounded-full filter blur-[150px] opacity-20"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Brand & Newsletter */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                QuickChat
                            </span>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 max-w-md"
                        >
                            Create instant chat rooms and connect with anyone, anywhere.
                            No downloads, no sign-ups, just pure communication.
                        </motion.p>

                        {/* Newsletter */}
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            onSubmit={handleSubscribe}
                            className="flex gap-2 max-w-md"
                        >
                            <div className="relative flex-1">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-indigo-500 pr-12"
                                />
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                >
                                    {subscribed ? (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            ✓
                                        </motion.span>
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </motion.div>
                        </motion.form>
                        {subscribed && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-green-400 text-sm"
                            >
                                Thanks for subscribing! 🎉
                            </motion.p>
                        )}
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {Object.entries(footerLinks).map(([category, links], idx) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <h4 className="font-semibold text-white mb-4">{category}</h4>
                                <ul className="space-y-2">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <Link
                                                href="#"
                                                className="text-gray-400 hover:text-white text-sm inline-block hover:translate-x-1 transition-all"
                                            >
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-gray-400 text-sm"
                        >
                            <span>© 2025 QuickChat. Made with</span>
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            </motion.span>
                            <span>by developers, for everyone.</span>
                        </motion.div>

                        {/* Social Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4"
                        >
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    );
}