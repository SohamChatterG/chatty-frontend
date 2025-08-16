export type ChatGroupType = {
    id: string,
    user_id: number,
    title: string,
    passcode?: string,
    created_at: string,
    is_public: boolean,
}

export type GroupChatUserType = {
    id: number,
    name: string,
    group_id: string,
    created_at: string,
    is_admin: boolean,
    user_id?: number
}

export type MessageType = {
    id: string;
    message: string;
    group_id: string;
    name: string;
    created_at: string;
};