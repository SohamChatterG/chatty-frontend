"use client";

import { useState } from "react";
import {
    Shield,
    ShieldOff,
    VolumeX,
    Volume2,
    Ban,
    UserCheck,
    Crown,
    MoreVertical,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupChatUserType } from "@/types";
import OnlineStatus from "./OnlineStatus";
import Env from "@/lib/env";

interface AdminPanelProps {
    groupId: string;
    members: GroupChatUserType[];
    currentUserId: number;
    isAdmin: boolean;
    isOwner: boolean;
    onMemberUpdate: () => void;
}

export default function AdminPanel({
    groupId,
    members,
    currentUserId,
    isAdmin,
    isOwner,
    onMemberUpdate,
}: AdminPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (
        action: "mute" | "unmute" | "ban" | "unban" | "promote" | "demote" | "transfer",
        targetUserId: number
    ) => {
        setLoading(`${action}-${targetUserId}`);
        try {
            let endpoint = "";
            let method = "PUT";
            let body: any = {};

            switch (action) {
                case "mute":
                case "unmute":
                    endpoint = `${Env.BACKEND_URL}/api/group-users/${groupId}/${targetUserId}/mute`;
                    body = { is_muted: action === "mute" };
                    break;
                case "ban":
                case "unban":
                    endpoint = `${Env.BACKEND_URL}/api/group-users/${groupId}/${targetUserId}/ban`;
                    body = { is_banned: action === "ban" };
                    break;
                case "promote":
                case "demote":
                    endpoint = `${Env.BACKEND_URL}/api/group-users/admin-status`;
                    body = {
                        groupId,
                        targetId: targetUserId,
                        is_admin: action === "demote",
                        adminId: currentUserId,
                    };
                    break;
                case "transfer":
                    endpoint = `${Env.BACKEND_URL}/api/group-users/transfer-ownership`;
                    method = "POST";
                    body = { groupId, newOwnerId: targetUserId };
                    break;
            }

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include",
            });

            if (response.ok) {
                onMemberUpdate();
            } else {
                const data = await response.json();
                alert(data.message || "Action failed");
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            alert("An error occurred");
        } finally {
            setLoading(null);
        }
    };

    if (!isAdmin) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Members
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Group Administration
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {members.map((member) => {
                        const isCurrentUser = member.user_id === currentUserId;
                        const canManage = !isCurrentUser && (isOwner || (!member.is_owner && isAdmin));

                        return (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        {member.user?.is_online !== undefined && (
                                            <div className="absolute -bottom-0.5 -right-0.5">
                                                <OnlineStatus isOnline={member.user.is_online} size="sm" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{member.name}</span>
                                            {member.is_owner && (
                                                <Crown className="h-4 w-4 text-yellow-500" />
                                            )}
                                            {member.is_admin && !member.is_owner && (
                                                <Shield className="h-4 w-4 text-blue-500" />
                                            )}
                                            {member.is_muted && (
                                                <VolumeX className="h-4 w-4 text-orange-500" />
                                            )}
                                            {member.is_banned && (
                                                <Ban className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {member.user?.email || `User #${member.user_id || "Guest"}`}
                                        </p>
                                    </div>
                                </div>

                                {canManage && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={!!loading}>
                                                {loading?.includes(String(member.user_id)) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <MoreVertical className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {/* Mute/Unmute */}
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleAction(
                                                        member.is_muted ? "unmute" : "mute",
                                                        member.user_id!
                                                    )
                                                }
                                            >
                                                {member.is_muted ? (
                                                    <>
                                                        <Volume2 className="h-4 w-4 mr-2" />
                                                        Unmute User
                                                    </>
                                                ) : (
                                                    <>
                                                        <VolumeX className="h-4 w-4 mr-2" />
                                                        Mute User
                                                    </>
                                                )}
                                            </DropdownMenuItem>

                                            {/* Ban/Unban */}
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleAction(
                                                        member.is_banned ? "unban" : "ban",
                                                        member.user_id!
                                                    )
                                                }
                                                className={member.is_banned ? "" : "text-red-600"}
                                            >
                                                {member.is_banned ? (
                                                    <>
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Unban User
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        Ban User
                                                    </>
                                                )}
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            {/* Promote/Demote Admin */}
                                            {isOwner && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleAction(
                                                            member.is_admin ? "demote" : "promote",
                                                            member.id
                                                        )
                                                    }
                                                >
                                                    {member.is_admin ? (
                                                        <>
                                                            <ShieldOff className="h-4 w-4 mr-2" />
                                                            Remove Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Make Admin
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}

                                            {/* Transfer Ownership */}
                                            {isOwner && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Transfer ownership to ${member.name}? This cannot be undone.`
                                                            )
                                                        ) {
                                                            handleAction("transfer", member.user_id!);
                                                        }
                                                    }}
                                                    className="text-yellow-600"
                                                >
                                                    <Crown className="h-4 w-4 mr-2" />
                                                    Transfer Ownership
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
