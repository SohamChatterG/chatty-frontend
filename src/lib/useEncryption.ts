"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    generateKeyPair,
    savePrivateKey,
    loadPrivateKey,
    hasEncryptionKeys,
    generateGroupKey,
    exportGroupKey,
    encryptGroupKeyForUser,
    decryptGroupKey,
    encryptMessage,
    decryptMessage,
    cacheGroupKey,
    getCachedGroupKey,
    isE2ESupported,
} from "@/lib/encryption";
import {
    PUBLIC_KEY_URL,
    GROUP_KEY_URL,
    ENABLE_ENCRYPTION_URL,
    ENCRYPTION_URL,
} from "@/lib/apiEndpoints";

interface UseEncryptionProps {
    userId?: number;
    groupId?: string;
    isGroupEncrypted?: boolean;
}

interface EncryptionState {
    isSupported: boolean;
    hasKeys: boolean;
    isGroupEncrypted: boolean;
    isReady: boolean;
    isSettingUp: boolean;
    error: string | null;
}

export function useEncryption({ userId, groupId, isGroupEncrypted = false }: UseEncryptionProps) {
    const [state, setState] = useState<EncryptionState>({
        isSupported: false,
        hasKeys: false,
        isGroupEncrypted: isGroupEncrypted,
        isReady: false,
        isSettingUp: false,
        error: null,
    });

    const privateKeyRef = useRef<CryptoKey | null>(null);
    const groupKeyRef = useRef<CryptoKey | null>(null);

    // Initialize and check for existing keys
    useEffect(() => {
        const init = async () => {
            if (!userId) return;

            const supported = isE2ESupported();
            setState(prev => ({ ...prev, isSupported: supported }));

            if (!supported) {
                setState(prev => ({ ...prev, error: "E2E encryption not supported in this browser" }));
                return;
            }

            try {
                const hasKeys = await hasEncryptionKeys(userId);
                setState(prev => ({ ...prev, hasKeys }));

                if (hasKeys) {
                    privateKeyRef.current = await loadPrivateKey(userId);
                }
            } catch (error) {
                console.error("Error checking encryption keys:", error);
            }
        };

        init();
    }, [userId]);

    // Load group key if group is encrypted
    useEffect(() => {
        const loadGroupKey = async () => {
            if (!groupId || !isGroupEncrypted || !privateKeyRef.current || !userId) return;

            try {
                // Check for cached key first
                const cachedKey = await getCachedGroupKey(groupId);
                if (cachedKey) {
                    groupKeyRef.current = cachedKey;
                    setState(prev => ({ ...prev, isReady: true }));
                    return;
                }

                // Fetch encrypted key from server
                const response = await fetch(`${GROUP_KEY_URL}/${groupId}/${userId}`);
                const data = await response.json();

                if (!data.success || !data.data.encrypted_key) {
                    setState(prev => ({ ...prev, error: "No encryption key found for this group" }));
                    return;
                }

                // Decrypt the group key
                const groupKey = await decryptGroupKey(
                    data.data.encrypted_key,
                    data.data.creator_public_key,
                    privateKeyRef.current
                );

                // Cache for future use
                await cacheGroupKey(groupId, groupKey);
                groupKeyRef.current = groupKey;
                setState(prev => ({ ...prev, isReady: true }));
            } catch (error) {
                console.error("Error loading group key:", error);
                setState(prev => ({ ...prev, error: "Failed to load encryption key" }));
            }
        };

        loadGroupKey();
    }, [groupId, isGroupEncrypted, userId]);

    // Setup user encryption keys
    const setupUserKeys = useCallback(async (): Promise<boolean> => {
        if (!userId) return false;

        setState(prev => ({ ...prev, isSettingUp: true, error: null }));

        try {
            // Generate key pair
            const { publicKey, privateKey } = await generateKeyPair();

            // Save private key locally
            await savePrivateKey(userId, privateKey);
            privateKeyRef.current = privateKey;

            // Upload public key to server
            const response = await fetch(PUBLIC_KEY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, public_key: publicKey }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || "Failed to store public key");
            }

            setState(prev => ({ ...prev, hasKeys: true, isSettingUp: false }));
            return true;
        } catch (error) {
            console.error("Error setting up encryption keys:", error);
            setState(prev => ({
                ...prev,
                isSettingUp: false,
                error: error instanceof Error ? error.message : "Failed to setup encryption",
            }));
            return false;
        }
    }, [userId]);

    // Enable encryption for a group (admin only)
    const enableGroupEncryption = useCallback(async (
        groupMembers: Array<{ user_id: number }>
    ): Promise<boolean> => {
        if (!userId || !groupId || !privateKeyRef.current) return false;

        setState(prev => ({ ...prev, isSettingUp: true, error: null }));

        try {
            // Generate group symmetric key
            const groupKey = await generateGroupKey();

            // Get public keys for all members
            const memberIds = groupMembers.map(m => m.user_id).filter(id => id);
            const publicKeysResponse = await fetch(`${ENCRYPTION_URL}/public-keys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_ids: memberIds }),
            });

            const publicKeysData = await publicKeysResponse.json();
            if (!publicKeysData.success) {
                throw new Error("Failed to fetch member public keys");
            }

            // Check if all members have keys
            const membersWithKeys = publicKeysData.data;
            if (membersWithKeys.length < memberIds.length) {
                const missingCount = memberIds.length - membersWithKeys.length;
                throw new Error(`${missingCount} members haven't set up encryption yet`);
            }

            // Encrypt group key for each member
            const encryptedKeys = await Promise.all(
                membersWithKeys.map(async (member: { user_id: number; public_key: string }) => ({
                    user_id: member.user_id,
                    encrypted_key: await encryptGroupKeyForUser(
                        groupKey,
                        member.public_key,
                        privateKeyRef.current!
                    ),
                }))
            );

            // Store encrypted keys on server
            const storeKeysResponse = await fetch(`${ENCRYPTION_URL}/group-keys-batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: groupId, keys: encryptedKeys }),
            });

            if (!storeKeysResponse.ok) {
                throw new Error("Failed to store encrypted keys");
            }

            // Enable encryption on group
            const enableResponse = await fetch(ENABLE_ENCRYPTION_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: groupId, user_id: userId }),
            });

            if (!enableResponse.ok) {
                throw new Error("Failed to enable encryption");
            }

            // Cache and set local key
            await cacheGroupKey(groupId, groupKey);
            groupKeyRef.current = groupKey;

            setState(prev => ({
                ...prev,
                isGroupEncrypted: true,
                isReady: true,
                isSettingUp: false,
            }));

            return true;
        } catch (error) {
            console.error("Error enabling group encryption:", error);
            setState(prev => ({
                ...prev,
                isSettingUp: false,
                error: error instanceof Error ? error.message : "Failed to enable encryption",
            }));
            return false;
        }
    }, [userId, groupId]);

    // Encrypt a message
    const encrypt = useCallback(async (message: string): Promise<string | null> => {
        if (!groupKeyRef.current) {
            console.error("No group key available");
            return null;
        }

        try {
            return await encryptMessage(message, groupKeyRef.current);
        } catch (error) {
            console.error("Encryption error:", error);
            return null;
        }
    }, []);

    // Decrypt a message
    const decrypt = useCallback(async (encryptedMessage: string): Promise<string | null> => {
        if (!groupKeyRef.current) {
            console.error("No group key available");
            return null;
        }

        try {
            return await decryptMessage(encryptedMessage, groupKeyRef.current);
        } catch (error) {
            console.error("Decryption error:", error);
            return null;
        }
    }, []);

    // Add new member key (when someone joins encrypted group)
    const addMemberKey = useCallback(async (
        newMemberUserId: number
    ): Promise<boolean> => {
        if (!groupKeyRef.current || !privateKeyRef.current || !groupId) return false;

        try {
            // Get new member's public key
            const response = await fetch(`${PUBLIC_KEY_URL}/${newMemberUserId}`);
            const data = await response.json();

            if (!data.success || !data.data.public_key) {
                throw new Error("Member hasn't set up encryption");
            }

            // Encrypt group key for new member
            const encryptedKey = await encryptGroupKeyForUser(
                groupKeyRef.current,
                data.data.public_key,
                privateKeyRef.current
            );

            // Store on server
            const storeResponse = await fetch(GROUP_KEY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    group_id: groupId,
                    user_id: newMemberUserId,
                    encrypted_key: encryptedKey,
                }),
            });

            return storeResponse.ok;
        } catch (error) {
            console.error("Error adding member key:", error);
            return false;
        }
    }, [groupId]);

    return {
        ...state,
        setupUserKeys,
        enableGroupEncryption,
        encrypt,
        decrypt,
        addMemberKey,
    };
}
