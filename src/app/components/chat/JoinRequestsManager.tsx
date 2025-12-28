"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    UserPlus,
    Check,
    X,
    Loader2,
    Bell,
    Clock
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { JoinRequestType } from "@/types";
import {
    fetchPendingJoinRequests,
    approveJoinRequest,
    rejectJoinRequest
} from "@/fetch/groupFetch";

interface JoinRequestsManagerProps {
    groupId: string;
    token: string;
    isAdmin: boolean;
}

export default function JoinRequestsManager({ groupId, token, isAdmin }: JoinRequestsManagerProps) {
    const [requests, setRequests] = useState<JoinRequestType[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    const loadRequests = async () => {
        if (!isAdmin) return;

        setLoading(true);
        try {
            const data = await fetchPendingJoinRequests(groupId, token);
            setRequests(data);
        } catch (error) {
            console.error("Error loading requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && isAdmin) {
            loadRequests();
        }
    }, [open, isAdmin, groupId]);

    const handleApprove = async (requestId: number) => {
        setProcessingId(requestId);
        try {
            const result = await approveJoinRequest(requestId, token);
            if (result.success) {
                toast.success("User approved and added to group");
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to approve request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: number) => {
        setProcessingId(requestId);
        try {
            const result = await rejectJoinRequest(requestId, token);
            if (result.success) {
                toast.success("Request rejected");
                setRequests(prev => prev.filter(r => r.id !== requestId));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to reject request");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="relative p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Join Requests"
                >
                    <UserPlus className="w-5 h-5" />
                    {requests.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {requests.length}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96 max-w-full">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" />
                        Join Requests
                    </SheetTitle>
                </SheetHeader>

                <div className="py-4 space-y-4 h-[calc(100vh-120px)] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-gray-50 rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                        {request.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {request.name}
                                        </p>
                                        {request.user?.email && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {request.user.email}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(request.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-500 hover:bg-green-600"
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processingId === request.id}
                                    >
                                        {processingId === request.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleReject(request.id)}
                                        disabled={processingId === request.id}
                                    >
                                        {processingId === request.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={loadRequests}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Refresh
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
