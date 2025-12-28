"use client";
import React from "react";
import { motion } from "framer-motion";
import { DashNav } from "../components/base/dashboard/DashNav";
import CreateChat from "@/groupChat/CreateChat";
import { GroupChatCard } from "@/groupChat/GroupChatCard";
import FooterDashboard from "../components/base/FooterDashboard";
import { ChatGroupType } from "@/types";
import { MessageSquare } from "lucide-react";
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
            ease: "easeOut",
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
                <DashNav name={session?.user?.name ?? "User"} image={session?.user?.image} />

                <div className="container mx-auto py-12 px-4 md:px-6">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
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
                                {groups.length}{" "}
                                {groups.length === 1 ? "conversation" : "conversations"} active
                            </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <CreateChat user={session?.user} />
                        </motion.div>
                    </motion.div>

                    {/* Chat Cards Grid */}
                    {groups.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {groups.map((group, index) => (
                                <motion.div key={group.id} variants={itemVariants}>
                                    <GroupChatCard group={group} user={session?.user!} />
                                </motion.div>
                            ))}
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
