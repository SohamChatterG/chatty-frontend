import React, { Fragment, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket.config";
import type { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useParams, useRouter } from "next/navigation";
import { SendIcon, X, Reply, FileIcon, ImageIcon, VideoIcon, Pin, Forward, Mic, Lock } from "lucide-react";
import { ChatGroupType, GroupChatUserType, MessageType, MessageReactionType, MessageReadType, PinnedMessageType } from "@/types";
import MessageReactions from "./MessageReactions";
import MessageActions from "./MessageActions";
import MessageSearch from "./MessageSearch";
import FileUpload from "./FileUpload";
import VoiceRecorder from "./VoiceRecorder";
import ReadReceipts from "./ReadReceipts";
import PinnedMessages from "./PinnedMessages";
import MentionInput, { renderMessageWithMentions } from "./MentionInput";
import { EncryptionSetup, EncryptionBadge, EncryptionStatus } from "./EncryptionSetup";
import { useEncryption } from "@/lib/useEncryption";
import Env from "@/lib/env";
import { CHAT_FORWARD } from "@/lib/apiEndpoints";
import { toast } from "sonner";
export default function Chats({
    group,
    oldMessages,
    chatUser,
    setActiveUsers,
    setTypingUser, // Change setTypingUser to settypingUser
    typingUser,
    users = [],
}: {
    group: ChatGroupType;
    oldMessages: Array<MessageType> | [];
    chatUser?: GroupChatUserType;
    setActiveUsers: React.Dispatch<React.SetStateAction<GroupChatUserType[]>>; // Add this prop
    setTypingUser: (userName: string) => void; // Change type
    typingUser: string,
    users?: GroupChatUserType[];
}) {
    const params = useParams();
    const router = useRouter();
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");
    const [mentions, setMentions] = useState<string[]>([]);
    const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
    const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
    const [fileData, setFileData] = useState<{ url: string; type: string; size: number } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
    const [isGroupEncrypted, setIsGroupEncrypted] = useState(group.is_encrypted || false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // E2E Encryption hook
    const {
        isReady: encryptionReady,
        encrypt,
        decrypt,
    } = useEncryption({
        userId: chatUser?.user_id,
        groupId: group.id,
        isGroupEncrypted,
    });

    // Check if current user is admin
    const isAdmin = useMemo(() => {
        if (!chatUser?.user_id) return false;
        const currentUser = users?.find(u => u.user_id === chatUser.user_id);
        return currentUser?.is_admin || currentUser?.is_owner || false;
    }, [chatUser, users]);

    const socket: Socket | null = useMemo(() => {
        console.log(`[${new Date().toISOString()}] Chats useMemo - Initializing socket connection...`);
        console.log(`[${new Date().toISOString()}] Chats useMemo - chatUser:`, chatUser);

        // Do not attempt to connect until we have a valid chat user
        if (!chatUser) {
            console.warn(`[${new Date().toISOString()}] Chat user not set yet, skipping socket connection`);
            return null;
        }

        console.log(`[${new Date().toISOString()}] Chats useMemo - Creating socket with user:`, chatUser);
        const instance = getSocket();
        instance.auth = {
            room: group.id,
            user: chatUser,
        };

        if (!instance.connected) {
            console.log(`[${new Date().toISOString()}] Chats useMemo - Connecting socket...`);
            instance.connect();
        }

        return instance;
    }, [group.id, chatUser]);

    // Decrypt message helper
    const decryptMessageIfNeeded = useCallback(async (msg: MessageType): Promise<MessageType> => {
        if (msg.is_encrypted && msg.message && encryptionReady) {
            try {
                const decrypted = await decrypt(msg.message);
                if (decrypted) {
                    return { ...msg, message: decrypted };
                }
            } catch (error) {
                console.error("Failed to decrypt message:", error);
            }
        }
        return msg;
    }, [decrypt, encryptionReady]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.on("message", async (data: MessageType) => {
            console.log("The message is", data);
            // Decrypt if needed
            const processedMessage = await decryptMessageIfNeeded(data);
            setMessages((prevMessages) => [...prevMessages, processedMessage]);
            scrollToBottom();
        });

        // Listen for message edits
        socket.on("messageEdited", async (updatedMessage: MessageType) => {
            const processedMessage = await decryptMessageIfNeeded(updatedMessage);
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === processedMessage.id ? processedMessage : msg
                )
            );
        });


        // Listen for message deletions
        socket.on("messageDeleted", ({ id }: { id: string }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === id ? { ...msg, message: null, deleted_at: new Date().toISOString() } : msg
                )
            );
        });

        // Listen for reactions
        socket.on("reactionAdded", (data: { message_id: string; emoji: string; user_name: string; user_id?: number }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg.id === data.message_id) {
                        const newReaction: MessageReactionType = {
                            id: Date.now(),
                            message_id: data.message_id,
                            user_name: data.user_name,
                            user_id: data.user_id,
                            emoji: data.emoji,
                            created_at: new Date().toISOString(),
                        };
                        return {
                            ...msg,
                            MessageReactions: [...(msg.MessageReactions || []), newReaction],
                        };
                    }
                    return msg;
                })
            );
        });

        socket.on("reactionRemoved", (data: { message_id: string; emoji: string; user_name: string }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg.id === data.message_id) {
                        return {
                            ...msg,
                            MessageReactions: (msg.MessageReactions || []).filter(
                                (r) => !(r.emoji === data.emoji && r.user_name === data.user_name)
                            ),
                        };
                    }
                    return msg;
                })
            );
        });

        socket.on("typing", (userName: string) => { // Update type to string
            console.log("typing.....", userName)
            if (userName) {
                setTypingUser(userName);
            } else {
                setTypingUser(""); // Clear the typingUser state
            }
        });

        socket.on("userJoined", (user: GroupChatUserType) => {
            console.log("User joined:", user);
            setActiveUsers((prevUsers) => {
                // Prevent duplicates - check both user_id and id
                const userId = user.user_id || user.id;
                if (prevUsers.some(u => (u.user_id || u.id) === userId)) {
                    return prevUsers;
                }
                return [...prevUsers, user];
            });
        });

        socket.on("userLeft", (userId: string) => {
            console.log("User left:", userId);
            setActiveUsers((prevUsers: GroupChatUserType[]) =>
                prevUsers.filter((user) => {
                    const userIdentifier = String(user.user_id || user.id);
                    return userIdentifier !== String(userId);
                })
            );
        });

        socket.on("activeUsers", (users: GroupChatUserType[]) => {
            console.log("Active users received:", users);
            // Deduplicate users before setting - prefer user_id, fallback to id
            const uniqueUsers = users.reduce((acc: GroupChatUserType[], user) => {
                const userId = user.user_id || user.id;
                const exists = acc.some(u => (u.user_id || u.id) === userId);
                if (!exists) {
                    acc.push(user);
                }
                return acc;
            }, []);
            setActiveUsers(uniqueUsers);
        });

        // Listen for online/offline status
        socket.on("userOnline", ({ userId }: { userId: string }) => {
            setOnlineUsers((prev) => new Set(prev).add(userId));
        });

        socket.on("userOffline", ({ userId }: { userId: string }) => {
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        // Listen for read receipts
        socket.on("messagesRead", (data: { messageIds: string[]; userId: string; userName: string; readAt: string }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (data.messageIds.includes(msg.id)) {
                        const newRead: MessageReadType = {
                            id: Date.now(),
                            message_id: msg.id,
                            user_id: parseInt(data.userId) || undefined,
                            user_name: data.userName,
                            read_at: data.readAt,
                        };
                        return {
                            ...msg,
                            MessageReads: [...(msg.MessageReads || []), newRead],
                        };
                    }
                    return msg;
                })
            );
        });

        // Listen for pinned messages
        socket.on("messagePinned", (pinnedMessage: PinnedMessageType) => {
            setPinnedMessageIds((prev) => new Set(prev).add(pinnedMessage.message_id));
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === pinnedMessage.message_id ? { ...msg, isPinned: true } : msg
                )
            );
        });

        socket.on("messageUnpinned", ({ messageId }: { messageId: string }) => {
            setPinnedMessageIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(messageId);
                return newSet;
            });
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === messageId ? { ...msg, isPinned: false } : msg
                )
            );
        });

        // Listen for forwarded messages
        socket.on("messageForwarded", (data: { originalMessageId: string; targetGroupId: string; newMessageId: string }) => {
            console.log("Message forwarded:", data);
        });

        // Listen for mentions
        socket.on("mentioned", (data: { messageId: string; groupId: string; senderName: string }) => {
            // Show notification for mentions
            if (Notification.permission === "granted") {
                new Notification(`${data.senderName} mentioned you`, {
                    body: "You were mentioned in a message",
                });
            }
        });

        // Listen for being kicked from the group
        socket.on("kicked", (data: { reason: string; groupId: string }) => {
            toast.error(data.reason || "You have been removed from this group");
            socket.disconnect();
            router.push("/dashboard");
        });

        // Listen for error events (e.g., muted, banned, not a member)
        socket.on("error", (data: { message: string }) => {
            toast.error(data.message);
        });

        // Listen for user removed events
        socket.on("userRemoved", (data: { userId: string; userName: string; reason?: string }) => {
            // Remove the user from active users list
            setActiveUsers(users.filter(u => String(u.user_id) !== data.userId));
            toast.info(`${data.userName} has been removed from the group`);
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
            socket.off("userOnline");
            socket.off("userOffline");
            socket.off("messagesRead");
            socket.off("messagePinned");
            socket.off("messageUnpinned");
            socket.off("messageForwarded");
            socket.off("mentioned");
            socket.off("kicked");
            socket.off("error");
            socket.off("userRemoved");
            socket.close();
        };

    }, [socket, setActiveUsers, setTypingUser, router, users]);
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    };
    useEffect(() => {
        let typingTimeout: NodeJS.Timeout;

        if (!socket || !chatUser) {
            return;
        }

        const handleTyping = () => {
            if (!isTyping) {
                setIsTyping(true);
                console.log("typing user", chatUser)
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
        }
    }, [isTyping, chatUser, socket]); // Include socket in the dependency array

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!socket) {
            console.warn("Socket not connected, cannot send message");
            return;
        }

        if (!chatUser) {
            console.warn("Chat user not set, cannot send message");
            return;
        }

        if (!message.trim() && !fileData) {
            return;
        }

        console.log("Chat User in handlesubmit:", chatUser);

        // Encrypt message if group is encrypted
        let messageContent = message || null;
        let isEncrypted = false;

        if (isGroupEncrypted && encryptionReady && messageContent) {
            const encrypted = await encrypt(messageContent);
            if (encrypted) {
                messageContent = encrypted;
                isEncrypted = true;
            } else {
                toast.error("Failed to encrypt message");
                return;
            }
        }

        const payload: MessageType = {
            id: uuidv4(),
            message: messageContent,
            name: chatUser?.name ?? "Unknown",
            user_id: chatUser?.user_id,
            created_at: new Date().toISOString(),
            group_id: group.id,
            parent_message_id: replyingTo?.id || null,
            file: fileData?.url || null,
            file_type: fileData?.type || null,
            file_size: fileData?.size || null,
            mentions: mentions.length > 0 ? mentions : undefined,
            is_encrypted: isEncrypted,
        };
        console.log("message", message)
        socket.emit("message", payload);

        // Emit mentions if any
        if (mentions.length > 0) {
            socket.emit("mentionUser", {
                mentionedUserIds: mentions,
                messageId: payload.id,
                senderName: chatUser?.name,
            });
        }

        // Store original message for local display
        const localPayload = { ...payload, message: message || null };
        setMessage("");
        setMentions([]);
        setMessages([...messages, localPayload]);
        setReplyingTo(null);
        setFileData(null);
    };

    // Handle message edit
    const handleEditMessage = (messageId: string, newMessage: string) => {
        if (!socket || !chatUser) return;
        socket.emit("editMessage", { id: messageId, message: newMessage, name: chatUser.name });
    };

    // Handle message delete
    const handleDeleteMessage = (messageId: string) => {
        if (!socket || !chatUser) return;
        socket.emit("deleteMessage", { id: messageId, name: chatUser.name });
    };

    // Handle reply
    const handleReply = (msg: MessageType) => {
        setReplyingTo(msg);
    };

    // Handle add reaction
    const handleAddReaction = (messageId: string, emoji: string) => {
        if (!socket || !chatUser) return;
        socket.emit("addReaction", {
            message_id: messageId,
            emoji,
            user_name: chatUser.name,
            user_id: chatUser.user_id,
        });
    };

    // Handle remove reaction
    const handleRemoveReaction = (messageId: string, emoji: string) => {
        if (!socket || !chatUser) return;
        socket.emit("removeReaction", {
            message_id: messageId,
            emoji,
            user_name: chatUser.name,
        });
    };

    // Handle file upload
    const handleFileUploaded = (data: { url: string; type: string; size: number }) => {
        setFileData(data);
    };

    // Handle voice message sent
    const handleVoiceSent = (voiceMessage: MessageType) => {
        if (!socket) return;
        socket.emit("message", voiceMessage);
        setMessages((prev) => [...prev, voiceMessage]);
    };

    // Handle message pin
    const handlePinMessage = (messageId: string) => {
        if (!socket || !chatUser) return;
        socket.emit("pinMessage", {
            messageId,
            userId: chatUser.user_id,
            userName: chatUser.name,
            groupId: group.id,
        });
    };

    // Handle message unpin
    const handleUnpinMessage = (messageId: string) => {
        if (!socket || !chatUser) return;
        socket.emit("unpinMessage", { messageId });
    };

    // Handle message forward
    const handleForwardMessage = async (messageId: string, targetGroupId: string) => {
        if (!chatUser) return;
        try {
            const response = await fetch(CHAT_FORWARD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalMessageId: messageId,
                    targetGroupId,
                    userId: chatUser.user_id,
                    userName: chatUser.name,
                }),
            });
            if (response.ok) {
                console.log("Message forwarded successfully");
            }
        } catch (error) {
            console.error("Error forwarding message:", error);
        }
    };

    // Handle marking messages as read
    const handleMarkAsRead = () => {
        if (!socket || !chatUser) return;
        const unreadMessageIds = messages
            .filter((msg) => msg.name !== chatUser.name && !msg.MessageReads?.some((r) => r.user_name === chatUser.name))
            .map((msg) => msg.id);

        if (unreadMessageIds.length > 0) {
            socket.emit("markAsRead", {
                messageIds: unreadMessageIds,
                userId: chatUser.user_id,
                userName: chatUser.name,
            });
        }
    };

    // Mark messages as read when viewing
    useEffect(() => {
        handleMarkAsRead();
    }, [messages.length]);

    // Handle mention input change
    const handleMentionChange = (value: string, newMentions: string[]) => {
        setMessage(value);
        setMentions(newMentions);
    };

    // Handle message search click - scroll to message
    const handleMessageClick = (messageId: string) => {
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-blue-400");
            setTimeout(() => {
                element.classList.remove("ring-2", "ring-blue-400");
            }, 2000);
        }
    };

    // Get parent message for replies
    const getParentMessage = (parentId: string | null | undefined) => {
        if (!parentId) return null;
        return messages.find((m) => m.id === parentId);
    };

    // Render file preview
    const renderFilePreview = (msg: MessageType) => {
        const fileSource = msg.file || msg.file_url;
        if (!fileSource) return null;
        const fileUrl = fileSource.startsWith("http") ? fileSource : `${Env.BACKEND_URL}${fileSource}`;

        // Voice message
        if (msg.file_type === "audio" || msg.file_type === "voice" || msg.duration) {
            return (
                <div className="mt-2 flex items-center gap-2">
                    <audio controls className="max-w-[200px] h-8">
                        <source src={fileUrl} />
                    </audio>
                    {msg.duration && (
                        <span className="text-xs opacity-70">
                            {Math.floor(msg.duration / 60)}:{(msg.duration % 60).toString().padStart(2, "0")}
                        </span>
                    )}
                </div>
            );
        }

        if (msg.file_type === "image") {
            return (
                <img
                    src={fileUrl}
                    alt="Uploaded file"
                    className="max-w-full max-h-48 rounded mt-2 cursor-pointer"
                    onClick={() => window.open(fileUrl, "_blank")}
                />
            );
        } else if (msg.file_type === "video") {
            return (
                <video controls className="max-w-full max-h-48 rounded mt-2">
                    <source src={fileUrl} />
                </video>
            );
        } else {
            return (
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 text-blue-600 hover:underline"
                >
                    <FileIcon className="w-4 h-4" />
                    {msg.file_name || "Download file"}
                </a>
            );
        }
    };


    return (
        <div className="flex flex-col h-[calc(100vh-64px)] p-2 sm:p-4 bg-gradient-to-b from-white/50 to-gray-50/50">
            {/* Encryption Status Banner */}
            {isGroupEncrypted && (
                <div className="mb-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
                        Messages are end-to-end encrypted
                    </span>
                </div>
            )}

            {/* Encryption Setup Button (for admins on non-encrypted groups) */}
            {!isGroupEncrypted && isAdmin && !group.is_public && (
                <div className="mb-2 flex justify-end">
                    <EncryptionSetup
                        userId={chatUser?.user_id}
                        groupId={group.id}
                        isGroupEncrypted={isGroupEncrypted}
                        isAdmin={isAdmin}
                        groupMembers={users || []}
                        onEncryptionEnabled={() => setIsGroupEncrypted(true)}
                    />
                </div>
            )}

            {/* Pinned Messages */}
            <PinnedMessages
                groupId={group.id}
                onScrollToMessage={handleMessageClick}
                onUnpin={handleUnpinMessage}
            />

            {/* Search Bar */}
            <div className="flex justify-end mb-2">
                <MessageSearch groupId={group.id} onMessageClick={handleMessageClick} />
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto flex flex-col space-y-2 p-1 sm:p-2">
                {messages.map((msg) => {
                    const isOwnMessage = chatUser && msg.name.trim().toLowerCase() === chatUser.name.trim().toLowerCase();

                    return (
                        <div
                            key={msg.id}
                            ref={(el) => { messageRefs.current[msg.id] = el; }}
                            className={`group relative max-w-[85%] sm:max-w-xs md:max-w-md rounded-2xl p-2 sm:p-3 shadow-sm transition-all ${msg.deleted_at
                                ? "bg-gray-100 text-gray-400 italic"
                                : isOwnMessage
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white self-end rounded-br-none"
                                    : "bg-white text-gray-800 self-start rounded-bl-none border border-gray-100"
                                }`}
                        >
                            {/* Pinned indicator */}
                            {msg.isPinned && (
                                <div className="absolute -top-2 -right-2">
                                    <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                                </div>
                            )}

                            {/* Forwarded indicator */}
                            {msg.forwarded_from && (
                                <div className="text-xs opacity-70 mb-1 flex items-center gap-1">
                                    <Forward className="w-3 h-3" />
                                    <span>Forwarded</span>
                                </div>
                            )}

                            {/* Reply indicator */}
                            {msg.parent_message_id && (
                                <div className="text-xs opacity-70 mb-1 p-1 bg-black/10 rounded flex items-center gap-1">
                                    <Reply className="w-3 h-3" />
                                    <span>
                                        Replying to {getParentMessage(msg.parent_message_id)?.name || "Unknown"}:
                                        {" "}
                                        {getParentMessage(msg.parent_message_id)?.message?.substring(0, 30)}
                                        {(getParentMessage(msg.parent_message_id)?.message?.length || 0) > 30 ? "..." : ""}
                                    </span>
                                </div>
                            )}

                            {/* Message actions (edit, delete, reply, pin, forward) */}
                            {!msg.deleted_at && chatUser && (
                                <div className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1">
                                    <MessageActions
                                        message={msg}
                                        isOwnMessage={!!isOwnMessage}
                                        onEdit={handleEditMessage}
                                        onDelete={handleDeleteMessage}
                                        onReply={handleReply}
                                    />
                                    {/* Pin button */}
                                    <button
                                        onClick={() => msg.isPinned ? handleUnpinMessage(msg.id) : handlePinMessage(msg.id)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                        title={msg.isPinned ? "Unpin" : "Pin"}
                                    >
                                        <Pin className={`w-4 h-4 ${msg.isPinned ? "text-amber-500 fill-amber-500" : "text-gray-500"}`} />
                                    </button>
                                </div>
                            )}

                            <p className="font-medium">{msg.name}</p>

                            {msg.deleted_at ? (
                                <p className="mt-1">This message was deleted</p>
                            ) : (
                                <>
                                    {msg.message && (
                                        <p className="mt-1">
                                            {renderMessageWithMentions(msg.message, chatUser?.name)}
                                        </p>
                                    )}
                                    {renderFilePreview(msg)}
                                </>
                            )}

                            <div className="flex items-center justify-end gap-1 mt-1">
                                <p className="text-xs opacity-70">
                                    {formatTime(msg.created_at)}
                                    {msg.edited_at && " (edited)"}
                                </p>
                                {/* Encryption indicator */}
                                {msg.is_encrypted && (
                                    <span title="Encrypted">
                                        <Lock className="w-3 h-3 text-green-500 opacity-70" />
                                    </span>
                                )}
                                {/* Read receipts */}
                                {isOwnMessage && (
                                    <ReadReceipts
                                        reads={msg.MessageReads}
                                        isOwnMessage={!!isOwnMessage}
                                        totalUsers={users.length}
                                    />
                                )}
                            </div>

                            {/* Reactions */}
                            {!msg.deleted_at && chatUser && (
                                <MessageReactions
                                    message={msg}
                                    currentUserName={chatUser.name}
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
                <div className="px-4 py-1 text-sm text-gray-500 italic">
                    {`${typingUser} is typing...`}
                </div>
            )}

            {/* Reply Preview */}
            {replyingTo && (
                <div className="mx-4 p-2 bg-gray-100 rounded-t-lg border-l-4 border-blue-500 flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-medium">Replying to {replyingTo.name}</span>
                        <p className="text-gray-600 truncate">{replyingTo.message}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* File Preview */}
            {fileData && (
                <div className="mx-4 p-2 bg-gray-100 rounded-t-lg flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                        <FileIcon className="w-4 h-4" />
                        <span>File ready to send</span>
                    </div>
                    <button onClick={() => setFileData(null)} className="p-1 hover:bg-gray-200 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mt-4 flex gap-1 sm:gap-2 items-center px-1 sm:px-0">
                <FileUpload onFileUploaded={handleFileUploaded} />
                <VoiceRecorder
                    groupId={group.id}
                    userName={chatUser?.name || "Unknown"}
                    userId={chatUser?.user_id}
                    onVoiceSent={handleVoiceSent}
                />
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    className="flex-1 min-w-0 p-2 sm:p-3 text-sm sm:text-base rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm"
                    onChange={(e) => {
                        setMessage(e.target.value);
                        // Extract mentions from the message
                        const mentionRegex = /@(\w+)/g;
                        const foundMentions: string[] = [];
                        let match;
                        while ((match = mentionRegex.exec(e.target.value)) !== null) {
                            const mentionedUser = users.find(
                                (u) => u.name.toLowerCase() === match![1].toLowerCase()
                            );
                            if (mentionedUser?.user_id) {
                                foundMentions.push(mentionedUser.user_id.toString());
                            }
                        }
                        setMentions(foundMentions);
                    }}
                />
                <button
                    type="submit"
                    className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all flex-shrink-0"
                >
                    <SendIcon size={18} />
                </button>
            </form>
        </div>
    );
}




