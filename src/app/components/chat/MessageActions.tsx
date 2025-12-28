"use client";
import React, { useState } from "react";
import { MoreVertical, Edit, Trash2, Reply } from "lucide-react";
import { MessageType } from "@/types";

interface MessageActionsProps {
    message: MessageType;
    isOwnMessage: boolean;
    onEdit: (messageId: string, newMessage: string) => void;
    onDelete: (messageId: string) => void;
    onReply: (message: MessageType) => void;
}

export default function MessageActions({
    message,
    isOwnMessage,
    onEdit,
    onDelete,
    onReply,
}: MessageActionsProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.message || "");

    const handleEdit = () => {
        if (editText.trim() && editText !== message.message) {
            onEdit(message.id, editText);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this message?")) {
            onDelete(message.id);
            setShowMenu(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex gap-2 mt-2">
                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm text-gray-800"
                    autoFocus
                />
                <button
                    onClick={handleEdit}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                    Save
                </button>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setEditText(message.message || "");
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    ></div>
                    <div className="absolute top-8 right-2 bg-white border rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                        <button
                            onClick={() => {
                                onReply(message);
                                setShowMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                        >
                            <Reply className="w-4 h-4" />
                            Reply
                        </button>
                        {isOwnMessage && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
