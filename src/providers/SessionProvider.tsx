"use client"
import React from 'react'

interface Props {
  children?: React.ReactNode;
}
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
  )
}

export default SessionProvider
