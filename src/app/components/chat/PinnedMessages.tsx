"use client";

import { useState, useEffect } from "react";
import { Pin, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PinnedMessageType } from "@/types";
import { CHAT_PINNED } from "@/lib/apiEndpoints";

interface PinnedMessagesProps {
    groupId: string;
    onScrollToMessage: (messageId: string) => void;
    onUnpin: (messageId: string) => void;
}

export default function PinnedMessages({
    groupId,
    onScrollToMessage,
    onUnpin,
}: PinnedMessagesProps) {
    const [pinnedMessages, setPinnedMessages] = useState<PinnedMessageType[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        fetchPinnedMessages();
    }, [groupId]);

    const fetchPinnedMessages = async () => {
        try {
            const response = await fetch(`${CHAT_PINNED}/${groupId}`);
            if (response.ok) {
                const data = await response.json();
                setPinnedMessages(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching pinned messages:", error);
        }
    };

    const handleUnpin = async (messageId: string) => {
        onUnpin(messageId);
        setPinnedMessages((prev) =>
            prev.filter((pm) => pm.message_id !== messageId)
        );
    };

    if (pinnedMessages.length === 0) return null;

    return (
        <div className="border-b bg-amber-50 dark:bg-amber-900/20">
            <div
                className="flex items-center justify-between px-4 py-2 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        {pinnedMessages.length} pinned message
                        {pinnedMessages.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <Button variant="ghost" size="sm">
                    {isExpanded ? "Hide" : "Show"}
                </Button>
            </div>

            {isExpanded && (
                <div className="px-4 pb-3 space-y-2">
                    {pinnedMessages.map((pinned) => (
                        <div
                            key={pinned.id}
                            className="flex items-start justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border"
                        >
                            <div
                                className="flex-1 cursor-pointer"
                                onClick={() => onScrollToMessage(pinned.message_id)}
                            >
                                <p className="text-xs text-gray-500 mb-1">
                                    Pinned by {pinned.pinned_by_name}
                                </p>
                                <p className="text-sm line-clamp-2">
                                    {pinned.message?.message || (
                                        <span className="text-gray-400 italic">
                                            {pinned.message?.file_url ? "📎 Attachment" : "Message"}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onScrollToMessage(pinned.message_id)}
                                >
                                    <MessageSquare className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500"
                                    onClick={() => handleUnpin(pinned.message_id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
