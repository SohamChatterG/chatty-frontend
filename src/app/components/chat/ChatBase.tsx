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

    const [open, setOpen] = useState(true);
    console.log("group", group)
    const [chatUser, setChatUser] = useState<GroupChatUserType>();
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(group.id);
        console.log("loc store", data)
    }
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
    return (
        <div className='flex'>
            <ChatSidebar users={users} />
            <div className='w-full md:w-4/5 bg-gradient-to-b from-gray-50 to-white'>
                {open ? <ChatUserDialog open={open} setOpen={setOpen} group={group} /> : <ChatNav chatGroup={group} users={users}></ChatNav>}

            </div>
            <Chats group={group} chatUser={chatUser} oldMessages={oldMessages}></Chats>
        </div>
    )
}

export default ChatBase
