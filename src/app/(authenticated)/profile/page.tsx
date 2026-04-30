"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { 
  UserCircleIcon, 
  Mail01Icon, 
  Key01Icon, 
  UserEdit01Icon,
  LockPasswordIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loader2Icon, CameraIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field"
import { apiProxy } from "@/lib/api"
import { User } from "@/types/api"

export default function ProfilePage() {
  const queryClient = useQueryClient()
  
  const { data: userData, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiProxy<User>("/auth/me", "GET")
      return response.data
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string, email: string }) => {
      const response = await apiProxy<User>("/auth/profile", "PUT", data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Profile updated successfully")
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile")
    }
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiProxy("/auth/password", "PUT", data)
    },
    onSuccess: () => {
      toast.success("Password updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update password")
    }
  })

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    updateProfileMutation.mutate({ name, email })
  }

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    updatePasswordMutation.mutate({ currentPassword, newPassword })
    e.currentTarget.reset()
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const user = userData

  if (!user && !userLoading) {
     return <div>User not found</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background/50">
      <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Manage your personal information and security preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none ring-1 ring-border/50 bg-card/30 backdrop-blur-sm overflow-hidden rounded-[32px] shadow-none">
              <CardContent className="pt-10 pb-8 flex flex-col items-center">
                <div className="relative group">
                   <div className="size-32 rounded-full ring-4 ring-primary/10 p-1 bg-background overflow-hidden relative transition-transform duration-500">
                      <Avatar className="size-full">
                        <AvatarImage src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.name}`} />
                        <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                          {user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                   </div>
                </div>
                <div className="mt-6 text-center space-y-1">
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
                </div>
              </CardContent>
            </Card>

            <nav className="flex flex-col gap-2">
               <Button variant="ghost" className="justify-start gap-3 h-12 rounded-2xl bg-primary/5 text-primary font-bold transition-all ring-1 ring-primary/20 border-none">
                  <HugeiconsIcon icon={UserEdit01Icon} className="size-5" />
                  <span>Profile Information</span>
               </Button>
               <Button variant="ghost" className="justify-start gap-3 h-12 rounded-2xl hover:bg-muted/50 text-muted-foreground hover:text-foreground font-semibold transition-all">
                  <HugeiconsIcon icon={LockPasswordIcon} className="size-5" />
                  <span>Security</span>
               </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Profile Info Form */}
            <Card className="border-none ring-1 ring-border/50 bg-card/30 backdrop-blur-sm rounded-[32px] shadow-none overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <HugeiconsIcon icon={UserCircleIcon} className="size-6 text-primary" />
                   Personal Information
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground">Update your basic profile details.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Full Name</FieldLabel>
                      <div className="relative group">
                         <HugeiconsIcon icon={UserEdit01Icon} className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                         <Input 
                            name="name"
                            defaultValue={user?.name} 
                            placeholder="Your Name" 
                            className="h-12 pl-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all font-medium"
                          />
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Email Address</FieldLabel>
                      <div className="relative group">
                         <HugeiconsIcon icon={Mail01Icon} className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                         <Input 
                            name="email"
                            defaultValue={user?.email} 
                            placeholder="Email Address" 
                            className="h-12 pl-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all font-medium"
                          />
                      </div>
                    </Field>
                  </FieldGroup>
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-none"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Form */}
            <Card className="border-none ring-1 ring-border/50 bg-card/30 backdrop-blur-sm rounded-[32px] shadow-none overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <HugeiconsIcon icon={Key01Icon} className="size-6 text-primary" />
                   Security & Password
                </CardTitle>
                <CardDescription className="font-medium text-muted-foreground">Keep your account secure with a strong password.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Current Password</FieldLabel>
                      <div className="relative group">
                         <HugeiconsIcon icon={LockPasswordIcon} className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                         <Input 
                            name="currentPassword"
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 pl-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all font-medium"
                          />
                      </div>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">New Password</FieldLabel>
                        <Input 
                          name="newPassword"
                          type="password" 
                          placeholder="••••••••" 
                          className="h-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all font-medium"
                        />
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Confirm Password</FieldLabel>
                        <Input 
                          name="confirmPassword"
                          type="password" 
                          placeholder="••••••••" 
                          className="h-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all font-medium"
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-none"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}