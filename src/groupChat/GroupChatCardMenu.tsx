"use client";
import React, { Suspense, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon, Share2Icon, CopyIcon } from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import EditGroupChat from "./EditGroupChat";
import { toast } from "sonner";
import Env from "@/lib/env";
import { Edit, Trash } from "lucide-react";
const DeleteChatGroup = dynamic(() => import("./DeleteChatGroup"));

export default function GroupChatCardMenu({
    group,
    user,
    from
}: {
    group: ChatGroupType;
    user?: CustomUser;
    from?: string
}) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editDialoag, setEditDialog] = useState(false);
    const handleCopy = () => {
        navigator.clipboard?.writeText(`${Env.APP_URL}/chat/${group.id}`);
        toast.success("Link copied successfully!");
    };

    const handleShare = async () => {
        const shareUrl = `${Env.APP_URL}/chat/${group.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Share Chat: ${group.title}`,
                    url: shareUrl,
                });
                toast.success("Shared successfully!");
            } catch (error: any) {
                if (error.message === "The user aborted a request.") {
                    // User cancelled the share, which is fine.
                } else {
                    toast.error("Could not share. Please copy the link.");
                    // Fallback to copy link if Web Share API fails or is not supported
                    navigator.clipboard?.writeText(shareUrl);
                    toast.success("Link copied to clipboard!");
                }
            }
        } else {
            // Web Share API not supported, fallback to copy
            navigator.clipboard?.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <>
            {deleteDialog && (
                <Suspense fallback={<p>Loading...</p>}>
                    <DeleteChatGroup
                        open={deleteDialog}
                        setOpen={setDeleteDialog}
                        groupId={group.id}
                        token={user?.token!}
                    />
                </Suspense>
            )}
            {editDialoag && (
                <Suspense fallback={<p>Loading...</p>}>
                    <EditGroupChat
                        open={editDialoag}
                        setOpen={setEditDialog}
                        user={user}
                        group={group}
                    />
                </Suspense>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <DotsVerticalIcon className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleShare}>
                        <Share2Icon className="mr-2 h-4 w-4" />
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopy}>
                        <CopyIcon className="mr-2 h-4 w-4" />

                        Copy
                    </DropdownMenuItem>
                    {from && from?.length && (
                        <>
                            <DropdownMenuItem onClick={() => setEditDialog(true)}>
                                <Edit className="mr-2 h-4 w-4" />

                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog(true)}>
                                <Trash className="mr-2 h-4 w-4" /> {/* Add Share Icon */}

                                Delete
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}