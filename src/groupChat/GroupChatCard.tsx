"use client"
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import GroupChatCardMenu from "./GroupChatCardMenu";
import { useRouter } from "next/navigation"; // Import useRouter

export default function GroupChatCard({
    group,
    user,
}: {
    group: ChatGroupType;
    user: CustomUser;
}) {
    const router = useRouter(); // Initialize useRouter
    const handleCardClick = () => {
        router.push(`/chat/${group.id}`); // Navigate to the chat URL on card click
    };
    return (
        <Card onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <CardHeader className="flex-row justify-between items-center ">
                <CardTitle className="text-2xl">{group.title}</CardTitle>
                <GroupChatCardMenu user={user} group={group} />
            </CardHeader>
            <CardContent>
                <p>
                    Passcode :-<strong>{group.passcode}</strong>
                </p>
                <p>Created At :-{new Date(group.created_at).toDateString()}</p>
            </CardContent>
        </Card>
    );
}