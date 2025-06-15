import React, { Dispatch, SetStateAction } from "react";
import MobileChatSidebar from "./MobileChatSidebar";
import GroupChatCardMenu from "@/groupChat/GroupChatCardMenu";
import { CustomSession, CustomUser } from "@/app/api/auth/[...nextauth]/options";
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

    return (
        <nav className="w-full flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Sidebar Toggle */}
                {!isMediumScreen && (
                    <div className="mr-2">
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
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4 py-2 border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <h1 className="text-lg font-semibold text-blue-700">
                                        {chatGroup?.title}
                                    </h1>
                                    <GroupChatCardMenu group={chatGroup} user={session?.user} from="chatNav" />
                                </div>
                                <p className="text-xs text-blue-600 mt-0.5 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5 animate-pulse"></span>
                                    Team Chat
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">{user?.name}</span>
            </div>
        </nav>
    );

}