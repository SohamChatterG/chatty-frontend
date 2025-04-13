"use client"
import React, { useEffect, useMemo, useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatNav from './ChatNav'
import ChatUserDialog from './ChatUserDialog'
import Chats from './Chats'
import MobileChatSidebar from './MobileChatSidebar'
import { CustomUser } from '@/app/api/auth/[...nextauth]/options'
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



    // return (
    //     <div className="flex h-screen">
    //         {/* Sidebar for large screens */}
    //         {isMediumScreen && (
    //             <div className="w-1/4 bg-gray-100 border-r">
    //                 <ChatNav chatGroup={group} users={users} user={chatUser} activeUsers={activeUsers} session={session} setUsers={setUsers} />
    //             </div>
    //         )}

    //         {/* Main chat area */}
    //         <div className={`${isMediumScreen ? "w-3/4" : "w-full"} bg-white relative`}>
    //             {/* Always show ChatNav on small screens (as a header) */}
    //             {!isMediumScreen && (
    //                 <div className="border-b">
    //                     <ChatNav chatGroup={group} users={users} setUsers={setUsers} user={chatUser} activeUsers={activeUsers} session={session} />
    //                 </div>
    //             )}

    //             {/* Chats */}
    //             <Chats
    //                 group={group}
    //                 chatUser={chatUser}
    //                 oldMessages={oldMessages}
    //                 setActiveUsers={setActiveUsers}
    //                 setTypingUser={setTypingUser}
    //                 typingUser={typingUser}
    //             />
    //         </div>

    //         {/* Dialog always mounted, visibility controlled by open */}
    //         <ChatUserDialog
    //             open={open}
    //             setOpen={setOpen}
    //             group={group}
    //             user={session?.user}
    //             users={users}
    //             setUsers={setUsers}
    //         />
    //     </div>
    // );
    // return (
    //     <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    //         {/* Sidebar (Desktop) */}
    //         {isMediumScreen && (
    //             <div className="w-1/4 bg-white border-r border-gray-200 shadow-sm">
    //                 <ChatNav chatGroup={group} users={users} user={chatUser} activeUsers={activeUsers} session={session} setUsers={setUsers} isMediumScreen={isMediumScreen} />
    //             </div>
    //         )}

    //         {/* Main Chat Area */}
    //         <div className={`${isMediumScreen ? "w-3/4" : "w-full"} flex flex-col bg-white/80 backdrop-blur-sm`}>
    //             {/* Mobile Header */}
    //             {!isMediumScreen && (
    //                 <div className="border-b border-gray-200 bg-white/90 backdrop-blur-sm">
    //                     <ChatNav chatGroup={group} users={users} setUsers={setUsers} user={chatUser} activeUsers={activeUsers} session={session} isMediumScreen={isMediumScreen} />
    //                 </div>
    //             )}

    //             {/* Chat Messages */}
    //             <Chats
    //                 group={group}
    //                 chatUser={chatUser}
    //                 oldMessages={oldMessages}
    //                 setActiveUsers={setActiveUsers}
    //                 setTypingUser={setTypingUser}
    //                 typingUser={typingUser}
    //             />
    //         </div>

    //         {/* Dialog (unchanged) */}
    //         <ChatUserDialog open={open} setOpen={setOpen} group={group} user={session?.user} users={users} setUsers={setUsers} />
    //     </div>
    // );
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Always visible on large screens */}
            <div className={`${isMediumScreen ? "w-72 border-r border-gray-200" : "hidden"} bg-white shadow-sm flex-shrink-0`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {group?.title?.charAt(0)}
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">{group?.title}</h1>
                                <p className="text-xs text-gray-500">Team Chat</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <MobileChatSidebar
                        users={users}
                        activeUsers={activeUsers}
                        groupId={group.id}
                        user={session?.user as CustomUser}
                        setUsers={setUsers}
                        isLargeScreen={isMediumScreen}
                    />
                </div>
            </div>

            {/* Main Content Area - Now flush with sidebar */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Only on mobile */}
                {!isMediumScreen && (
                    <div className="border-b border-gray-200 bg-white">
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

                {/* Messages Area - Full width */}
                <div className="flex-1 flex flex-col">
                    <Chats
                        group={group}
                        chatUser={chatUser}
                        oldMessages={oldMessages}
                        setActiveUsers={setActiveUsers}
                        setTypingUser={setTypingUser}
                        typingUser={typingUser}
                    />
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
            />
        </div>
    );
}

export default ChatBase

