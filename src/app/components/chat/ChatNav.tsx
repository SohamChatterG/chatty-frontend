import React, { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import MobileChatSidebar from "./MobileChatSidebar";
import GroupChatCardMenu from "@/groupChat/GroupChatCardMenu";
import { CustomSession, CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { ChatGroupType, GroupChatUserType } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
export default function ChatNav({
    chatGroup,
    users,
    user,
    activeUsers,
    session,
    setUsers,
    isMediumScreen
}: {
    chatGroup: ChatGroupType;
    users: Array<GroupChatUserType> | [];
    user?: GroupChatUserType;
    activeUsers: Array<GroupChatUserType> | [];
    session: CustomSession | null;
    setUsers: Dispatch<SetStateAction<Array<GroupChatUserType>>>,
    isMediumScreen: boolean;
}) {
    console.log("consoling session from chatNav", session)
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <nav className={`w-full flex justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-b backdrop-blur-xl transition-colors duration-300 ${isDark
            ? "border-slate-700/50 bg-slate-800/80"
            : "border-gray-200 bg-white/80"
            }`}>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                {/* Mobile Sidebar Toggle */}
                {!isMediumScreen && (
                    <div className="mr-1 sm:mr-2 flex-shrink-0">
                        <MobileChatSidebar
                            users={users}
                            activeUsers={activeUsers}
                            groupId={chatGroup.id}
                            user={session?.user as CustomUser}
                            setUsers={setUsers}
                            isLargeScreen={isMediumScreen}
                        />
                    </div>
                )}

                {/* Team Name Container */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 sm:gap-3 min-w-0"
                >
                    <div className={`rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1.5 sm:py-2.5 border shadow-sm ${isDark
                        ? "bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30"
                        : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                        }`}>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <h1 className={`text-sm sm:text-lg font-bold truncate max-w-[100px] sm:max-w-none ${isDark
                                        ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                                        : "text-purple-700"
                                        }`}>
                                        {chatGroup?.title}
                                    </h1>
                                    <GroupChatCardMenu group={chatGroup} user={session?.user} from="chatNav" />
                                </div>
                                <p className={`text-[10px] sm:text-xs mt-0.5 flex items-center gap-1 sm:gap-1.5 ${isDark ? "text-purple-400" : "text-purple-600"
                                    }`}>
                                    <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full animate-pulse ${isDark ? "bg-purple-400" : "bg-purple-500"
                                        }`}></span>
                                    <span className="hidden xs:inline">Team Chat</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Theme Toggle */}
                <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-10 sm:w-12 h-6 sm:h-7 rounded-full transition-colors duration-300 ${isDark ? "bg-slate-700" : "bg-purple-200"
                        }`}
                >
                    <motion.div
                        className={`absolute top-0.5 sm:top-1 w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center shadow-lg ${isDark ? "bg-purple-500" : "bg-white"
                            }`}
                        animate={{
                            left: isDark ? "4px" : "20px",
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        {isDark ? (
                            <Moon className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white" />
                        ) : (
                            <Sun className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-yellow-500" />
                        )}
                    </motion.div>
                </motion.button>

                {/* User Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 sm:gap-2"
                >
                    <div className="w-7 sm:w-9 h-7 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white text-xs sm:text-base font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-semibold hidden sm:block ${isDark ? "text-white" : "text-gray-900"
                        }`}>{user?.name}</span>
                </motion.div>
            </div>
        </nav>
    );

}