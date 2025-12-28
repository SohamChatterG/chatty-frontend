"use client";

import { useState, useRef } from "react";
import { Mic, Square, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHAT_VOICE_UPLOAD } from "@/lib/apiEndpoints";

interface VoiceRecorderProps {
    groupId: string;
    userName: string;
    userId?: number;
    onVoiceSent: (message: any) => void;
}

export default function VoiceRecorder({
    groupId,
    userName,
    userId,
    onVoiceSent,
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (isRecording) {
            stopRecording();
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
    };

    const sendVoiceMessage = async () => {
        if (!audioBlob) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "voice-message.webm");
            formData.append("group_id", groupId);
            formData.append("name", userName);
            formData.append("duration", duration.toString());
            if (userId) {
                formData.append("user_id", userId.toString());
            }

            const response = await fetch(CHAT_VOICE_UPLOAD, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload voice message");
            }

            const data = await response.json();
            onVoiceSent(data.data);

            // Reset state
            setAudioBlob(null);
            setAudioUrl(null);
            setDuration(0);
        } catch (error) {
            console.error("Error sending voice message:", error);
            alert("Failed to send voice message");
        } finally {
            setIsUploading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (audioUrl) {
        return (
            <div className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <audio src={audioUrl} controls className="h-8 max-w-[120px] sm:max-w-[200px]" />
                <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">{formatDuration(duration)}</span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={cancelRecording}
                    className="text-red-500 hover:text-red-600 h-8 w-8 sm:h-9 sm:w-9"
                >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={sendVoiceMessage}
                    disabled={isUploading}
                    className="text-blue-500 hover:text-blue-600 h-8 w-8 sm:h-9 sm:w-9"
                >
                    {isUploading ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            {isRecording ? (
                <>
                    <span className="text-xs sm:text-sm text-red-500 animate-pulse flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        {formatDuration(duration)}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={stopRecording}
                        className="text-red-500 hover:text-red-600 h-8 w-8 sm:h-9 sm:w-9"
                    >
                        <Square className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    </Button>
                </>
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={startRecording}
                    className="text-gray-500 hover:text-gray-600 h-8 w-8 sm:h-9 sm:w-9"
                >
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            )}
        </div>
    );
}
