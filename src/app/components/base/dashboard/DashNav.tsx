"use client";
import React from "react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";

import ProfileMenu from "../../auth/ProfileMenu";

export function DashNav({ name, image }: { name: string, image?: string | null}) {
    return (
        <nav className="p-6 flex justify-between items-center bg-black bg-opacity-60 shadow-lg">
            <h1 className="text-2xl font-extrabold text-white tracking-wide">QuickChat</h1>
            <div className="flex items-center space-x-4">
                <ProfileMenu name={name} image={image} />
            </div>
        </nav>
    );
}