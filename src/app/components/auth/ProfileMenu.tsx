"use client"
import React, { Suspense, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import dynamic from 'next/dynamic'
import UserAvatar from '../common/UserAvatar'
// const LogoutModal = dynamic(() => import("../auth/LogoutModal"))
import LogoutModal from './LogoutModal'
function ProfileMenu({ name, image }: { name: string, image?: string | null }) {
    const [logoutOpen, setLogoutOpen] = useState(false)
    return (
        <>
            {/* {logoutOpen && <Suspense fallback={<p>Wait Bro, what's the rush?...</p>}> */}
            <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} />
            {/* </Suspense>} */}
            <DropdownMenu>
                <DropdownMenuTrigger><UserAvatar name={name} image={image} /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLogoutOpen(true)}>Log Out</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </>
    )
}

export default ProfileMenu
