import React from "react";
import MobileChatSidebar from "./MobileChatSidebar";
import GroupChatCardMenu from "@/groupChat/GroupChatCardMenu";
import { useEffect, useState } from "react";
import { CustomSession, CustomUser } from "@/app/api/auth/[...nextauth]/options";
export default function ChatNav({
    chatGroup,
    users,
    user,
    activeUsers,
    session,
}: {
    chatGroup: ChatGroupType;
    users: Array<GroupChatUserType> | [];
    user?: GroupChatUserType;
    activeUsers: Array<GroupChatUserType> | [];
    session: CustomSession | null;
}) {
    console.log("consoling session from chatNav", session)

    return (
        <nav className="w-full flex justify-between items-center  px-6 py-2 border-b">

            <div className="flex space-x-4 md:space-x-0 items-center">
                {<div className="">
                    <MobileChatSidebar users={users} activeUsers={activeUsers} groupId={chatGroup.id} user={session?.user as CustomUser} />
                </div>}

                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 text-transparent bg-clip-text">
                    {chatGroup?.title}
                </h1>
                <GroupChatCardMenu group={chatGroup} user={session?.user} from="chatNav" />
                {/* <p>{new Date(chatGroup.created_at).toDateString()}</p> */}
            </div>
            <h2>
                {user?.name}
            </h2>
        </nav>
    );
}