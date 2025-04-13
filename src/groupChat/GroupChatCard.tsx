"use client"
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import GroupChatCardMenu from "./GroupChatCardMenu";
import { useRouter } from "next/navigation";
import { Lock, Globe } from "lucide-react"; // Import icons

export function GroupChatCard({ group, user }: { group: ChatGroupType; user: CustomUser }) {
    const router = useRouter();
    const handleCardClick = () => router.push(`/chat/${group.id}`);

    return (
        <div
            onClick={handleCardClick}
            className={`cursor-pointer p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all 
                ${group.is_public ? "bg-gray-600" : "bg-gray-700"}`} // Different colors
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                <GroupChatCardMenu user={user} group={group} />
            </div>

            <div className="flex items-center mt-2 space-x-2">
                {group.is_public ? (
                    <Globe className="w-5 h-5 text-green-300" title="Public Group" />
                ) : (
                    <Lock className="w-5 h-5 text-red-400" title="Private Group" />
                )}
                <span className="text-gray-300 text-sm">{group.is_public ? "Public Group" : "Private Group"}</span>
            </div>

            {group.passcode && !group.is_public && (
                <p className="text-gray-400 text-sm mt-2">Passcode: ******</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Created on {new Date(group.created_at).toDateString()}</p>
        </div>
    );
}