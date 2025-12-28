"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Lock, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { ChatGroupType, MembershipStatusType } from "@/types";
import { checkMembership, createJoinRequest, checkJoinRequestStatus } from "@/fetch/groupFetch";
import { CHAT_GROUP_USERS_URL } from "@/lib/apiEndpoints";
import axios from "axios";

interface GroupAccessGateProps {
    group: ChatGroupType;
    token: string;
    userId?: number;
    children: React.ReactNode;
}

export default function GroupAccessGate({ group, token, userId, children }: GroupAccessGateProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [membership, setMembership] = useState<MembershipStatusType | null>(null);
    const [requestStatus, setRequestStatus] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            setLoading(true);

            // Check membership status first
            const membershipData = await checkMembership(group.id, token);
            setMembership(membershipData);

            // If user is a member, ensure their data is in localStorage
            if (membershipData?.isMember || membershipData?.isOwner) {
                // Check if localStorage already has valid data
                const localData = localStorage.getItem(group.id);
                let hasValidLocalData = false;

                if (localData && localData !== "undefined") {
                    try {
                        const parsedData = JSON.parse(localData);
                        if (parsedData?.name && parsedData?.group_id) {
                            hasValidLocalData = true;
                        }
                    } catch (e) {
                        console.error("Error parsing localStorage:", e);
                    }
                }

                // If no valid local data but user is a member, store the member data
                if (!hasValidLocalData && membershipData.member) {
                    console.log("Storing member data in localStorage:", membershipData.member);
                    localStorage.setItem(group.id, JSON.stringify(membershipData.member));
                }

                setLoading(false);
                return;
            }

            // If not a member and it's a public group, check for pending requests
            if (!membershipData?.isMember && !membershipData?.isOwner && group.is_public) {
                const { status } = await checkJoinRequestStatus(group.id, token);
                setRequestStatus(status);
            }

            setLoading(false);
        };

        if (token) {
            checkAccess();
        }
    }, [group.id, token]);

    const handlePrivateJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        if (group.passcode && group.passcode !== passcode) {
            toast.error("Incorrect passcode");
            return;
        }

        setSubmitting(true);
        try {
            // Create group user directly for private groups with correct passcode
            const { data } = await axios.post(
                CHAT_GROUP_USERS_URL,
                {
                    name: name.trim(),
                    group_id: group.id,
                    user_id: userId,
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            localStorage.setItem(group.id, JSON.stringify(data.data));
            toast.success("Successfully joined the group!");
            window.location.reload();
        } catch (error) {
            console.error("Error joining group:", error);
            toast.error("Failed to join group. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePublicJoinRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createJoinRequest(group.id, name.trim(), token);

            if (result.success) {
                toast.success(result.message);
                setRequestStatus("pending");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error creating join request:", error);
            toast.error("Failed to send join request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Checking access...</p>
                </div>
            </div>
        );
    }

    // User has access - render children
    if (membership?.isMember || membership?.isOwner) {
        return <>{children}</>;
    }

    // User does not have access - show join form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Group Info */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {group.title.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{group.title}</h1>
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                        {group.is_public ? (
                            <>
                                <Users className="w-4 h-4" />
                                <span>Public Group</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                <span>Private Group</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Pending Request Status */}
                {requestStatus === "pending" && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <div>
                                <p className="font-medium text-yellow-800">Request Pending</p>
                                <p className="text-sm text-yellow-600">
                                    Your join request is waiting for admin approval.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => router.push("/dashboard")}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                )}

                {requestStatus === "rejected" && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-800">Request Rejected</p>
                                <p className="text-sm text-red-600">
                                    Your join request was rejected by an admin.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => router.push("/dashboard")}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                )}

                {/* Join Form - Only show if no pending/rejected request */}
                {requestStatus !== "pending" && requestStatus !== "rejected" && (
                    <form onSubmit={group.is_public ? handlePublicJoinRequest : handlePrivateJoin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name
                                </label>
                                <Input
                                    placeholder="Enter your display name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {!group.is_public && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Passcode
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Enter group passcode"
                                        value={passcode}
                                        onChange={(e) => setPasscode(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {group.is_public ? "Sending Request..." : "Joining..."}
                                    </>
                                ) : (
                                    group.is_public ? "Request to Join" : "Join Group"
                                )}
                            </Button>
                        </div>

                        {group.is_public && (
                            <p className="mt-4 text-sm text-center text-gray-500">
                                Public groups require admin approval to join.
                            </p>
                        )}
                    </form>
                )}

                {/* Back Button */}
                {(requestStatus !== "pending" && requestStatus !== "rejected") && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                            variant="ghost"
                            className="w-full text-gray-600"
                            onClick={() => router.push("/dashboard")}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
