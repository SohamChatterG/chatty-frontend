"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomUser } from '@/app/api/auth/[...nextauth]/options';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { CHAT_GROUP_URL } from '@/lib/apiEndpoints';
import { clearCache } from '@/actions/common';
import { Loader2, Plus, Globe, Lock } from 'lucide-react';

function CreateChat({ user }: { user?: CustomUser }) {
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [passcode, setPasscode] = useState('');
  const [errors, setErrors] = useState<{ title?: string; passcode?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; passcode?: string } = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Chat title is required.";
    } else if (title.length > 191) {
      newErrors.title = "Chat title must be less than 191 characters.";
    }

    // Validate passcode for private groups
    if (!isPublic) {
      if (!passcode.trim()) {
        newErrors.passcode = "Passcode is required for private groups.";
      } else if (passcode.length < 4) {
        newErrors.passcode = "Passcode must be at least 4 characters long.";
      } else if (passcode.length > 25) {
        newErrors.passcode = "Passcode must be less than 25 characters.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log("handle submit clicked for creating grp", user)
      setLoading(true);
      const payload = {
        title: title.trim(),
        passcode: isPublic ? null : passcode,
        user_id: user?.id,
        is_public: isPublic
      };

      const { data } = await axios.post(CHAT_GROUP_URL, payload, {
        headers: {
          authorization: user?.token
        }
      })
      if (data?.message) {
        clearCache("dashboard")
        setLoading(false);
        setOpen(false);
        setTitle('');
        setPasscode('');
        setErrors({});
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setTitle('');
      setPasscode('');
      setErrors({});
      setIsPublic(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Chat
          </Button>
        </DialogTrigger>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create your new Chat</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Chat Title
              </label>
              <Input
                placeholder="Enter chat title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
              {errors.title && <span className="text-red-500 text-sm mt-1 block">{errors.title}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Group Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPublic(false);
                    setErrors(prev => ({ ...prev, passcode: undefined }));
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${!isPublic
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Private</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPublic(true);
                    setPasscode('');
                    setErrors(prev => ({ ...prev, passcode: undefined }));
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${isPublic
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Public</span>
                </button>
              </div>
            </div>

            {!isPublic && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Passcode
                </label>
                <Input
                  placeholder="Enter passcode (min 4 characters)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={loading}
                  type="password"
                />
                {errors.passcode && <span className="text-red-500 text-sm mt-1 block">{errors.passcode}</span>}
              </div>
            )}

            <Button className="w-full" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Chat
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateChat
