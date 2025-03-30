"use client"
import React, { useEffect, useMemo, useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatNav from './ChatNav'
import ChatUserDialog from './ChatUserDialog'
import Chats from './Chats'
import { CustomSession } from '@/app/api/auth/[...nextauth]/options'
function ChatBase({ users, group, oldMessages }: { group: ChatGroupType, users: Array<GroupChatUserType> | [], oldMessages: Array<MessageType> | [] }) {
    const [typingUser, setTypingUser] = useState<string>(""); // Add typingUsers state

    const [open, setOpen] = useState(true);
    const [chatUser, setChatUser] = useState<GroupChatUserType>();
    const [activeUsers, setActiveUsers] = useState<GroupChatUserType[]>([]); // Add activeUsers state
    const [isMediumScreen, setIsMediumScreen] = useState(false);
    const [session, setSession] = useState<CustomSession | null>(null);

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
        const data = localStorage.getItem(group.id);
        if (data && data !== "undefined" && data !== null) {
            try {
                const pData = JSON.parse(data);
                setChatUser(pData);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        }
    }, [group.id]);
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
        <div className="flex h-screen">
            {/* Sidebar: Only visible when screen width >= md */}
            {isMediumScreen && (
                <div className="w-1/4 bg-gray-100 border-r">
                    <ChatNav chatGroup={group} users={users} user={chatUser} activeUsers={activeUsers} session={session} />
                </div>
            )}

            {/* Main Chat Area */}
            <div className={`${isMediumScreen ? "w-3/4" : "w-full"} bg-white`}>
                {/* On smaller screens, show ChatUserDialog first */}
                {!isMediumScreen && open ? (
                    <ChatUserDialog open={open} setOpen={setOpen} group={group} user={session?.user} users={users} />
                ) : (
                    <>
                        {/* On large screens, ChatNav is already shown separately, so only Chats should be displayed here */}
                        {!isMediumScreen && (
                            <ChatNav chatGroup={group} users={users} user={chatUser} activeUsers={activeUsers} session={session} />
                        )}
                        <Chats
                            group={group}
                            chatUser={chatUser}
                            oldMessages={oldMessages}
                            setActiveUsers={setActiveUsers}
                            setTypingUser={setTypingUser}
                            typingUser={typingUser}
                        />
                    </>
                )}
            </div>
        </div>
    );


}

export default ChatBase
