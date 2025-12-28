"use client";
import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import GroupChatCardMenu from "./GroupChatCardMenu";
import { useRouter } from "next/navigation";
import { Lock, Globe, Users, Calendar } from "lucide-react";
import { ChatGroupType } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

export function GroupChatCard({ group, user }: { group: ChatGroupType; user: CustomUser }) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-100, 100], [8, -8]);
    const rotateY = useTransform(x, [-100, 100], [-8, 8]);

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

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent navigation when clicking on menu
        if ((e.target as HTMLElement).closest('[data-menu]')) {
            return;
        }
        router.push(`/chat/${group.id}`);
    };

    return (
        <motion.div
            onClick={handleCardClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer group relative"
            whileHover={{ scale: 1.02, y: -5 }}
            style={{
                rotateX: useSpring(rotateX, { damping: 20, stiffness: 200 }),
                rotateY: useSpring(rotateY, { damping: 20, stiffness: 200 }),
                transformStyle: "preserve-3d",
            }}
        >
            {/* Glow effect */}
            <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 ${group.is_public
                        ? "bg-gradient-to-br from-green-400 to-emerald-500"
                        : "bg-gradient-to-br from-purple-500 to-pink-500"
                    }`}
            />

            {/* Card content */}
            <div
                className={`relative p-6 rounded-2xl border transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm ${isDark
                        ? group.is_public
                            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-green-500/20 hover:border-green-500/50"
                            : "bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/20 hover:border-purple-500/50"
                        : group.is_public
                            ? "bg-gradient-to-br from-white to-green-50 border-green-300/40 hover:border-green-400/70"
                            : "bg-gradient-to-br from-white to-purple-50 border-purple-300/40 hover:border-purple-400/70"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3
                            className={`text-xl font-bold mb-2 line-clamp-1 ${isDark ? "text-white" : "text-slate-900"
                                }`}
                        >
                            {group.title}
                        </h3>
                        <div className="flex items-center gap-2">
                            {group.is_public ? (
                                <>
                                    <div
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDark
                                                ? "bg-green-500/20"
                                                : "bg-green-100 border border-green-300"
                                            }`}
                                    >
                                        <Globe
                                            className={`w-3 h-3 ${isDark ? "text-green-400" : "text-green-600"
                                                }`}
                                        />
                                        <span
                                            className={`text-xs font-medium ${isDark ? "text-green-300" : "text-green-700"
                                                }`}
                                        >
                                            Public
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDark
                                                ? "bg-purple-500/20"
                                                : "bg-purple-100 border border-purple-300"
                                            }`}
                                    >
                                        <Lock
                                            className={`w-3 h-3 ${isDark ? "text-purple-400" : "text-purple-600"
                                                }`}
                                        />
                                        <span
                                            className={`text-xs font-medium ${isDark ? "text-purple-300" : "text-purple-700"
                                                }`}
                                        >
                                            Private
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div data-menu onClick={(e) => e.stopPropagation()}>
                        <GroupChatCardMenu user={user} group={group} />
                    </div>
                </div>

                {/* Divider */}
                <div
                    className={`h-px bg-gradient-to-r from-transparent to-transparent mb-4 ${isDark ? "via-gray-700" : "via-gray-300"
                        }`}
                />

                {/* Footer */}
                <div
                    className={`flex items-center justify-between text-sm ${isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                >
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                            {new Date(group.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                    {group.passcode && !group.is_public && (
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded ${isDark
                                    ? "bg-slate-700/50"
                                    : "bg-purple-100 border border-purple-200"
                                }`}
                        >
                            <Lock className="w-3 h-3" />
                            <span className="text-xs">Secured</span>
                        </div>
                    )}
                </div>

                {/* Hover arrow indicator */}
                <motion.div
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                >
                    <span
                        className={`text-xl ${isDark ? "text-purple-400" : "text-purple-600"}`}
                    >
                        →
                    </span>
                </motion.div>
            </div>
        </motion.div>
    );
}
