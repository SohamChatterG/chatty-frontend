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

    // return (
    //     <nav className="w-full flex justify-between items-center  px-6 py-2 border-b">

    //         <div className="flex space-x-4 md:space-x-0 items-center">
    //             {<div className="">
    //                 <MobileChatSidebar users={users} activeUsers={activeUsers} groupId={chatGroup.id} user={session?.user as CustomUser} setUsers={setUsers} />
    //             </div>}

    //             <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 text-transparent bg-clip-text">
    //                 {chatGroup?.title}
    //             </h1>
    //             <GroupChatCardMenu group={chatGroup} user={session?.user} from="chatNav" />
    //             {/* <p>{new Date(chatGroup.created_at).toDateString()}</p> */}
    //         </div>
    //         <h2>
    //             {user?.name}
    //         </h2>
    //     </nav>
    // );
    return (
        <nav className="w-full flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {/* Mobile Sidebar Toggle */}
                {!isMediumScreen && (
                    <div className="mr-2">
                        <MobileChatSidebar users={users} activeUsers={activeUsers} groupId={chatGroup.id} user={session?.user as CustomUser} setUsers={setUsers} isLargeScreen={isMediumScreen} />
                    </div>
                )}

                {/* Team Name */}
                <div className="flex">


                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-800">{chatGroup?.title}</h1>
                        <p className="text-xs text-gray-500">Team Chat</p>
                    </div>
                    <GroupChatCardMenu group={chatGroup} user={session?.user} from="chatNav" />
                </div>

            </div>

            {/* User Badge */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">{user?.name}</span>
            </div>
        </nav>
    );

}