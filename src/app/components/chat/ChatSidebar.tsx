import React from "react";

export default function ChatSidebar({
    users,
    activeUsers, // Add activeUsers prop

}: {
    users: Array<GroupChatUserType> | [];
    activeUsers: Array<GroupChatUserType> | []; // Add activeUsers type

}) {
    return (
        <div className=" md:block h-screen overflow-y-scroll w-1/5 bg-muted px-2">
            <div className="mb-4"> {/* Add a container for All Users */}
                hi
                <h1 className="text-2xl font-extrabold py-4 ">Users</h1>
                {users?.length > 0 &&
                    users.map((item, index) => (
                        <div key={index} className="bg-white rounded-md p-2 mt-2">
                            <p className="font-bold"> {item.name}</p>
                            <p>
                                Joined : <span>{new Date(item.created_at).toDateString()}</span>
                            </p>
                        </div>
                    ))}
            </div>

            <div> {/* Add a container for Active Users */}
                <h1 className="text-2xl font-extrabold py-4 ">Active Users</h1>
                {activeUsers?.length > 0 ? (
                    activeUsers.map((user, index) => (
                        <div key={index} className="bg-white rounded-md p-2 mt-2">
                            <p className="font-bold"> {user.name}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No active users</p>
                )}
            </div>
        </div>

    );
}