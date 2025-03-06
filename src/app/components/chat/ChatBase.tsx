"use client"
import { getSocket } from '@/lib/socket.config'
import React, { useEffect, useMemo } from 'react'

function ChatBase() {
    let socket = useMemo(() => {
        const socket = getSocket()
        return socket.connect()
    }, [])
    return (
        <div>

        </div>
    )
}

export default ChatBase
