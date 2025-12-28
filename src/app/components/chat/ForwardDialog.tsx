"use client";

import { useState } from "react";
import { Forward, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ChatGroupType, MessageType } from "@/types";

interface ForwardDialogProps {
    message: MessageType;
    groups: ChatGroupType[];
    currentGroupId: string;
    onForward: (targetGroupId: string) => void;
}

export default function ForwardDialog({
    message,
    groups,
    currentGroupId,
    onForward,
}: ForwardDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [isForwarding, setIsForwarding] = useState(false);

    const availableGroups = groups.filter((g) => g.id !== currentGroupId);

    const toggleGroup = (groupId: string) => {
        setSelectedGroups((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleForward = async () => {
        if (selectedGroups.length === 0) return;

        setIsForwarding(true);
        try {
            for (const groupId of selectedGroups) {
                await onForward(groupId);
            }
            setSelectedGroups([]);
            setIsOpen(false);
        } finally {
            setIsForwarding(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Forward className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Forward Message</DialogTitle>
                </DialogHeader>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availableGroups.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No other groups available
                        </p>
                    ) : (
                        availableGroups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => toggleGroup(group.id)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${selectedGroups.includes(group.id)
                                        ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20"
                                        : "bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <span className="font-medium">{group.title}</span>
                                {selectedGroups.includes(group.id) && (
                                    <Check className="h-5 w-5 text-blue-500" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleForward}
                        disabled={selectedGroups.length === 0 || isForwarding}
                    >
                        {isForwarding ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Forwarding...
                            </>
                        ) : (
                            <>
                                Forward to {selectedGroups.length} group
                                {selectedGroups.length !== 1 ? "s" : ""}
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
