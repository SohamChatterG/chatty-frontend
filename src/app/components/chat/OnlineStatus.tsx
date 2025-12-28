"use client";

import { cn } from "@/lib/utils";

interface OnlineStatusProps {
    isOnline: boolean;
    lastSeen?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function OnlineStatus({
    isOnline,
    lastSeen,
    showText = false,
    size = "sm",
}: OnlineStatusProps) {
    const sizeClasses = {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
    };

    const formatLastSeen = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-center gap-1.5">
            <span
                className={cn(
                    "rounded-full",
                    sizeClasses[size],
                    isOnline
                        ? "bg-green-500"
                        : "bg-gray-400"
                )}
            />
            {showText && (
                <span className="text-xs text-gray-500">
                    {isOnline
                        ? "Online"
                        : lastSeen
                            ? `Last seen ${formatLastSeen(lastSeen)}`
                            : "Offline"}
                </span>
            )}
        </div>
    );
}
