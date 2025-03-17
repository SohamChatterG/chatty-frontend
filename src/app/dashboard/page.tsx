
import React from "react";
import { DashNav } from "../components/base/dashboard/DashNav";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import CreateChat from "@/groupChat/CreateChat";
import { fetchChatGroups } from "@/fetch/groupFetch";
import { GroupChatCard } from "@/groupChat/GroupChatCard";
import FooterDashboard from "../components/base/FooterDashboard";

async function Dashboard() {
    const session: CustomSession | null = await getServerSession(authOptions);
    const groups: Array<ChatGroupType> = await fetchChatGroups(session?.user?.token);

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <DashNav name={session?.user?.name ?? "User"} image={session?.user?.image} />

            <div className="container mx-auto py-10 px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">Your Chats</h2>
                    <CreateChat user={session?.user} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length > 0 && groups.map((group, index) => (
                        <GroupChatCard group={group} key={index} user={session?.user!} />
                    ))}
                </div>
            </div>
            <FooterDashboard />
        </div>
    );
}

export default Dashboard;