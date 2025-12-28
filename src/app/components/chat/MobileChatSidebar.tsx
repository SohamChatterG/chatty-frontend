"use client";
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from 'sonner';
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Trash2, ShieldCheck, Users } from "lucide-react";
import { removeUser, makeAdmin } from "@/fetch/chatsFetch";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { fetchChatGroupUsers } from "@/fetch/groupFetch";
import { GroupChatUserType } from "@/types";
import type { Socket } from "socket.io-client";
import { useTheme } from "@/contexts/ThemeContext";

export default function MobileChatSidebar({
    users,
    activeUsers,
    groupId,
    user,
    setUsers,
    isLargeScreen,
    socket
}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | [];
    groupId: string,
    user: CustomUser,
    setUsers: Dispatch<SetStateAction<Array<GroupChatUserType>>>,
    isLargeScreen: boolean,
    socket?: Socket | null
}) {
    const [open, setOpen] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";


    const handleRemoveUser = async (targetId: string) => {
        try {
            // Find the user being removed to get their details
            const targetUser = (users as GroupChatUserType[]).find(u => String(u.id) === targetId);

            console.log(`Removing user ${targetId} from group ${groupId} requested by ${user?.id} with token ${user?.token}`);
            const response = await removeUser(
                user?.token as string,
                targetId,
                groupId,
                user?.id as string
            );

            if (response.isSelfRemoval) {
                // If user removed themselves
                toast.success(response.message || "You have left the group!");
                // Remove group details from local storage
                localStorage.removeItem(groupId);
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                toast.success(response.message || "User removed from group!");

                // Emit kick event to notify the removed user in real-time
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

            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to remove user");
        }
    };
    const handleMakeAdmin = async (targetId: string, is_admin: boolean) => {
        try {
            //@ts-ignore
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
            if (!is_admin) {
                toast.error("Failed to promote user to admin.");
            } else {
                toast.error("Failed to demote user from admin.");
            }
        }
    };
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className={`p-2.5 rounded-xl transition-all duration-200 ${isDark
                        ? "hover:bg-slate-700/50 active:bg-slate-600/50"
                        : "hover:bg-gray-100 active:bg-gray-200"
                        }`}
                    aria-label="Open menu"
                >
                    <Users className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-700"}`} />
                </button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className={`w-80 max-w-full border-r backdrop-blur-xl transition-colors duration-300 ${isDark
                    ? "bg-slate-900/95 border-slate-700/50"
                    : "bg-white/95 border-gray-200"
                    }`}
            >
                {/* Header */}
                <SheetHeader className={`px-4 py-6 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"
                    }`}>
                    <SheetTitle className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"
                        }`}>
                        <Users className="w-5 h-5" />
                        Team Members
                    </SheetTitle>
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="h-[calc(100vh-120px)] overflow-y-auto p-4 space-y-6">
                    {/* All Users Section */}
                    <div className="space-y-3">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}>
                            All Members
                        </h3>
                        {users?.length > 0 ? (
                            users.map((item) => (
                                <div
                                    key={item.id}
                                    className={`rounded-xl p-3 flex items-center justify-between transition-all duration-200 ${isDark
                                        ? "bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30"
                                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-lg">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"
                                                    }`}>{item.name}</p>
                                                {item.is_admin && (
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark
                                                        ? "text-green-400 bg-green-500/20"
                                                        : "text-green-600 bg-green-100"
                                                        }`}>
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}>
                                                Joined {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMakeAdmin(String(item.id), item.is_admin)}
                                            className={`p-2 rounded-lg transition-colors ${isDark
                                                ? "hover:bg-blue-500/20 text-blue-400"
                                                : "hover:bg-blue-50 text-blue-600"
                                                }`}
                                            title={item.is_admin ? "Remove admin" : "Make admin"}
                                        >
                                            <ShieldCheck size={18} />
                                        </button>
                                        {item.id !== Number(user?.id) && (
                                            <button
                                                onClick={() => handleRemoveUser(String(item.id))}
                                                className={`p-2 rounded-lg transition-colors ${isDark
                                                    ? "hover:bg-red-500/20 text-red-400"
                                                    : "hover:bg-red-50 text-red-600"
                                                    }`}
                                                title="Remove user"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"
                                }`}>No members found</p>
                        )}
                    </div>

                    {/* Active Users Section */}
                    <div className="space-y-3 pt-2">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}>
                            Online Now
                        </h3>
                        {activeUsers?.length > 0 ? (
                            activeUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isDark
                                        ? "bg-slate-800/50 border border-slate-700/30"
                                        : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50"
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold shadow-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg"></span>
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"
                                            }`}>{user.name}</p>
                                        <p className={`text-xs flex items-center gap-1 ${isDark ? "text-green-400" : "text-green-600"
                                            }`}>
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            Active now
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"
                                }`}>No active users</p>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
