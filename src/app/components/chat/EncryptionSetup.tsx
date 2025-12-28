"use client";

import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, Key, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEncryption } from "@/lib/useEncryption";
import { GroupChatUserType } from "@/types";
import { toast } from "sonner";

interface EncryptionSetupProps {
    userId?: number;
    groupId: string;
    isGroupEncrypted: boolean;
    isAdmin: boolean;
    groupMembers: GroupChatUserType[];
    onEncryptionEnabled?: () => void;
}

export function EncryptionSetup({
    userId,
    groupId,
    isGroupEncrypted,
    isAdmin,
    groupMembers,
    onEncryptionEnabled,
}: EncryptionSetupProps) {
    const [open, setOpen] = useState(false);

    const {
        isSupported,
        hasKeys,
        isReady,
        isSettingUp,
        error,
        setupUserKeys,
        enableGroupEncryption,
    } = useEncryption({ userId, groupId, isGroupEncrypted });

    const handleSetupKeys = async () => {
        const success = await setupUserKeys();
        if (success) {
            toast.success("Encryption keys set up successfully!");
        } else {
            toast.error("Failed to setup encryption keys");
        }
    };

    const handleEnableEncryption = async () => {
        // Filter members with user_id and map to required shape
        const membersWithIds = groupMembers
            .filter((m): m is GroupChatUserType & { user_id: number } => m.user_id !== undefined)
            .map(m => ({ user_id: m.user_id }));
        
        if (membersWithIds.length === 0) {
            toast.error("No authenticated members in this group");
            return;
        }

        const success = await enableGroupEncryption(membersWithIds);
        if (success) {
            toast.success("End-to-end encryption enabled!");
            onEncryptionEnabled?.();
            setOpen(false);
        }
    };

    if (!isSupported) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>E2E encryption not supported in this browser</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (isGroupEncrypted) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                            <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                {isReady ? "Encrypted" : "Setting up..."}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Messages are end-to-end encrypted</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Enable E2E</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-500" />
                        End-to-End Encryption
                    </DialogTitle>
                    <DialogDescription>
                        Enable encryption to secure all messages in this group. Only members will be able to read messages.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Step 1: Setup personal keys */}
                    <div className={`p-4 rounded-lg border ${hasKeys ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${hasKeys ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <Key className={`w-4 h-4 ${hasKeys ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-sm">Step 1: Setup Your Keys</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {hasKeys 
                                        ? "Your encryption keys are ready"
                                        : "Generate your personal encryption keys"}
                                </p>
                            </div>
                            {!hasKeys && (
                                <Button
                                    size="sm"
                                    onClick={handleSetupKeys}
                                    disabled={isSettingUp}
                                >
                                    {isSettingUp ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Setup"
                                    )}
                                </Button>
                            )}
                            {hasKeys && (
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            )}
                        </div>
                    </div>

                    {/* Step 2: Enable for group */}
                    <div className={`p-4 rounded-lg border ${!hasKeys ? 'opacity-50' : ''} border-gray-200 bg-gray-50 dark:bg-gray-800`}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                <Shield className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-sm">Step 2: Enable for Group</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {isAdmin 
                                        ? "Enable encryption for all group members"
                                        : "Only admins can enable encryption"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Member status */}
                    {hasKeys && isAdmin && (
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                <AlertCircle className="w-4 h-4" />
                                <span>
                                    {groupMembers.filter(m => m.user_id).length} of {groupMembers.length} members can be encrypted
                                </span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Guest users without accounts cannot participate in encrypted chats.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEnableEncryption}
                        disabled={!hasKeys || !isAdmin || isSettingUp}
                        className="gap-2"
                    >
                        {isSettingUp ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Lock className="w-4 h-4" />
                        )}
                        Enable Encryption
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Encryption indicator badge for messages
interface EncryptionBadgeProps {
    isEncrypted: boolean;
    size?: "sm" | "md";
}

export function EncryptionBadge({ isEncrypted, size = "sm" }: EncryptionBadgeProps) {
    const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    if (!isEncrypted) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Lock className={`${iconSize} text-green-500 inline-block ml-1`} />
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">End-to-end encrypted</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Encryption status header component
interface EncryptionStatusProps {
    isEncrypted: boolean;
}

export function EncryptionStatus({ isEncrypted }: EncryptionStatusProps) {
    if (!isEncrypted) return null;

    return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Lock className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                E2E Encrypted
            </span>
        </div>
    );
}
