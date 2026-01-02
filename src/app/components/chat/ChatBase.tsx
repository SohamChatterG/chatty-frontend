"use client"
import React, { useEffect, useMemo, useState } from 'react'
import ChatNav from './ChatNav'
import ChatUserDialog from './ChatUserDialog'
import Chats from './Chats'
import ChatSidebarNew from './ChatSidebarNew'
import GroupAccessGate from './GroupAccessGate'
import JoinRequestsManager from './JoinRequestsManager'
import { CustomUser } from '@/app/api/auth/[...nextauth]/options'
import { CustomSession } from '@/app/api/auth/[...nextauth]/options'
import { ChatGroupType, GroupChatUserType, MessageType } from '@/types'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

function ChatBase({ fetchedUsers, group, oldMessages }: { group: ChatGroupType, fetchedUsers: Array<GroupChatUserType> | [], oldMessages: Array<MessageType> | [] }) {
    const [typingUser, setTypingUser] = useState<string>(""); // Add typingUsers state
    const [users, setUsers] = useState<GroupChatUserType[]>(fetchedUsers); // Initialize users state with fetchedUsers
    const [open, setOpen] = useState(true);
    const [chatUser, setChatUser] = useState<GroupChatUserType>();
    const [activeUsers, setActiveUsers] = useState<GroupChatUserType[]>([]); // Add activeUsers state
    const [isMediumScreen, setIsMediumScreen] = useState(false);
    const [session, setSession] = useState<CustomSession | null>(null);
    const [hasAccess, setHasAccess] = useState(false);

    // Check if current user is admin/owner
    const isAdmin = useMemo(() => {
        if (!session?.user?.id) return false;
        const currentUser = (users as GroupChatUserType[]).find(u => String(u.user_id) === String(session.user.id));
        return currentUser?.is_admin || currentUser?.is_owner || String(group.user_id) === String(session.user.id);
    }, [session, users, group.user_id]);

    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(group.id);
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMediumScreen(window.innerWidth >= 768);
        };

        handleResize(); // Set initial value
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    useEffect(() => {
        console.log(`[${new Date().toISOString()}] ChatBase useEffect - checking localStorage for group: ${group.id}`);
        const data = localStorage.getItem(group.id);
        console.log(`[${new Date().toISOString()}] ChatBase localStorage data:`, data);
        if (data && data !== "undefined" && data !== null) {
            try {
                const pData = JSON.parse(data);
                console.log(`[${new Date().toISOString()}] ChatBase setting chatUser:`, pData);
                setChatUser(pData);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] ChatBase Error parsing JSON:`, error);
            }
        } else {
            console.log(`[${new Date().toISOString()}] ChatBase - no data in localStorage for this group`);
        }
    }, [group.id, users]);
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/session");
                const data = await res.json();
                setSession(data);
            } catch (error) {
                console.error("Error fetching session:", error);
            }
        };
        fetchSession();
    }, []);

    // If no session yet, show loading
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <ChatBaseContent
                fetchedUsers={fetchedUsers}
                group={group}
                oldMessages={oldMessages}
                session={session}
                isAdmin={isAdmin}
                isMediumScreen={isMediumScreen}
                chatUser={chatUser}
                users={users}
                setUsers={setUsers}
                activeUsers={activeUsers}
                setActiveUsers={setActiveUsers}
                typingUser={typingUser}
                setTypingUser={setTypingUser}
                open={open}
                setOpen={setOpen}
                setChatUser={setChatUser}
            />
        </ThemeProvider>
    );
}

function ChatBaseContent({
    fetchedUsers,
    group,
    oldMessages,
    session,
    isAdmin,
    isMediumScreen,
    chatUser,
    users,
    setUsers,
    activeUsers,
    setActiveUsers,
    typingUser,
    setTypingUser,
    open,
    setOpen,
    setChatUser
}: any) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const router = useRouter();
    const [isNavigatingBack, setIsNavigatingBack] = useState(false);

    const handleBackToDashboard = () => {
        if (isNavigatingBack) return;
        setIsNavigatingBack(true);
        router.push("/dashboard");
    };

    return (
        <GroupAccessGate
            group={group}
            token={session?.user?.token || ""}
            userId={session?.user?.id}
        >
            <div
                className={`flex h-screen transition-colors duration-300 ${isDark
                    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                    : "bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20"
                    }`}
            >
                {/* Background Pattern for light theme */}
                {!isDark && (
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                    </div>
                )}

                {/* Sidebar - Always visible on large screens */}
                <div
                    className={`${isMediumScreen ? "w-80" : "hidden"} ${isDark
                        ? "bg-slate-800/50 border-r border-slate-700/50"
                        : "bg-white/80 border-r border-gray-200/50"
                        } backdrop-blur-xl shadow-xl flex-shrink-0 transition-colors duration-300 relative z-10`}
                >
                    <div className="h-full flex flex-col">
                        {/* Sidebar Header */}
                        <div
                            className={`p-6 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"
                                }`}
                        >
                            {/* Back to Dashboard Button */}
                            <motion.button
                                onClick={handleBackToDashboard}
                                disabled={isNavigatingBack}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center gap-2 px-3 py-2 mb-4 rounded-xl transition-all ${isDark
                                    ? "bg-slate-700/50 hover:bg-slate-600/50 text-gray-300"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    } ${isNavigatingBack ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isNavigatingBack ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowLeft className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {isNavigatingBack ? "Loading..." : "Back to Dashboard"}
                                </span>
                            </motion.button>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {group?.title?.charAt(0)}
                                    </div>
                                    <div>
                                        <h1
                                            className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"
                                                }`}
                                        >
                                            {group?.title}
                                        </h1>
                                        <p
                                            className={`text-xs flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-600"
                                                }`}
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${isDark ? "bg-purple-400" : "bg-purple-500"
                                                    } animate-pulse`}
                                            ></span>
                                            {group.is_public ? "Public" : "Private"} Group
                                        </p>
                                    </div>
                                </div>
                                {/* Join Requests Manager for admins */}
                                {isAdmin && group.is_public && (
                                    <JoinRequestsManager
                                        groupId={group.id}
                                        token={session?.user?.token || ""}
                                        isAdmin={isAdmin}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <ChatSidebarNew
                            users={users}
                            activeUsers={activeUsers}
                            groupId={group.id}
                            user={session?.user as CustomUser}
                            setUsers={setUsers}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                    {/* Header - Only on mobile */}
                    {!isMediumScreen && (
                        <div
                            className={`border-b backdrop-blur-xl ${isDark
                                ? "border-slate-700/50 bg-slate-800/80"
                                : "border-gray-200 bg-white/80"
                                }`}
                        >
                            <ChatNav
                                chatGroup={group}
                                users={users}
                                setUsers={setUsers}
                                user={chatUser}
                                activeUsers={activeUsers}
                                session={session}
                                isMediumScreen={isMediumScreen}
                            />
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Chats
                            group={group}
                            chatUser={chatUser}
                            oldMessages={oldMessages}
                            setActiveUsers={setActiveUsers}
                            setTypingUser={setTypingUser}
                            typingUser={typingUser}
                            users={users}
                        />
                    </div>
                </div>
            </div>

            {/* Dialog */}
            <ChatUserDialog
                open={open}
                setOpen={setOpen}
                group={group}
                user={session?.user}
                users={users}
                setUsers={setUsers}
                setChatUser={setChatUser}
            />
        </GroupAccessGate>
    );
}

export default ChatBase

