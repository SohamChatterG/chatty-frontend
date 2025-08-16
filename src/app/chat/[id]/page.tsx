import ChatBase from '@/app/components/chat/ChatBase'
import { fetchChatGroup, fetchChatGroupUsers } from '@/fetch/groupFetch'
import { notFound } from 'next/navigation'
import React from 'react'
import { fetchChats } from '@/fetch/chatsFetch'
type Props = {
    params: {
        id: string;
    };
};

async function chat({ params }: Props) {

    if (params.id.length !== 36) {
        return notFound()
    }
    const group: ChatGroupType | null = await fetchChatGroup(params.id);
    if (group === null) {
        return notFound()
    }
    const chats: Array<MessageType> | [] = await fetchChats(params.id)

    const user: Array<GroupChatUserType> | [] = await fetchChatGroupUsers(params.id);
    return (
        <div>
            <ChatBase fetchedUsers={user} group={group} oldMessages={chats} />
        </div>
    )
}

export default chat
