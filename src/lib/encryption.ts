/**
 * End-to-End Encryption Utility
 * Uses Web Crypto API for secure key generation and message encryption
 * 
 * Flow:
 * 1. Each user generates an ECDH key pair (public/private)
 * 2. Public key is stored on server, private key in IndexedDB
 * 3. Group creator generates a symmetric AES-GCM key
 * 4. Group key is encrypted for each member using their public key
 * 5. Messages are encrypted with the group's symmetric key
 */

const DB_NAME = 'e2e_keys';
const DB_VERSION = 1;
const KEY_STORE = 'private_keys';

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(KEY_STORE)) {
                db.createObjectStore(KEY_STORE, { keyPath: 'userId' });
            }
        };
    });
}

async function storePrivateKey(userId: number, privateKey: CryptoKey): Promise<void> {
    const db = await openDB();
    const exportedKey = await crypto.subtle.exportKey('jwk', privateKey);

    return new Promise((resolve, reject) => {
        const tx = db.transaction(KEY_STORE, 'readwrite');
        const store = tx.objectStore(KEY_STORE);
        const request = store.put({ userId, privateKey: exportedKey });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

async function getPrivateKey(userId: number): Promise<CryptoKey | null> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(KEY_STORE, 'readonly');
        const store = tx.objectStore(KEY_STORE);
        const request = store.get(userId);

        request.onerror = () => reject(request.error);
        request.onsuccess = async () => {
            if (!request.result) {
                resolve(null);
                return;
            }

            try {
                const privateKey = await crypto.subtle.importKey(
                    'jwk',
                    request.result.privateKey,
                    { name: 'ECDH', namedCurve: 'P-256' },
                    true,
                    ['deriveKey', 'deriveBits']
                );
                resolve(privateKey);
            } catch (err) {
                reject(err);
            }
        };
    });
}

// Store group symmetric keys (encrypted, in localStorage for simplicity)
function storeGroupKey(groupId: string, key: string): void {
    const keys = JSON.parse(localStorage.getItem('e2e_group_keys') || '{}');
    keys[groupId] = key;
    localStorage.setItem('e2e_group_keys', JSON.stringify(keys));
}

function getStoredGroupKey(groupId: string): string | null {
    const keys = JSON.parse(localStorage.getItem('e2e_group_keys') || '{}');
    return keys[groupId] || null;
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Generate ECDH key pair for user
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: CryptoKey }> {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
    );

    // Export public key as base64
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer);

    return {
        publicKey: publicKeyBase64,
        privateKey: keyPair.privateKey,
    };
}

/**
 * Store user's private key securely in IndexedDB
 */
export async function savePrivateKey(userId: number, privateKey: CryptoKey): Promise<void> {
    await storePrivateKey(userId, privateKey);
}

/**
 * Load user's private key from IndexedDB
 */
export async function loadPrivateKey(userId: number): Promise<CryptoKey | null> {
    return getPrivateKey(userId);
}

/**
 * Check if user has encryption keys set up
 */
export async function hasEncryptionKeys(userId: number): Promise<boolean> {
    const privateKey = await loadPrivateKey(userId);
    return privateKey !== null;
}

/**
 * Generate a symmetric AES-GCM key for group encryption
 */
export async function generateGroupKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Export group key as base64 string
 */
export async function exportGroupKey(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(rawKey);
}

/**
 * Import group key from base64 string
 */
export async function importGroupKey(keyBase64: string): Promise<CryptoKey> {
    const rawKey = base64ToArrayBuffer(keyBase64);
    return crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Import a public key from base64
 */
async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
    const keyBuffer = base64ToArrayBuffer(publicKeyBase64);
    return crypto.subtle.importKey(
        'spki',
        keyBuffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
    );
}

/**
 * Derive a shared secret using ECDH
 */
async function deriveSharedKey(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
    return crypto.subtle.deriveKey(
        {
            name: 'ECDH',
            public: publicKey,
        },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt the group key for a specific user using their public key
 */
export async function encryptGroupKeyForUser(
    groupKey: CryptoKey,
    userPublicKeyBase64: string,
    senderPrivateKey: CryptoKey
): Promise<string> {
    // Import user's public key
    const userPublicKey = await importPublicKey(userPublicKeyBase64);

    // Derive shared secret
    const sharedKey = await deriveSharedKey(senderPrivateKey, userPublicKey);

    // Export group key
    const groupKeyRaw = await crypto.subtle.exportKey('raw', groupKey);

    // Encrypt with shared key
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedKey = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        sharedKey,
        groupKeyRaw
    );

    // Combine IV + encrypted key
    const combined = new Uint8Array(iv.length + encryptedKey.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedKey), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypt the group key using user's private key and sender's public key
 */
export async function decryptGroupKey(
    encryptedKeyBase64: string,
    senderPublicKeyBase64: string,
    userPrivateKey: CryptoKey
): Promise<CryptoKey> {
    // Import sender's public key
    const senderPublicKey = await importPublicKey(senderPublicKeyBase64);

    // Derive shared secret
    const sharedKey = await deriveSharedKey(userPrivateKey, senderPublicKey);

    // Decode encrypted key
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedKeyBase64));
    const iv = combined.slice(0, 12);
    const encryptedKey = combined.slice(12);

    // Decrypt
    const decryptedKeyRaw = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        sharedKey,
        encryptedKey
    );

    // Import as AES key
    return crypto.subtle.importKey(
        'raw',
        decryptedKeyRaw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a message using the group's symmetric key
 */
export async function encryptMessage(message: string, groupKey: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        groupKey,
        data
    );

    // Combine IV + encrypted message
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypt a message using the group's symmetric key
 */
export async function decryptMessage(encryptedBase64: string, groupKey: CryptoKey): Promise<string> {
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        groupKey,
        encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Store decrypted group key for quick access
 */
export async function cacheGroupKey(groupId: string, groupKey: CryptoKey): Promise<void> {
    const keyBase64 = await exportGroupKey(groupKey);
    storeGroupKey(groupId, keyBase64);
}

/**
 * Get cached group key
 */
export async function getCachedGroupKey(groupId: string): Promise<CryptoKey | null> {
    const keyBase64 = getStoredGroupKey(groupId);
    if (!keyBase64) return null;

    try {
        return await importGroupKey(keyBase64);
    } catch {
        return null;
    }
}

/**
 * Clear all encryption data (for logout)
 */
export async function clearEncryptionData(): Promise<void> {
    localStorage.removeItem('e2e_group_keys');

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(KEY_STORE, 'readwrite');
        const store = tx.objectStore(KEY_STORE);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// Export a helper to check if E2E is available in the browser
export function isE2ESupported(): boolean {
    return typeof crypto !== 'undefined' &&
        typeof crypto.subtle !== 'undefined' &&
        typeof indexedDB !== 'undefined';
}
