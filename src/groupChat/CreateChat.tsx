"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createChatSchema, createChatSchemaType } from '@/validations/groupChatValidation';
import { CustomUser } from '@/app/api/auth/[...nextauth]/options';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { CHAT_GROUP_URL } from '@/lib/apiEndpoints';
import { clearCache } from '@/actions/common';
function CreateChat({ user }: { user?: CustomUser }) {
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<createChatSchemaType>({
    resolver: zodResolver(createChatSchema),
  });
  const onSubmit = async (payload: createChatSchemaType) => {
    try {
      console.log("handle submit clicked for creating grp", user)
      setLoading(true);
      const { data } = await axios.post(CHAT_GROUP_URL, { ...payload, user_id: user?.id, is_public: isPublic }, {
        headers: {
          authorization: user?.token
        }
      })
      if (data?.message) {
        clearCache("dashboard")
        setLoading(false);
        setOpen(false);
        toast.success(data?.message);
      }

    } catch (error) {
      setLoading(false);
      if (error instanceof AxiosError) {
        toast.error(error.message)
      } else {
        toast.error("Something went wrong. Please try again")
      }
    }
  }
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Chat</Button>
        </DialogTrigger>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create your new Chat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-4">
              <Input placeholder="Enter chat title" {...register("title")} />
              <span className="text-red-400">{errors.title?.message}</span>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                Public Group
              </label>
            </div>
            {
              !isPublic && (
                <div className="mt-4">
                  <Input placeholder="Enter passcode" {...register("passcode")} />
                  <span className="text-red-400">{errors.passcode?.message}</span>
                </div>
              )
            }
            <div className="mt-4">
              <Button className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>

  )
}

export default CreateChat
