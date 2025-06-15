import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import ChatSidebar from "./ChatSidebar";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { SendIcon } from "lucide-react";
export default function Chats({
    group,
    oldMessages,
    chatUser,
    setActiveUsers, // Add this prop
    setTypingUser, // Change setTypingUser to settypingUser
    typingUser,
}: {
    group: ChatGroupType;
    oldMessages: Array<MessageType> | [];
    chatUser?: GroupChatUserType;
    setActiveUsers: (users: GroupChatUserType[]) => void; // Add this prop
    setTypingUser: (userName: string) => void; // Change type
    typingUser: string,
}) {
    const params = useParams();

    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    let socket = useMemo(() => {
        console.log('Initializing socket connection...');

        const socket = getSocket();
        socket.auth = {
            room: group.id,
            user: chatUser, // Send user data here

        };
        console.log("socket.connect", socket.connect())
        return socket.connect();
    }, [group.id, chatUser]);
    useEffect(() => {
        socket.on("message", (data: MessageType) => {
            console.log("The message is", data);
            setMessages((prevMessages) => [...prevMessages, data]);
            scrollToBottom();
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
            //@ts-ignore
            setActiveUsers((prevUsers) => [...prevUsers, user]);
        });

        socket.on("userLeft", (userId: string) => {
            //@ts-ignore
            setActiveUsers((prevUsers: GroupChatUserType[]) => prevUsers.filter((user) => user.id !== userId)); // Explicitly type prevUsers
        });

        socket.on("activeUsers", (users: GroupChatUserType[]) => {
            setActiveUsers(users);
        });


        socket.emit("getUsers");
        return () => {
            socket.off("message");
            socket.off("userJoined");
            socket.off("userLeft");
            socket.off("activeUsers");
            socket.close();
        };

    }, [socket, setActiveUsers, setTypingUser]);
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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Chat User in handlesubmit:", chatUser);

        const payload: MessageType = {
            id: uuidv4(),
            message: message,
            name: chatUser?.name ?? "Unknown",
            created_at: new Date().toISOString(),
            group_id: group.id,
        };
        console.log("message", message)
        socket.emit("message", payload);
        setMessage("");
        setMessages([...messages, payload]);
    };


    return (
        <div className="flex flex-col h-[calc(100vh-64px)] p-4 bg-gradient-to-b from-white/50 to-gray-50/50">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto flex flex-col space-y-2 p-2">
                <div ref={messagesEndRef} />
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm ${chatUser && message.name.trim().toLowerCase() === chatUser.name.trim().toLowerCase()
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white self-end rounded-br-none"
                            : "bg-white text-gray-800 self-start rounded-bl-none border border-gray-100"
                            }`}
                    >
                        <p className="font-medium">{message.name}</p>
                        <p className="mt-1">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                            {formatTime(message.created_at)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Typing Indicator */}
            {typingUser.length > 0 && (
                <div className="px-4 py-1 text-sm text-gray-500 italic">
                    {`${typingUser} is typing...`}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    className="flex-1 p-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm"
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button
                    type="submit"
                    className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                    onClick={handleSubmit}
                >
                    <SendIcon size={18} /> {/* Replace with your icon */}
                </button>
            </form>
        </div>
    );
}




