"use client";

import { Check, CheckCheck } from "lucide-react";
import { MessageReadType } from "@/types";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReadReceiptsProps {
    reads?: MessageReadType[];
    isOwnMessage: boolean;
    totalUsers?: number;
}

export default function ReadReceipts({
    reads = [],
    isOwnMessage,
    totalUsers = 0,
}: ReadReceiptsProps) {
    if (!isOwnMessage) return null;

    const readCount = reads.length;
    const isReadByAll = totalUsers > 0 && readCount >= totalUsers - 1; // -1 for sender
    const hasBeenRead = readCount > 0;

    const getReadNames = () => {
        if (reads.length === 0) return "Delivered";
        return `Read by: ${reads.map((r) => r.user_name).join(", ")}`;
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex ml-1">
                        {isReadByAll ? (
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                        ) : hasBeenRead ? (
                            <CheckCheck className="h-4 w-4 text-gray-400" />
                        ) : (
                            <Check className="h-4 w-4 text-gray-400" />
                        )}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{getReadNames()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
