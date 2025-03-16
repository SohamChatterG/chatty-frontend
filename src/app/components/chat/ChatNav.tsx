import React from "react";
import MobileChatSidebar from "./MobileChatSidebar";
import GroupChatCardMenu from "@/groupChat/GroupChatCardMenu";
import { useEffect, useState } from "react";
import { CustomSession } from "@/app/api/auth/[...nextauth]/options";
export default function ChatNav({
    chatGroup,
    users,
    user,

}: {
    chatGroup: ChatGroupType;
    users: Array<GroupChatUserType> | [];
    user?: GroupChatUserType;
}) {
    const [session, setSession] = useState<CustomSession | null>(null);
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

    return (
        <nav className="w-full flex justify-between items-center  px-6 py-2 border-b">

            <div className="flex space-x-4 md:space-x-0 items-center">
                <div className="md:hidden">
                    <MobileChatSidebar users={users} />
                </div>

                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 text-transparent bg-clip-text">
                    {chatGroup?.title}
                </h1>
                <GroupChatCardMenu group={chatGroup} user={session?.user} from="chatNav" />
                {/* <p>{new Date(chatGroup.created_at).toDateString()}</p> */}
            </div>

        </nav>
    );
}