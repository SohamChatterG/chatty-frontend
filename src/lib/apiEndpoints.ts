import Env from "./env"
export const BASE_URL = Env.BACKEND_URL;
export const API_URL = BASE_URL + "/api"
export const LOGIN_URL = API_URL + "/auth/login"
export const CHAT_GROUP_URL = API_URL + "/chat-group"
export const CHAT_GROUP_USERS_URL = API_URL + "/chat-group-users"
export const CHATS_URL = API_URL + "/chats"
export const CHAT_GROUP_ADMIN = API_URL + "/chat-group-users/make-admin"
export const REMOVE_MEMBER = API_URL + "/chat-group-users/remove-user"

// New feature endpoints
export const CHAT_FILE_UPLOAD = API_URL + "/chats/upload"
export const CHAT_VOICE_UPLOAD = API_URL + "/chats/voice"
export const CHAT_MARK_READ = API_URL + "/chats/read"
export const CHAT_FORWARD = API_URL + "/chats/forward"
export const CHAT_PINNED = API_URL + "/chats/pinned"
export const USER_STATUS = API_URL + "/auth/status"
export const GROUP_MEMBERS = API_URL + "/group-users"

// Join request endpoints
export const JOIN_REQUEST_URL = API_URL + "/join-requests"
export const MEMBERSHIP_URL = API_URL + "/membership"

// E2E Encryption endpoints
export const ENCRYPTION_URL = API_URL + "/encryption"
export const PUBLIC_KEY_URL = ENCRYPTION_URL + "/public-key"
export const GROUP_KEY_URL = ENCRYPTION_URL + "/group-key"
export const ENABLE_ENCRYPTION_URL = ENCRYPTION_URL + "/enable-group"
export const ROTATE_KEY_URL = ENCRYPTION_URL + "/rotate-key"