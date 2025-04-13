import { CHAT_GROUP_URL, CHAT_GROUP_USERS_URL } from "@/lib/apiEndpoints";

export async function fetchChatGroups(token: string) {
    // token = token.split(' ')[1];
    console.log("token", token)
    if (!token) {
        console.error("No token provided");
        return [];
    }
    const res = await fetch(CHAT_GROUP_URL, {
        headers: {
            Authorization: token,
        },
        // next: {
        //     tags: ["dashboard"],
        // },
    });

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
    }
    const response = await res.json();
    console.log("response from fetchGroups", response)
    if (response?.data) {
        return response?.data;
    }
    return [];
}

export async function fetchChatGroup(id: string) {
    
    const res = await fetch(`${CHAT_GROUP_URL}/${id}`, {
        cache: "no-cache",
    });


    if (!res.ok) {
        throw new Error("Failed to fetch data");
    }
    console.log(res)
    const response = await res.json();
    if (response?.data) {
        return response?.data;
    }
    return null;
}

export async function fetchChatGroupUsers(id: string) {
    const res = await fetch(`${CHAT_GROUP_USERS_URL}?group_id=${id}`, {
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

