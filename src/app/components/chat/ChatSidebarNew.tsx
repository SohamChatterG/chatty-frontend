"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, ShieldCheck, Users, Circle, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { removeUser, makeAdmin } from "@/fetch/chatsFetch";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { fetchChatGroupUsers } from "@/fetch/groupFetch";
import { GroupChatUserType } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import type { Socket } from "socket.io-client";

export default function ChatSidebar({
    users,
    activeUsers,
    groupId,
    user,
    setUsers,
    socket
}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | [];
    groupId: string;
    user: CustomUser;
    setUsers: (users: Array<GroupChatUserType>) => void;
    socket?: Socket | null;
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [loadingRemove, setLoadingRemove] = useState<string | null>(null);
    const [loadingAdmin, setLoadingAdmin] = useState<string | null>(null);

    const handleRemoveUser = async (targetId: string) => {
        setLoadingRemove(targetId);
        try {
            const targetUser = (users as GroupChatUserType[]).find(u => String(u?.id) === targetId);
            const response = await removeUser(
                user?.token as string,
                targetId,
                groupId,
                user?.id as string
            );

            if (response.isSelfRemoval) {
                toast.success(response.message || "You have left the group!");
                localStorage.removeItem(groupId);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                toast.success(response.message || "User removed from group!");
                if (socket && targetUser) {
                    socket.emit("kickUser", {
                        userId: String(targetUser.user_id),
                        userName: targetUser.name,
                        reason: "You have been removed from this group"
                    });
                }
                const updatedUsers = await fetchChatGroupUsers(groupId);
                setUsers(updatedUsers);
            }
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to remove user");
        } finally {
            setLoadingRemove(null);
        }
    };

    const handleMakeAdmin = async (targetId: string, is_admin: boolean) => {
        setLoadingAdmin(targetId);
        try {
            await makeAdmin(
                user.token as string,
                targetId,
                groupId,
                is_admin,
                user?.id as string
            );

            if (!is_admin) {
                toast.success("User promoted to admin!");
            } else {
                toast.success("User demoted from admin!");
            }

            const updatedUsers = await fetchChatGroupUsers(groupId);
            setUsers(updatedUsers);
        } catch (error) {
            console.error(error);
            toast.error(!is_admin ? "Failed to promote user to admin." : "Failed to demote user from admin.");
        } finally {
            setLoadingAdmin(null);
        }
    };

    const isUserOnline = (userId: string | number | undefined) => {
        if (!userId) return false;
        const userIdStr = String(userId);
        return (activeUsers as any[]).some(au =>
            String(au.user_id) === userIdStr ||
            String(au.id) === userIdStr
        );
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className={`px-4 py-4 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"
                }`}>
                <div className="flex items-center gap-2">
                    <Users className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"
                        }`}>
                        Team Members
                    </h3>
                </div>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                    {users.length} members • {activeUsers.length} online
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* All Members Section */}
                <div className="space-y-3">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"
                        }`}>
                        All Members
                    </h4>
                    {users?.length > 0 ? (
                        users.map((member) => {
                            const isOnline = isUserOnline(member.user_id);
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-xl p-3 transition-all duration-200 ${isDark
                                        ? "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30"
                                        : "bg-white hover:bg-gray-50 border border-gray-200/50 shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg ${isOnline
                                                    ? "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500"
                                                    : "bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500"
                                                    }`}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                {isOnline && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"
                                                        }`}>
                                                        {member.name}
                                                    </p>
                                                    {member.is_admin && (
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark
                                                            ? "text-green-400 bg-green-500/20"
                                                            : "text-green-600 bg-green-100"
                                                            }`}>
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {isOnline && (
                                                        <span className={`text-xs flex items-center gap-1 ${isDark ? "text-green-400" : "text-green-600"
                                                            }`}>
                                                            <Circle className="w-2 h-2 fill-current" />
                                                            Online
                                                        </span>
                                                    )}
                                                    {!isOnline && (
                                                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                                                            }`}>
                                                            Joined {new Date(member.created_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleMakeAdmin(String(member.id), member.is_admin)}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? "hover:bg-blue-500/20 text-blue-400"
                                                    : "hover:bg-blue-50 text-blue-600"
                                                    }`}
                                                title={member.is_admin ? "Remove admin" : "Make admin"}
                                                disabled={loadingAdmin === String(member.id) || loadingRemove === String(member.id)}
                                            >
                                                {loadingAdmin === String(member.id) ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ShieldCheck size={16} />
                                                )}
                                            </button>
                                            {member.id !== Number(user?.id) && (
                                                <button
                                                    onClick={() => handleRemoveUser(String(member.id))}
                                                    className={`p-2 rounded-lg transition-colors ${isDark
                                                        ? "hover:bg-red-500/20 text-red-400"
                                                        : "hover:bg-red-50 text-red-600"
                                                        }`}
                                                    title="Remove user"
                                                    disabled={loadingRemove === String(member.id) || loadingAdmin === String(member.id)}
                                                >
                                                    {loadingRemove === String(member.id) ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"
                            }`}>
                            No members found
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
