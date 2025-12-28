"use client";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";
import { SendIcon, Image as ImageIcon, X } from "lucide-react";
import { ChatGroupType, GroupChatUserType, MessageType } from "@/types";
import FileUpload from "./FileUpload";
import MessageReactions from "./MessageReactions";
import MessageActions from "./MessageActions";
import MessageSearch from "./MessageSearch";
import Env from "@/lib/env";

export default function ChatsNew({
    group,
    oldMessages,
    chatUser,
    setActiveUsers,
    setTypingUser,
    typingUser,
}: {
    group: ChatGroupType;
    oldMessages: Array<MessageType> | [];
    chatUser?: GroupChatUserType;
    setActiveUsers: React.Dispatch<React.SetStateAction<GroupChatUserType[]>>;
    setTypingUser: (userName: string) => void;
    typingUser: string;
}) {
    const params = useParams();
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
    const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{
        url: string;
        type: string;
        size: number;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToMessage = (messageId: string) => {
        const element = document.getElementById(`msg-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("bg-yellow-100");
            setTimeout(() => element.classList.remove("bg-yellow-100"), 2000);
        }
    };

    let socket = useMemo(() => {
        console.log("Initializing socket connection...");

        const socket = getSocket();
        socket.auth = {
            room: group.id,
            user: chatUser,
        };
        console.log("socket.connect", socket.connect());
        return socket.connect();
    }, [group.id, chatUser]);

    useEffect(() => {
        socket.on("message", (data: MessageType) => {
            console.log("The message is", data);
            setMessages((prevMessages) => [...prevMessages, data]);
            scrollToBottom();
        });

        socket.on("messageEdited", (data: MessageType) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg.id === data.id ? data : msg))
            );
        });

        socket.on("messageDeleted", (data: { id: string }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === data.id ? { ...msg, deleted_at: new Date().toISOString(), message: null } : msg
                )
            );
        });

        socket.on("reactionAdded", (data: any) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg.id === data.message_id) {
                        const reactions = msg.MessageReactions || [];
                        return {
                            ...msg,
                            MessageReactions: [
                                ...reactions,
                                {
                                    id: Date.now(),
                                    message_id: data.message_id,
                                    user_name: data.user_name,
                                    user_id: data.user_id,
                                    emoji: data.emoji,
                                    created_at: new Date().toISOString(),
                                },
                            ],
                        };
                    }
                    return msg;
                })
            );
        });

        socket.on("reactionRemoved", (data: any) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg.id === data.message_id) {
                        return {
                            ...msg,
                            MessageReactions: (msg.MessageReactions || []).filter(
                                (r) => !(r.user_name === data.user_name && r.emoji === data.emoji)
                            ),
                        };
                    }
                    return msg;
                })
            );
        });

        socket.on("typing", (userName: string) => {
            console.log("typing.....", userName);
            if (userName) {
                setTypingUser(userName);
            } else {
                setTypingUser("");
            }
        });

        socket.on("userJoined", (user: GroupChatUserType) => {
            //@ts-ignore
            setActiveUsers((prevUsers) => [...prevUsers, user]);
        });

        socket.on("userLeft", (userId: string) => {
            // activeUsers are socket-level users (id is string),
            // so we use a loose comparison to avoid type conflicts.
            setActiveUsers((prevUsers: any[]) =>
                prevUsers.filter((user) => user.id !== userId)
            );
        });

        socket.on("activeUsers", (users: GroupChatUserType[]) => {
            setActiveUsers(users);
        });

        socket.emit("getUsers");
        return () => {
            socket.off("message");
            socket.off("messageEdited");
            socket.off("messageDeleted");
            socket.off("reactionAdded");
            socket.off("reactionRemoved");
            socket.off("userJoined");
            socket.off("userLeft");
            socket.off("activeUsers");
            socket.close();
        };
    }, [socket, setActiveUsers, setTypingUser]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        let typingTimeout: NodeJS.Timeout;

        const handleTyping = () => {
            if (!isTyping) {
                setIsTyping(true);
                console.log("typing user", chatUser);
                socket.emit("typing", chatUser);
            }
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                setIsTyping(false);
                socket.emit("stopTyping", chatUser);
            }, 1000);
        };

        const inputElement = document.querySelector("input[type='text']");
        inputElement?.addEventListener("input", handleTyping);

        return () => {
            clearTimeout(typingTimeout);
            inputElement?.removeEventListener("input", handleTyping);
        };
    }, [isTyping, chatUser, socket]);

    const parseMentions = (text: string) => {
        const mentionRegex = /@(\w+)/g;
        const parts = text.split(mentionRegex);
        return parts.map((part, index) =>
            index % 2 === 0 ? (
                part
            ) : (
                <span key={index} className="font-bold bg-blue-200 px-1 rounded">
                    @{part}
                </span>
            )
        );
    };

    const extractMentions = (text: string): string[] => {
        const mentionRegex = /@(\w+)/g;
        const mentions: string[] = [];
        let match;
        while ((match = mentionRegex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        return mentions;
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Chat User in handlesubmit:", chatUser);

        if (!message.trim() && !uploadedFile) return;

        const mentions = extractMentions(message);

        const payload: MessageType = {
            id: uuidv4(),
            message: message || null,
            name: chatUser?.name ?? "Unknown",
            created_at: new Date().toISOString(),
            group_id: group.id,
            parent_message_id: replyingTo?.id || null,
            mentions: mentions,
            file: uploadedFile?.url || null,
            file_type: uploadedFile?.type || null,
            file_size: uploadedFile?.size || null,
        };

        console.log("message", message);
        socket.emit("message", payload);
        setMessage("");
        setMessages([...messages, payload]);
        setReplyingTo(null);
        setUploadedFile(null);
    };

    const handleEdit = (messageId: string, newMessage: string) => {
        socket.emit("editMessage", {
            id: messageId,
            message: newMessage,
            name: chatUser?.name,
        });
    };

    const handleDelete = (messageId: string) => {
        socket.emit("deleteMessage", { id: messageId });
    };

    const handleReply = (message: MessageType) => {
        setReplyingTo(message);
    };

    const handleAddReaction = (messageId: string, emoji: string) => {
        socket.emit("addReaction", {
            message_id: messageId,
            emoji,
            user_name: chatUser?.name,
            user_id: chatUser?.user_id,
        });
    };

    const handleRemoveReaction = (messageId: string, emoji: string) => {
        socket.emit("removeReaction", {
            message_id: messageId,
            emoji,
            user_name: chatUser?.name,
        });
    };

    const renderFilePreview = (message: MessageType) => {
        if (!message.file) return null;

        const fileUrl = `${Env.BACKEND_URL}${message.file}`;

        if (message.file_type === "image") {
            return (
                <img
                    src={fileUrl}
                    alt="Uploaded file"
                    className="max-w-full rounded mt-2 cursor-pointer"
                    onClick={() => window.open(fileUrl, "_blank")}
                />
            );
        } else if (message.file_type === "video") {
            return (
                <video controls className="max-w-full rounded mt-2">
                    <source src={fileUrl} />
                </video>
            );
        } else {
            return (
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">View File</span>
                </a>
            );
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-b from-white/50 to-gray-50/50">
            {/* Header with Search */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <h2 className="font-bold text-gray-800">{group.title}</h2>
                <MessageSearch groupId={group.id} onMessageClick={scrollToMessage} />
            </div>

            {/* Messages Container */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto flex flex-col space-y-2 p-4">
                {messages.map((msg) => {
                    const isOwnMessage =
                        chatUser && msg.name.trim().toLowerCase() === chatUser.name.trim().toLowerCase();
                    const isDeleted = msg.deleted_at !== null;

                    return (
                        <div
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className={`max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm transition-all group relative ${isOwnMessage
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white self-end rounded-br-none"
                                    : "bg-white text-gray-800 self-start rounded-bl-none border border-gray-100"
                                } ${isDeleted ? "opacity-50" : ""}`}
                        >
                            {!isDeleted && (
                                <MessageActions
                                    message={msg}
                                    isOwnMessage={!!isOwnMessage}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onReply={handleReply}
                                />
                            )}

                            {msg.parent_message_id && (
                                <div className="text-xs opacity-70 mb-2 p-2 bg-black/10 rounded">
                                    Replying to a message
                                </div>
                            )}

                            <p className="font-medium">{msg.name}</p>

                            {isDeleted ? (
                                <p className="mt-1 italic">Message deleted</p>
                            ) : (
                                <>
                                    {msg.message && <p className="mt-1">{parseMentions(msg.message)}</p>}
                                    {renderFilePreview(msg)}
                                    <p className="text-xs opacity-70 mt-1 text-right">
                                        {formatTime(msg.created_at)}
                                        {msg.edited_at && " (edited)"}
                                    </p>
                                </>
                            )}

                            {!isDeleted && (
                                <MessageReactions
                                    message={msg}
                                    currentUserName={chatUser?.name || ""}
                                    onAddReaction={handleAddReaction}
                                    onRemoveReaction={handleRemoveReaction}
                                />
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUser.length > 0 && (
                <div className="px-4 py-1 text-sm text-gray-500 italic">{`${typingUser} is typing...`}</div>
            )}

            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-blue-600 font-medium">Replying to {replyingTo.name}</p>
                        <p className="text-sm text-gray-700 truncate">{replyingTo.message}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-blue-100 rounded">
                        <X className="w-4 h-4 text-blue-600" />
                    </button>
                </div>
            )}

            {/* File Preview */}
            {uploadedFile && (
                <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">File ready to send</span>
                    </div>
                    <button onClick={() => setUploadedFile(null)} className="p-1 hover:bg-gray-200 rounded">
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t flex gap-2 items-center">
                <FileUpload onFileUploaded={setUploadedFile} />
                <input
                    type="text"
                    placeholder="Type a message... (use @name to mention)"
                    value={message}
                    className="flex-1 p-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm text-gray-800"
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    disabled={!message.trim() && !uploadedFile}
                >
                    <SendIcon size={18} />
                </button>
            </form>
        </div>
    );
}
