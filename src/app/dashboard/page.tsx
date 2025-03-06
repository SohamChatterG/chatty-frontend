import React from 'react'
import DashNav from '../components/base/dashboard/DashNav'
import { authOptions, CustomSession, CustomUser } from '../api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth'
import CreateChat from "@/groupChat/CreateChat"
import { fetchChatGroups } from '@/fetch/groupFetch'
import GroupChatCard from '@/groupChat/GroupChatCard'
async function dashboard() {
    const session: CustomSession | null = await getServerSession(authOptions)
    const groups: Array<ChatGroupType> = await fetchChatGroups(session?.user?.token)

    return (
        <>
            <div>
                <DashNav name={session?.user?.name ?? "name"} image={session?.user?.image ?? undefined} />
            </div>
            <div className='container'>
                <div className='flex justify-end mt-10'>
                    <CreateChat user={session?.user} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groups.length > 0 &&
                        groups.map((item, index) => (
                            <GroupChatCard group={item} key={index} user={session?.user!} />
                        ))}
                </div>
            </div>

        </>

    )
}

export default dashboard
