"use client";
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from 'sonner';
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Trash2, ShieldCheck } from "lucide-react";
import { removeUser, makeAdmin } from "@/fetch/chatsFetch";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { fetchChatGroupUsers } from "@/fetch/groupFetch";
export default function MobileChatSidebar({
    users,
    activeUsers,
    groupId,
    user,
    setUsers,

}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | [];
    groupId: string,
    user: CustomUser,
    setUsers: Dispatch<SetStateAction<Array<GroupChatUserType>>>
}) {
    const [open, setOpen] = useState(false);

    // const handleRemoveUser = async (userId: string) => {
    //     try {
    //         //@ts-ignore
    //         await removeUser(user?.token, userId, groupId);
    //         toast.success("User removed from group!");
    //         setOpen(false);
    //         const updatedUsers = await fetchChatGroupUsers(groupId);
    //         setUsers(updatedUsers);
    //     } catch (error) {

    //         console.error(error);
    //         toast.error("Failed to remove user");
    //     }
    // };
    const handleRemoveUser = async (targetId: string) => {
        try {
            const response = await removeUser(
                user?.token as string,
                targetId,
                groupId,
                user?.id as string
            );

            if (response.isSelfRemoval) {
                // If user removed themselves
                toast.success(response.message || "You have left the group!");
                // Remove group details from local storage
                localStorage.removeItem(groupId);
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                toast.success(response.message || "User removed from group!");
                const updatedUsers = await fetchChatGroupUsers(groupId);
                setUsers(updatedUsers);
            }

            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to remove user");
        }
    };
    const handleMakeAdmin = async (targetId: string, is_admin: boolean) => {
        try {
            //@ts-ignore
            await makeAdmin(
                user.token as string,
                targetId,
                groupId,
                is_admin,
                user?.id as string
            );


            if (!is_admin) {
                toast.success("User promoted to admin!");
            } else {
                toast.success("User demoted from admin!");
            }

            const updatedUsers = await fetchChatGroupUsers(groupId);
            setUsers(updatedUsers);
        } catch (error) {
            console.error(error);
            if (!is_admin) {
                toast.error("Failed to promote user to admin.");
            } else {
                toast.error("Failed to demote user from admin.");
            }
        }
    };
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
                                        onClick={() => handleMakeAdmin(String(item.id), item.is_admin)}
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
