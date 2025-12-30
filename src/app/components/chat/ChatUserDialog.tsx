"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { CHAT_GROUP_USERS_URL } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { fetchChatGroupUsers } from "@/fetch/groupFetch";
import { ChatGroupType, GroupChatUserType } from "@/types";
export default function ChatUserDialog({
    open,
    setOpen,
    group,
    user,
    users,
    setUsers,
    setChatUser
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    group: ChatGroupType;
    user?: CustomUser;
    users: Array<GroupChatUserType>;
    setUsers: Dispatch<SetStateAction<Array<GroupChatUserType>>>;
    setChatUser: Dispatch<SetStateAction<GroupChatUserType | undefined>>;
}) {
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState({
        name: "",
        passcode: "",
    });

    useEffect(() => {
        const groupId = params["id"] as string;
        console.log(`[${new Date().toISOString()}] ChatUserDialog useEffect - checking localStorage for group: ${groupId}`);
        const data = localStorage.getItem(groupId);
        console.log(`[${new Date().toISOString()}] ChatUserDialog localStorage data:`, data);
        if (data && data !== "undefined" && data !== null) {
            try {
                const jsonData = JSON.parse(data);
                console.log(`[${new Date().toISOString()}] ChatUserDialog parsed JSON:`, jsonData);

                if (jsonData?.name && jsonData?.group_id) {
                    console.log(`[${new Date().toISOString()}] ChatUserDialog setting chatUser from localStorage:`, jsonData);
                    setChatUser(jsonData as GroupChatUserType);
                    setOpen(false);
                } else {
                    console.log(`[${new Date().toISOString()}] ChatUserDialog - data missing name or group_id`);
                }
            } catch (error) {
                console.error(`[${new Date().toISOString()}] ChatUserDialog Error parsing JSON:`, error);
            }
        } else {
            console.log(`[${new Date().toISOString()}] ChatUserDialog - no data in localStorage for this group`);
        }
    }, [params, setChatUser, setOpen]);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - starting`);
        console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - user:`, user);
        console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - state:`, state);

        const groupId = params["id"] as string;
        let localData = localStorage.getItem(groupId);
        console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - localData:`, localData);

        let groupUser: GroupChatUserType | null = null;

        // Try to parse existing localStorage data
        if (localData && localData !== "undefined") {
            try {
                groupUser = JSON.parse(localData) as GroupChatUserType;
                console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - found existing groupUser:`, groupUser);
            } catch (e) {
                console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - failed to parse localStorage`);
                groupUser = null;
            }
        }

        // Create new group user if none exists
        if (!groupUser || !groupUser.name || !groupUser.group_id) {
            console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - creating new group user`);
            try {
                const { data } = await axios.post(
                    CHAT_GROUP_USERS_URL,
                    {
                        name: state.name,
                        group_id: groupId,
                        user_id: user?.id,
                    },
                    {
                        headers: {
                            Authorization: `${user?.token}`,
                        },
                    }
                );
                console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - API response:`, data);

                groupUser = data?.data as GroupChatUserType;
                localStorage.setItem(groupId, JSON.stringify(groupUser));
                console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - saved to localStorage`);
            } catch (error) {
                console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - error:`, error);
                toast.error("Something went wrong. Please try again!");
                setLoading(false);
                return;
            }
        }

        // Check passcode for private groups
        if (group?.passcode && group?.passcode !== state.passcode) {
            toast.error("Please enter correct passcode!");
            setLoading(false);
            return;
        }

        // Set the chat user and close dialog
        if (groupUser) {
            console.log(`[${new Date().toISOString()}] ChatUserDialog handleSubmit - setting chatUser:`, groupUser);
            setChatUser(groupUser);
        }

        setOpen(false);

        try {
            const updatedUsers = await fetchChatGroupUsers(group.id);
            setUsers(updatedUsers);
            toast.success("Successfully joined the group!");
        } catch (error) {
            console.error("Error fetching group users:", error);
            toast.error("Failed to update group users. Please try again!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Name and {group.is_public ? "Join Room" : "Passcode"}</DialogTitle>
                    <DialogDescription>
                        Add your name and {group.is_public ? "join the room" : "passcode to join the room"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="mt-2">
                        <Input
                            placeholder="Enter your name"
                            value={state.name}
                            onChange={(e) => setState({ ...state, name: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                    {!group.is_public && (
                        <div className="mt-2">
                            <Input
                                placeholder="Enter your passcode"
                                value={state.passcode}
                                onChange={(e) => setState({ ...state, passcode: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div className="mt-2">
                        <Button className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}