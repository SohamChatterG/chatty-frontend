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
import axios from "axios";
import { CHAT_GROUP_USERS_URL } from "@/lib/apiEndpoints";
import { toast } from "sonner";

export default function ChatUserDialog({
    open,
    setOpen,
    group,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    group: ChatGroupType;
}) {
    const params = useParams();
    const [state, setState] = useState({
        name: "",
        passcode: "",
    });

    useEffect(() => {
        const data = localStorage.getItem(params["id"] as string);
        if (data && data !== "undefined" && data !== null) {
            try {
                const jsonData = JSON.parse(data);
                if (jsonData?.name && jsonData?.group_id) {
                    setOpen(false);
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const localData = localStorage.getItem(params["id"] as string);
        if (!localData) {
            try {
                const { data } = await axios.post(CHAT_GROUP_USERS_URL, {
                    name: state.name,
                    group_id: params["id"] as string,
                });
                localStorage.setItem(
                    params["id"] as string,
                    JSON.stringify(data?.data)
                );
            } catch (error) {
                toast.error("Something went wrong.please try again!");
            }
        }
        if (group?.passcode && group?.passcode !== state.passcode) {
            toast.error("Please enter correct passcode!");
        } else {
            setOpen(false);
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
                        />
                    </div>
                    {!group.is_public && (
                        <div className="mt-2">
                            <Input
                                placeholder="Enter your passcode"
                                value={state.passcode}
                                onChange={(e) => setState({ ...state, passcode: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="mt-2">
                        <Button className="w-full">Submit</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}