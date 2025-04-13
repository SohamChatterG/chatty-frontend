"use client"
import React, { useEffect, useMemo, useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatNav from './ChatNav'
import ChatUserDialog from './ChatUserDialog'
import Chats from './Chats'
import { CustomSession } from '@/app/api/auth/[...nextauth]/options'
function ChatBase({ fetchedUsers, group, oldMessages }: { group: ChatGroupType, fetchedUsers: Array<GroupChatUserType> | [], oldMessages: Array<MessageType> | [] }) {
    const [typingUser, setTypingUser] = useState<string>(""); // Add typingUsers state
    const [users, setUsers] = useState<Array<GroupChatUserType> | []>(fetchedUsers); // Initialize users state with fetchedUsers
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



    return (
        <div className="flex h-screen">
            {/* Sidebar for large screens */}
            {isMediumScreen && (
                <div className="w-1/4 bg-gray-100 border-r">
                    <ChatNav chatGroup={group} users={users} user={chatUser} activeUsers={activeUsers} session={session} setUsers={setUsers} />
                </div>
            )}

            {/* Main chat area */}
            <div className={`${isMediumScreen ? "w-3/4" : "w-full"} bg-white relative`}>
                {/* Always show ChatNav on small screens (as a header) */}
                {!isMediumScreen && (
                    <div className="border-b">
                        <ChatNav chatGroup={group} users={users} setUsers={setUsers} user={chatUser} activeUsers={activeUsers} session={session} />
                    </div>
                )}

                {/* Chats */}
                <Chats
                    group={group}
                    chatUser={chatUser}
                    oldMessages={oldMessages}
                    setActiveUsers={setActiveUsers}
                    setTypingUser={setTypingUser}
                    typingUser={typingUser}
                />
            </div>

            {/* Dialog always mounted, visibility controlled by open */}
            <ChatUserDialog
                open={open}
                setOpen={setOpen}
                group={group}
                user={session?.user}
                users={users}
                setUsers={setUsers}
            />
        </div>
    );


}

export default ChatBase

