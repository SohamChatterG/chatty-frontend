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
import { GroupChatUserType } from "@/types";
export default function MobileChatSidebar({
    users,
    activeUsers,
    groupId,
    user,
    setUsers,
    isLargeScreen
}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | [];
    groupId: string,
    user: CustomUser,
    setUsers: Dispatch<SetStateAction<Array<GroupChatUserType>>>,
    isLargeScreen: boolean
}) {
    const [open, setOpen] = useState(false);


    const handleRemoveUser = async (targetId: string) => {
        try {
            console.log(`Removing user ${targetId} from group ${groupId} requested by ${user?.id} with token ${user?.token}`);
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
                <button
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Open menu"
                >
                    <HamburgerMenuIcon className="w-5 h-5 text-gray-600" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white w-80 max-w-full border-r border-gray-200">
                {/* Header */}
                <SheetHeader className="px-4 py-4 border-b border-gray-100">
                    <SheetTitle className="text-xl font-semibold text-gray-800">
                        Team Members
                    </SheetTitle>
                </SheetHeader>

                {/* Scrollable Content */}
                <div className="h-[calc(100vh-120px)] overflow-y-auto p-4 space-y-4">
                    {/* All Users Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            All Members
                        </h3>
                        {users?.length > 0 ? (
                            users.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gray-50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                {item.is_admin && (
                                                    <span className="text-xs text-green-500 bg-green-50 px-1.5 py-0.5 rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Joined {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMakeAdmin(String(item.id), item.is_admin)}
                                            className="p-1.5 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                                            title={item.is_admin ? "Remove admin" : "Make admin"}
                                        >
                                            <ShieldCheck size={18} />
                                        </button>
                                        {item.id !== Number(user?.id) && (
                                            <button
                                                onClick={() => handleRemoveUser(String(item.id))}
                                                className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                                title="Remove user"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No members found</p>
                        )}
                    </div>

                    {/* Active Users Section */}
                    <div className="space-y-3 pt-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Online Now
                        </h3>
                        {activeUsers?.length > 0 ? (
                            activeUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 p-2">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"></span>
                                    </div>
                                    <p className="font-medium text-gray-800">{user.name}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No active users</p>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
