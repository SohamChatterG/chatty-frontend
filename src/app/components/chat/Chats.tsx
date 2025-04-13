import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import ChatSidebar from "./ChatSidebar";
import { useParams } from "next/navigation";
import { toast } from "sonner";
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
        const socket = getSocket();
        socket.auth = {
            room: group.id,
            user: chatUser, // Send user data here

        };
        return socket.connect();
    }, [group.id, chatUser]);
    useEffect(() => {
        socket.on("message", (data: MessageType) => {
            console.log("The message is", data);
            setMessages((prevMessages) => [...prevMessages, data]);
            scrollToBottom();
        });
        socket.on("typing", (userName: string) => { // Update type to string
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
        socket.emit("message", payload);
        setMessage("");
        setMessages([...messages, payload]);
    };

    return (
        <div className="flex flex-col h-[94vh]  p-4">
            <div className="flex-1 overflow-y-auto flex flex-col-reverse">
                <div ref={messagesEndRef} />
                <div className="flex flex-col gap-2">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`max-w-sm rounded-lg p-2 ${chatUser && message.name.trim().toLowerCase() === chatUser.name.trim().toLowerCase()
                                ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white self-end"
                                : "bg-gradient-to-r from-gray-200 to-gray-300 text-black self-start"
                                }`}
                        >
                            {/* {("msg " + message.name + "chat " + chatUser?.name+ "\n")} */}
                            {message.message}
                        </div>
                    ))}
                </div>
            </div>
            <span></span>
            <span>{typingUser.length > 0 ? `${typingUser} is typing...` : null} </span>
            <form onSubmit={handleSubmit} className="mt-2 flex items-center">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setMessage(e.target.value)}
                />
            </form>
        </div>
    );
}


