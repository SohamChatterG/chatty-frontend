"use client"
import { getSocket } from '@/lib/socket.config'
import React, { useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from "uuid"
import { Button } from '@/components/ui/button'
import ChatSidebar from './ChatSidebar'
import ChatNav from './ChatNav'
import ChatUserDialog from './ChatUserDialog'
import Chats from './Chats'
function ChatBase({ users, group, oldMessages }: { group: ChatGroupType, users: Array<GroupChatUserType> | [], oldMessages: Array<MessageType> | [] }) {
    const [typingUsers, setTypingUsers] = useState<string[]>([]); // Add typingUsers state

    const [open, setOpen] = useState(true);
    console.log("group", group)
    const [chatUser, setChatUser] = useState<GroupChatUserType>();
    const [activeUsers, setActiveUsers] = useState<GroupChatUserType[]>([]); // Add activeUsers state

    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(group.id);
        console.log("loc store", data)
    }
    const typingUserNames = typingUsers
        .map((userId) => activeUsers.find((user) => user.id.toString() === userId)?.name)
        .filter(Boolean)
        .join(", ");

    useEffect(() => {
        const data = localStorage.getItem(group.id);
        console.log("loc store", data)
        if (data && data !== "undefined" && data !== null) { // Added checks for null and undefined
            try {
                const pData = JSON.parse(data);
                setChatUser(pData);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                // Handle the error (e.g., show a message to the user)
            }
        }
    }, [group.id]); // Added group.id as a dependency
    console.log("active users", activeUsers)
    return (
        <div className='flex'>
            <ChatSidebar users={users} activeUsers={activeUsers} />

            <div className='w-full md:w-4/5 bg-gradient-to-b from-gray-50 to-white'>
                {open ? <ChatUserDialog open={open} setOpen={setOpen} group={group} /> : <ChatNav chatGroup={group} users={users} user={chatUser} typingUserNames={typingUserNames}></ChatNav>}
                {/* <ChatSidebar users={users} activeUsers={activeUsers} /> */}
                <Chats group={group} chatUser={chatUser} oldMessages={oldMessages} setActiveUsers={setActiveUsers} setTypingUsers={setTypingUsers} typingUsers={typingUsers}></Chats>
            </div>

        </div>
    )
}

export default ChatBase
