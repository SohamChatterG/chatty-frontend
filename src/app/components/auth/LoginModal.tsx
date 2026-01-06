"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";

export default function LoginModal({ children }: { children?: React.ReactNode }) {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        signIn("google", {
            redirect: true,
            callbackUrl: "/dashboard",
        });
    };

    return (
        <Dialog>
            {loading && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] cursor-not-allowed" />
            )}
            <DialogTrigger asChild>
                {children ?? <Button>Getting start</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Welcome to QuickChat</DialogTitle>
                    <DialogDescription>
                        QuickChat makes it effortless to create secure chat links and start
                        conversations in seconds.
                    </DialogDescription>
                </DialogHeader>
                <Button variant="outline" onClick={handleGoogleLogin} disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Image
                            src="/images/google.png"
                            className="mr-4"
                            width={25}
                            height={25}
                            alt="google"
                        />
                    )}
                    {loading ? "Signing in..." : "Continue with Google"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}