"use client";
import React, { useState } from "react";
import { Search, X } from "lucide-react";
import Env from "@/lib/env";
import { MessageType } from "@/types";

interface MessageSearchProps {
    groupId: string;
    onMessageClick: (messageId: string) => void;
}

export default function MessageSearch({ groupId, onMessageClick }: MessageSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MessageType[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(
                `${Env.BACKEND_URL}/api/chats-search?groupId=${groupId}&query=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            setResults(data.data || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full hover:bg-gray-200 transition-all"
                title="Search messages"
            >
                <Search className="w-5 h-5 text-gray-600" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b flex items-center gap-3">
                            <Search className="w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="flex-1 outline-none text-gray-800"
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searching || !query.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {searching ? "Searching..." : "Search"}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {results.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    {query ? "No messages found" : "Enter a search query"}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {results.map((message) => (
                                        <button
                                            key={message.id}
                                            onClick={() => {
                                                onMessageClick(message.id);
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-gray-900">{message.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(message.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
