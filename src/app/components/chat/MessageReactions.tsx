"use client";
import React, { useState } from "react";
import { Smile } from "lucide-react";
import { MessageType, MessageReactionType } from "@/types";

interface MessageReactionsProps {
    message: MessageType;
    currentUserName: string;
    onAddReaction: (messageId: string, emoji: string) => void;
    onRemoveReaction: (messageId: string, emoji: string) => void;
}

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

export default function MessageReactions({
    message,
    currentUserName,
    onAddReaction,
    onRemoveReaction,
}: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Group reactions by emoji
    const groupedReactions = (message.MessageReactions || []).reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = {
                emoji: reaction.emoji,
                count: 0,
                users: [],
                userReacted: false,
            };
        }
        acc[reaction.emoji].count++;
        acc[reaction.emoji].users.push(reaction.user_name);
        if (reaction.user_name === currentUserName) {
            acc[reaction.emoji].userReacted = true;
        }
        return acc;
    }, {} as Record<string, { emoji: string; count: number; users: string[]; userReacted: boolean }>);

    const handleReactionClick = (emoji: string) => {
        const existing = groupedReactions[emoji];
        if (existing && existing.userReacted) {
            onRemoveReaction(message.id, emoji);
        } else {
            onAddReaction(message.id, emoji);
        }
        setShowPicker(false);
    };

    return (
        <div className="flex items-center gap-1 mt-1 flex-wrap">
            {/* Display existing reactions */}
            {Object.values(groupedReactions).map((reaction) => (
                <button
                    key={reaction.emoji}
                    onClick={() => handleReactionClick(reaction.emoji)}
                    className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-all ${reaction.userReacted
                            ? "bg-blue-100 border border-blue-300"
                            : "bg-gray-100 border border-gray-200 hover:bg-gray-200"
                        }`}
                    title={reaction.users.join(", ")}
                >
                    <span>{reaction.emoji}</span>
                    <span className="font-medium">{reaction.count}</span>
                </button>
            ))}

            {/* Add reaction button */}
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-all"
                >
                    <Smile className="w-4 h-4 text-gray-500" />
                </button>

                {showPicker && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowPicker(false)}
                        ></div>
                        <div className="absolute bottom-full mb-1 left-0 bg-white border rounded-lg shadow-lg p-2 z-20 flex gap-1">
                            {EMOJI_LIST.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReactionClick(emoji)}
                                    className="text-xl hover:scale-125 transition-transform p-1"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
