import { CHATS_URL, CHAT_GROUP_ADMIN, REMOVE_MEMBER } from "@/lib/apiEndpoints";

export async function fetchChats(groupId: string) {
    const res = await fetch(`${CHATS_URL}/${groupId}`, {
        cache: "no-cache",
    });

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
    }
    const response = await res.json();
    if (response?.data) {
        return response?.data;
    }
    return [];
}

export async function makeAdmin(token: string, userId: string, groupId: string) {
    const res = await fetch(CHAT_GROUP_ADMIN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify({ user_id: userId, group_id: groupId }),
    });

    if (!res.ok) {
        throw new Error("Failed to update admin status");
    }

    return await res.json();
}

export async function removeUser(token: string, userId: string, groupId: string) {
    const res = await fetch(REMOVE_MEMBER, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        },
        body: JSON.stringify({ user_id: userId, group_id: groupId }),
    });

    if (!res.ok) {
        throw new Error("Failed to remove user");
    }

    return await res.json();
}
