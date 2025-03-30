"use client";
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from 'sonner';
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Trash2, ShieldCheck } from "lucide-react";
import { removeUser, makeAdmin } from "@/fetch/chatsFetch";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
export default function MobileChatSidebar({
    users,
    activeUsers,
    groupId,
    user
}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | []; // Add activeUsers type
    groupId: string,
    user: CustomUser
}) {
    const [open, setOpen] = useState(false); // State to manage sidebar visibility

    const handleRemoveUser = async (userId: string) => {
        try {
            //@ts-ignore
            await removeUser(user?.token, userId, groupId);
            toast.success("User removed from group!");
            const storedData = localStorage.getItem(groupId);
            if (storedData) {
                const jsonData = JSON.parse(storedData);
                if (jsonData?.id === userId) {
                    localStorage.removeItem(groupId);
                }
            }

            setOpen(false); // Close
        } catch (error) {

            console.error(error);
            toast.error("Failed to remove user");
        }
    };

    const handleMakeAdmin = async (userId: string) => {
        try {
            //@ts-ignore
            await makeAdmin(user?.token, userId, groupId);
            toast.success("User promoted to admin!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to make admin");
        }
    };
    console.log("user", user);
    console.log("users", users)
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <HamburgerMenuIcon onClick={() => setOpen(true)} />
            </SheetTrigger>
            <SheetContent side="left" className="bg-muted">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Users</SheetTitle>
                </SheetHeader>
                <div>
                    {users?.length > 0 &&
                        users.map((item, index) => (
                            <div key={index} className="bg-white rounded-md p-2 mt-2 flex justify-between items-center">
                                <div >
                                    <div className="flex justify-between">
                                        <span className="font-bold">   {item.name}</span>
                                        {item.is_admin && <span className="text-green-400 text-sm">         (admin)</span>}

                                    </div>
                                    <p>
                                        Joined: <span>{new Date(item.created_at).toDateString()}</span>
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    {/* Make Admin Button */}
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => handleMakeAdmin(user?.id as string)}
                                    >
                                        <ShieldCheck size={20} />
                                    </button>
                                    {/* Remove User Button */}
                                    {item.id != Number(user?.id) && <button
                                        className="text-red-500 hover:text-red-700"

                                        onClick={() => handleRemoveUser(String(item.id))}
                                    >
                                        <Trash2 size={20} />
                                    </button>}
                                </div>
                            </div>
                        ))}
                </div>

                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Active Users</SheetTitle>
                </SheetHeader>
                <div>
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
        </Sheet >
    );
}
