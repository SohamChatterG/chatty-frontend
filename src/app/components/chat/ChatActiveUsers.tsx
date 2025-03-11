import React, { useEffect, useState, useMemo } from "react";
import { getSocket } from "@/lib/socket.config";

export default function ChatActiveUsers({
    group,
}: {
    group: ChatGroupType;
}) {
    const [activeUsers, setActiveUsers] = useState<Array<GroupChatUserType>>([]);

    let socket = useMemo(() => {
        const socket = getSocket();
        socket.auth = { room: group.id };
        return socket.connect();
    }, []);

    useEffect(() => {
        socket.on("userConnected", (user: GroupChatUserType) => {
            setActiveUsers((prev) => [...prev, user]);
        });

        socket.on("userDisconnected", (userId: string) => {
            setActiveUsers((prev) => prev.filter((user) => user.id !== userId));
        });

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="hidden md:block h-screen overflow-y-scroll w-1/5 bg-muted px-2">
            <h1 className="text-2xl font-extrabold py-4 ">Active Users</h1>
            {activeUsers.length > 0 ? (
                activeUsers.map((user, index) => (
                    <div key={index} className="bg-white rounded-md p-2 mt-2">
                        <p className="font-bold">{user.name}</p>
                        <p>
                            Joined: <span>{new Date(user.created_at).toDateString()}</span>
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No active users</p>
            )}
        </div>
    );
}
