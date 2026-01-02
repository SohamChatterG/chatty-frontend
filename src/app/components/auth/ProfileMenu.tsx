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
import ProfileModal from './ProfileModal'

function ProfileMenu({ name, image, token }: { name: string, image?: string | null, token?: string }) {
    const [logoutOpen, setLogoutOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    return (
        <>
            {/* {logoutOpen && <Suspense fallback={<p>Wait Bro, what's the rush?...</p>}> */}
            <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} />
            {token && (
                <ProfileModal
                    open={profileOpen}
                    setOpen={setProfileOpen}
                    token={token}
                    initialData={{ name, image }}
                />
            )}
            {/* </Suspense>} */}
            <DropdownMenu>
                <DropdownMenuTrigger><UserAvatar name={name} image={image} /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setProfileOpen(true)}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLogoutOpen(true)}>Log Out</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </>
    )
}

export default ProfileMenu
