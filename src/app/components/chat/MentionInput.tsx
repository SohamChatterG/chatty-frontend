"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { GroupChatUserType } from "@/types";

interface MentionInputProps {
    value: string;
    onChange: (value: string, mentions: string[]) => void;
    users: GroupChatUserType[];
    placeholder?: string;
    className?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function MentionInput({
    value,
    onChange,
    users,
    placeholder = "Type a message...",
    className = "",
    onKeyDown,
}: MentionInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [mentionSearch, setMentionSearch] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );

    useEffect(() => {
        // Check if we should show suggestions
        const beforeCursor = value.slice(0, cursorPosition);
        const mentionMatch = beforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setMentionSearch(mentionMatch[1]);
            setShowSuggestions(true);
            setSuggestionIndex(0);
        } else {
            setShowSuggestions(false);
            setMentionSearch("");
        }
    }, [value, cursorPosition]);

    const extractMentions = (text: string): string[] => {
        const mentionRegex = /@(\w+)/g;
        const mentions: string[] = [];
        let match;
        while ((match = mentionRegex.exec(text)) !== null) {
            const mentionedUser = users.find(
                (u) => u.name.toLowerCase() === match[1].toLowerCase()
            );
            if (mentionedUser && mentionedUser.user_id) {
                mentions.push(mentionedUser.user_id.toString());
            }
        }
        return mentions;
    };

    const insertMention = (user: GroupChatUserType) => {
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);

        // Find the @ symbol position
        const mentionStart = beforeCursor.lastIndexOf("@");
        const newValue =
            beforeCursor.slice(0, mentionStart) +
            `@${user.name} ` +
            afterCursor;

        const mentions = extractMentions(newValue);
        onChange(newValue, mentions);
        setShowSuggestions(false);

        // Focus back on textarea
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setCursorPosition(e.target.selectionStart || 0);
        const mentions = extractMentions(newValue);
        onChange(newValue, mentions);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSuggestionIndex((prev) =>
                    prev < filteredUsers.length - 1 ? prev + 1 : prev
                );
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
                return;
            }
            if (e.key === "Enter" && filteredUsers[suggestionIndex]) {
                e.preventDefault();
                insertMention(filteredUsers[suggestionIndex]);
                return;
            }
            if (e.key === "Escape") {
                setShowSuggestions(false);
                return;
            }
        }

        onKeyDown?.(e);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        setCursorPosition(target.selectionStart || 0);
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                placeholder={placeholder}
                className={`resize-none ${className}`}
                rows={1}
            />

            {showSuggestions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
                    {filteredUsers.map((user, index) => (
                        <div
                            key={user.id}
                            onClick={() => insertMention(user)}
                            className={`px-3 py-2 cursor-pointer ${index === suggestionIndex
                                    ? "bg-blue-100 dark:bg-blue-900"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <span className="font-medium">{user.name}</span>
                            {user.is_admin && (
                                <span className="ml-2 text-xs text-blue-500">Admin</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper to render message with highlighted mentions
export function renderMessageWithMentions(
    message: string,
    currentUserName?: string
): React.ReactNode {
    const parts = message.split(/(@\w+)/g);

    return parts.map((part, index) => {
        if (part.startsWith("@")) {
            const mentionName = part.slice(1);
            const isCurrentUser = currentUserName?.toLowerCase() === mentionName.toLowerCase();

            return (
                <span
                    key={index}
                    className={`font-semibold ${isCurrentUser
                            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                >
                    {part}
                </span>
            );
        }
        return part;
    });
}
