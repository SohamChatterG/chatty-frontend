"use client";
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

export default function MobileChatSidebar({
    users,
    activeUsers
}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | []; // Add activeUsers type

}) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <HamburgerMenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="bg-muted">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Users</SheetTitle>
                </SheetHeader>
                <div>
                    {users?.length > 0 &&
                        users.map((item, index) => (
                            <div key={index} className="bg-white rounded-md p-2 mt-2">
                                <p className="font-bold"> {item.name}</p>
                                <p>
                                    Joined :{" "}
                                    <span>{new Date(item.created_at).toDateString()}</span>
                                </p>
                            </div>
                        ))}
                </div>
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Active Users</SheetTitle>
                </SheetHeader>
                <div> {/* Add a container for Active Users */}
                    {activeUsers?.length > 0 ? (
                        activeUsers.map((user, index) => (
                            <div key={index} className="bg-white rounded-md p-2 mt-2">
                                <p className="font-bold"> {user.name}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No active users</p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}