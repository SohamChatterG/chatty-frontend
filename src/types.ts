export type ChatGroupType = {
    id: string;
    user_id: number;
    title: string;
    passcode?: string;
    created_at: string;
    is_public: boolean;
    is_encrypted?: boolean;
};

export type GroupChatUserType = {
    id: number;
    name: string;
    group_id: string;
    created_at: string;
    is_admin: boolean;
    is_owner?: boolean;
    is_muted?: boolean;
    is_banned?: boolean;
    user_id?: number;
    user?: {
        id: number;
        name: string;
        email?: string;
        image?: string;
        is_online?: boolean;
        last_seen?: string;
    };
};

export type MessageReactionType = {
    id: number;
    message_id: string;
    user_name: string;
    user_id?: number;
    emoji: string;
    created_at: string;
};

export type MessageReadType = {
    id: number;
    message_id: string;
    user_id?: number;
    user_name: string;
    read_at: string;
};

export type PinnedMessageType = {
    id: number;
    message_id: string;
    group_id: string;
    pinned_by_id?: number;
    pinned_by_name: string;
    pinned_at: string;
    message?: MessageType;
};

export type MessageType = {
    id: string;
    message: string | null;
    group_id: string;
    name: string;
    user_id?: number;
    created_at: string;
    file?: string | null;  // Cloudinary URL
    file_url?: string | null; // Alias for file (backward compat)
    file_type?: string | null;
    file_name?: string | null;
    file_size?: number | null;
    file_public_id?: string | null;
    duration?: number | null; // for voice messages
    edited_at?: string | null;
    deleted_at?: string | null;
    parent_message_id?: string | null;
    forwarded_from?: string | null;
    mentions?: string[];
    MessageReactions?: MessageReactionType[];
    MessageReads?: MessageReadType[];
    isPinned?: boolean;
    is_encrypted?: boolean; // E2E encrypted message flag
};

export type OnlineUserType = {
    userId: string;
    name: string;
    isOnline: boolean;
    lastSeen?: string;
};

export type JoinRequestType = {
    id: number;
    group_id: string;
    user_id?: number;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email?: string;
        image?: string;
    };
};

export type MembershipStatusType = {
    isMember: boolean;
    isOwner: boolean;
    isAdmin: boolean;
    group: {
        id: string;
        title: string;
        is_public: boolean;
        has_passcode: boolean;
    };
    member?: GroupChatUserType;
};