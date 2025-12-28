import React from "react";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { fetchChatGroups } from "@/fetch/groupFetch";
import { ChatGroupType } from "@/types";
import Dashboard from "./page";

async function DashboardServer() {
    const session: CustomSession | null = await getServerSession(authOptions);
    const groups: Array<ChatGroupType> = await fetchChatGroups(
        session?.user?.token as string
    );

    return <Dashboard session={session} groups={groups} />;
}

export default DashboardServer;
