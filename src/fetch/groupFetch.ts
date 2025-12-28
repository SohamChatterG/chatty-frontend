import { CHAT_GROUP_URL, CHAT_GROUP_USERS_URL, JOIN_REQUEST_URL, MEMBERSHIP_URL } from "@/lib/apiEndpoints";
import { JoinRequestType, MembershipStatusType } from "@/types";

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

// Check membership status for a group
export async function checkMembership(groupId: string, token: string): Promise<MembershipStatusType | null> {
    try {
        const res = await fetch(`${MEMBERSHIP_URL}/${groupId}`, {
            headers: {
                Authorization: token,
            },
            cache: "no-cache",
        });

        if (!res.ok) {
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error("Error checking membership:", error);
        return null;
    }
}

// Create join request for public group
export async function createJoinRequest(groupId: string, name: string, token: string): Promise<{ success: boolean; message: string; data?: JoinRequestType }> {
    try {
        const res = await fetch(JOIN_REQUEST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify({ group_id: groupId, name }),
        });

        const response = await res.json();
        return {
            success: res.ok,
            message: response.message,
            data: response.data
        };
    } catch (error) {
        console.error("Error creating join request:", error);
        return { success: false, message: "Failed to create join request" };
    }
}

// Get pending join requests for a group (admin only)
export async function fetchPendingJoinRequests(groupId: string, token: string): Promise<JoinRequestType[]> {
    try {
        const res = await fetch(`${JOIN_REQUEST_URL}/${groupId}`, {
            headers: {
                Authorization: token,
            },
            cache: "no-cache",
        });

        if (!res.ok) {
            return [];
        }
        const response = await res.json();
        return response.data || [];
    } catch (error) {
        console.error("Error fetching join requests:", error);
        return [];
    }
}

// Approve join request
export async function approveJoinRequest(requestId: number, token: string): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch(`${JOIN_REQUEST_URL}/${requestId}/approve`, {
            method: "POST",
            headers: {
                Authorization: token,
            },
        });

        const response = await res.json();
        return { success: res.ok, message: response.message };
    } catch (error) {
        console.error("Error approving join request:", error);
        return { success: false, message: "Failed to approve request" };
    }
}

// Reject join request
export async function rejectJoinRequest(requestId: number, token: string): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch(`${JOIN_REQUEST_URL}/${requestId}/reject`, {
            method: "POST",
            headers: {
                Authorization: token,
            },
        });

        const response = await res.json();
        return { success: res.ok, message: response.message };
    } catch (error) {
        console.error("Error rejecting join request:", error);
        return { success: false, message: "Failed to reject request" };
    }
}

// Check join request status
export async function checkJoinRequestStatus(groupId: string, token: string): Promise<{ status: string | null; data?: JoinRequestType }> {
    try {
        const res = await fetch(`${JOIN_REQUEST_URL}/${groupId}/status`, {
            headers: {
                Authorization: token,
            },
            cache: "no-cache",
        });

        if (!res.ok) {
            return { status: null };
        }
        const response = await res.json();
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Error checking join request status:", error);
        return { status: null };
    }
}