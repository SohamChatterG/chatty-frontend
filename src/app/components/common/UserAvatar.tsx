import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function UserAvatar({ name, image }: { name: string, image?: string }) {
    return (
        <div>
            <Avatar>
                <AvatarImage src={image} />
                <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>

        </div>
    )
}

export default UserAvatar
