import { CHAT_GROUP_URL, CHAT_GROUP_USERS_URL } from "@/lib/apiEndpoints";

export async function fetchChatGroups(token: string) {
    // token = token.split(' ')[1];
    console.log("token", token)
    const res = await fetch(CHAT_GROUP_URL, {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU29oYW0gQ2hhdHRvcGFkaHlheSIsImVtYWlsIjoic29oYW1jaGF0dG9wYWRoeWF5MjVAZ21haWwuY29tIiwiaWQiOjQsImlhdCI6MTc0MTQ0Njc5NSwiZXhwIjoxNzQxNTc2Mzk1fQ.pArNf3VfvF83lHIM2dYf3Wd6kOTiFYkCUl7yBHGFwj0",
        },
        next: {
            tags: ["dashboard"],
        },
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

export async function fetchChatGroup(id: string) {
    console.log("\nthe id is\n", id)
    // const res = await fetch(`${CHAT_GROUP_URL}/${id}`, {
    //     cache: "no-cache",
    // });
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
    console.log("response from fetchchatgrpusers", res)

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