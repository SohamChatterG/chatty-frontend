"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DashNav } from "../components/base/dashboard/DashNav";
import CreateChat from "@/groupChat/CreateChat";
import { GroupChatCard } from "@/groupChat/GroupChatCard";
import FooterDashboard from "../components/base/FooterDashboard";
import { ChatGroupType } from "@/types";
import { MessageSquare, Search, X } from "lucide-react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
};

function DashboardContent({
    session,
    groups,
}: {
    session: any;
    groups: Array<ChatGroupType>;
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [searchQuery, setSearchQuery] = useState("");

    // Filter groups based on search query
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groups;
        const query = searchQuery.toLowerCase().trim();
        return groups.filter(group =>
            group.title.toLowerCase().includes(query)
        );
    }, [groups, searchQuery]);

    return (
        <div
            className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark
                ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
                : "bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50"
                }`}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className={`absolute top-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl ${isDark ? "bg-purple-500 opacity-20" : "bg-purple-300 opacity-30"
                        }`}
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className={`absolute top-40 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl ${isDark ? "bg-indigo-500 opacity-20" : "bg-indigo-300 opacity-30"
                        }`}
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className={`absolute bottom-20 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl ${isDark ? "bg-pink-500 opacity-20" : "bg-pink-300 opacity-30"
                        }`}
                    animate={{
                        x: [0, 40, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Grid Pattern */}
            <div
                className={`absolute inset-0 ${isDark
                    ? "bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"
                    : "bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]"
                    } bg-[size:32px_32px]`}
            />

            <div className="relative z-10">
                <DashNav name={session?.user?.name ?? "User"} image={session?.user?.image} token={session?.user?.token} />

                <div className="container mx-auto py-12 px-4 md:px-6">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
                    >
                        <div>
                            <h1
                                className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${isDark
                                    ? "from-white via-purple-200 to-pink-200"
                                    : "from-slate-900 via-purple-600 to-pink-600"
                                    } bg-clip-text text-transparent`}
                            >
                                Your Chats
                            </h1>
                            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                                {filteredGroups.length}{" "}
                                {filteredGroups.length === 1 ? "conversation" : "conversations"}
                                {searchQuery && ` found`}
                                {!searchQuery && ` active`}
                            </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <CreateChat user={session?.user} />
                        </motion.div>
                    </motion.div>

                    {/* Search Bar */}
                    {groups.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className={`relative max-w-md ${isDark ? "" : ""}`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search your chats..."
                                    className={`w-full pl-12 pr-10 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${isDark
                                        ? "bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-purple-500/30 focus:border-purple-400"
                                        }`}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        <X className={`w-5 h-5 ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"} transition-colors`} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Chat Cards Grid */}
                    {filteredGroups.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredGroups.map((group, index) => (
                                <motion.div key={group.id} variants={itemVariants}>
                                    <GroupChatCard group={group} user={session?.user!} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : searchQuery ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <motion.div
                                className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-6 shadow-xl"
                            >
                                <Search className="w-12 h-12 text-white" />
                            </motion.div>
                            <h2
                                className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"
                                    }`}
                            >
                                No chats found
                            </h2>
                            <p
                                className={`mb-6 text-center max-w-md ${isDark ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                No chats matching &quot;{searchQuery}&quot; were found. Try a different search term.
                            </p>
                            <motion.button
                                onClick={() => setSearchQuery("")}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-2 rounded-lg transition-colors ${isDark
                                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    }`}
                            >
                                Clear Search
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <motion.div
                                className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <MessageSquare className="w-16 h-16 text-white" />
                            </motion.div>
                            <h2
                                className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"
                                    }`}
                            >
                                No chats yet
                            </h2>
                            <p
                                className={`mb-6 text-center max-w-md ${isDark ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                Start your first conversation by creating a new chat group
                            </p>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <CreateChat user={session?.user} />
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}

export default function DashboardView({
    session,
    groups,
}: {
    session: any;
    groups: Array<ChatGroupType>;
}) {
    return (
        <ThemeProvider>
            <DashboardContent session={session} groups={groups} />
        </ThemeProvider>
    );
}
