
import ChatBase from '@/app/components/chat/ChatBase'
import { fetchChatGroup, fetchChatGroupUsers } from '@/fetch/groupFetch'
import { notFound } from 'next/navigation'
import React from 'react'
import { fetchChats } from '@/fetch/chatsFetch'
import { ChatGroupType, GroupChatUserType, MessageType } from '@/types'

// type Props = {
//     params: {
//         id: string;
//     };
// };

export default async function Chat({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (id.length !== 36) {
        return notFound();
    }
    const group: ChatGroupType | null = await fetchChatGroup(id);
    if (group === null) {
        return notFound();
    }
    const chats: Array<MessageType> | [] = await fetchChats(id);
    const user: Array<GroupChatUserType> | [] = await fetchChatGroupUsers(id);

    return (
        <div>
            <ChatBase fetchedUsers={user} group={group} oldMessages={chats} />
        </div>
    );
}
