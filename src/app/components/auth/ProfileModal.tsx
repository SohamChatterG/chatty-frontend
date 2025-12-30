"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Camera, X, User, Edit2 } from "lucide-react";
import axios from "axios";
import { PROFILE_URL, PROFILE_PICTURE_URL } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import Image from "next/image";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    image: string | null;
    profile_image: string | null;
    about: string | null;
}

interface ProfileModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    token: string;
    initialData?: {
        name?: string;
        image?: string | null;
    };
    onUpdate?: (profile: UserProfile) => void;
}

export default function ProfileModal({
    open,
    setOpen,
    token,
    initialData,
    onUpdate
}: ProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        about: "",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && token) {
            fetchProfile();
        }
    }, [open, token]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(PROFILE_URL, {
                headers: { Authorization: token },
            });
            setProfile(data.data);
            setFormData({
                name: data.data.name || "",
                about: data.data.about || "",
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const { data } = await axios.put(
                PROFILE_URL,
                formData,
                { headers: { Authorization: token } }
            );
            setProfile(data.data);
            setEditMode(false);
            toast.success("Profile updated successfully!");
            onUpdate?.(data.data);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const { data } = await axios.post(PROFILE_PICTURE_URL, formData, {
                headers: {
                    Authorization: token,
                    "Content-Type": "multipart/form-data",
                },
            });

            setProfile(data.data);
            toast.success("Profile picture updated!");
            onUpdate?.(data.data);
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload profile picture");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = async () => {
        setUploadingImage(true);
        try {
            const { data } = await axios.delete(PROFILE_PICTURE_URL, {
                headers: { Authorization: token },
            });

            setProfile(data.data);
            toast.success("Profile picture removed!");
            onUpdate?.(data.data);
        } catch (error) {
            console.error("Error removing image:", error);
            toast.error("Failed to remove profile picture");
        } finally {
            setUploadingImage(false);
        }
    };

    const getDisplayImage = () => {
        if (profile?.profile_image) return profile.profile_image;
        if (profile?.image) return profile.image;
        if (initialData?.image) return initialData.image;
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Profile</DialogTitle>
                </DialogHeader>

                {loading && !profile ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    {getDisplayImage() ? (
                                        <Image
                                            src={getDisplayImage()!}
                                            alt="Profile"
                                            width={112}
                                            height={112}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-white" />
                                    )}
                                </div>
                                
                                {/* Upload/Remove overlay */}
                                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {uploadingImage ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                            >
                                                <Camera className="w-5 h-5 text-white" />
                                            </button>
                                            {getDisplayImage() && (
                                                <button
                                                    onClick={handleRemoveImage}
                                                    className="p-2 bg-red-500/70 rounded-full hover:bg-red-500 transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-white" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Click to change profile picture
                            </p>
                        </div>

                        {/* Profile Info */}
                        {editMode ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Your name"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">About</label>
                                    <Textarea
                                        value={formData.about}
                                        onChange={(e) =>
                                            setFormData({ ...formData, about: e.target.value })
                                        }
                                        placeholder="Hey there! I'm using QuickChat"
                                        className="mt-1 resize-none"
                                        rows={3}
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formData.about.length}/500 characters
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setEditMode(false);
                                            setFormData({
                                                name: profile?.name || "",
                                                about: profile?.about || "",
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                                        onClick={handleUpdateProfile}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                                        <p className="font-medium">{profile?.name}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                                
                                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">About</p>
                                        <p className="text-sm text-gray-700">
                                            {profile?.about || "Hey there! I'm using QuickChat"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                    <p className="text-sm text-gray-700">{profile?.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
