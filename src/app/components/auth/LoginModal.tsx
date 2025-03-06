// import React from 'react'
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import { Button } from '@/components/ui/button'
// import Image from 'next/image'
// import { signIn } from "next-auth/react"
// function LoginModal() {
//     const handleLogin = () => {
//         signIn("google", {
//             callbackUrl: "/dashboard",
//             redirect: true
//         })
//     }
//     return (
//         <div>
//             <Dialog>
//                 <DialogTrigger asChild>Getting Start</DialogTrigger>
//                 <DialogContent>
//                     <DialogHeader>
//                         <DialogTitle className='text-2xl'>Welcome to Chatty</DialogTitle>
//                         <DialogDescription>
//                             Chatty makes it effortless to create secure chat links and start conversations in seconds.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <Button
//                         variant="outline"
//                         onClick={handleLogin}
//                     >
//                         <Image src="/images/google.png"
//                             className='mr-4'
//                             width={25}
//                             height={25}
//                             alt='google_logo'
//                         />
//                         Continue with Google
//                     </Button>
//                 </DialogContent>
//             </Dialog>


//         </div>
//     )
// }

// export default LoginModal
import React from "react";
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

const handleGoogleLogin = async () => {
    signIn("google", {
        redirect: true,
        callbackUrl: "/dashboard",
    });
};

export default function LoginModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Getting start</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Welcome to QuickChat</DialogTitle>
                    <DialogDescription>
                        QuickChat makes it effortless to create secure chat links and start
                        conversations in seconds.
                    </DialogDescription>
                </DialogHeader>
                <Button variant="outline" onClick={handleGoogleLogin}>
                    <Image
                        src="/images/google.png"
                        className=" mr-4"
                        width={25}
                        height={25}
                        alt="google"
                    />
                    Continue with Google
                </Button>
            </DialogContent>
        </Dialog>
    );
}