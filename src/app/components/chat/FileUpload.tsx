"use client";
import React, { useState } from "react";
import { Paperclip, X, Upload, FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import { CHAT_FILE_UPLOAD } from "@/lib/apiEndpoints";
import { toast } from "sonner";

interface FileUploadProps {
    onFileUploaded: (fileData: { url: string; type: string; size: number }) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            toast.error("File size must be less than 50MB");
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch(CHAT_FILE_UPLOAD, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("File uploaded successfully!");
                onFileUploaded(result.data);
                setSelectedFile(null);
                setPreview(null);
            } else {
                toast.error(result.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreview(null);
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("image")) return <ImageIcon className="w-8 h-8" />;
        if (fileType.startsWith("video")) return <VideoIcon className="w-8 h-8" />;
        return <FileIcon className="w-8 h-8" />;
    };

    return (
        <div className="relative">
            {!selectedFile ? (
                <label className="cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    />
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-blue-500" />
                </label>
            ) : (
                <div className="absolute bottom-full mb-2 left-0 sm:left-0 right-0 sm:right-auto bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-lg p-2 sm:p-3 min-w-[200px] sm:min-w-[300px] max-w-[calc(100vw-2rem)]">
                    <div className="flex items-start gap-2 sm:gap-3">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0" />
                        ) : (
                            <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded flex-shrink-0">
                                {getFileIcon(selectedFile.type)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate dark:text-white">{selectedFile.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="mt-1.5 sm:mt-2 px-2 sm:px-3 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                            >
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                        <button onClick={clearFile} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
