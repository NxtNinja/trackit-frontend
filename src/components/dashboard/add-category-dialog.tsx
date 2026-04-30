"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PlusIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { apiProxy } from "@/lib/api"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["income", "expense"]),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface AddCategoryDialogProps {
  trigger?: React.ReactNode
  defaultType?: "income" | "expense"
}

export function AddCategoryDialog({ trigger, defaultType = "expense" }: AddCategoryDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  
  const open = internalOpen
  const setOpen = setInternalOpen

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: defaultType,
    },
  })

  // Reset type when defaultType changes
  React.useEffect(() => {
    if (open) {
      reset({ name: "", type: defaultType })
    }
  }, [defaultType, reset, open])

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      return await apiProxy("/transactions/category/createCategory", "POST", values)
    },
    onSuccess: () => {
      toast.success("Category created successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setOpen(false)
      reset()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create category")
    },
  })

  function onSubmit(values: CategoryFormValues) {
    mutation.mutate(values)
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4 px-4 sm:px-0">
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Field>
            <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Category Name</FieldLabel>
            <Input 
              placeholder="e.g. Groceries, Salary, etc." 
              {...field} 
              className="h-12 bg-muted/30 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all font-medium"
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Field>
            <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Type</FieldLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <SelectTrigger className="h-12 bg-muted/30 border-none ring-1 ring-border/50 focus:ring-primary/50 rounded-xl transition-all font-medium">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none ring-1 ring-border/50">
                <SelectItem value="expense" className="rounded-lg">Expense</SelectItem>
                <SelectItem value="income" className="rounded-lg">Income</SelectItem>
              </SelectContent>
            </Select>
            <FieldError>{errors.type?.message}</FieldError>
          </Field>
        )}
      />
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-none"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Category"
          )}
        </Button>
      </div>
    </form>
  )

  const defaultTrigger = (
    <Button className="h-10 rounded-xl px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-none border-none ring-1 ring-primary/20">
      <PlusIcon className="size-4" />
      <span>Add Category</span>
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="rounded-t-[32px] border-none">
          <DrawerHeader className="text-left px-8 pt-8">
            <DrawerTitle className="text-2xl font-bold tracking-tight">New Category</DrawerTitle>
            <DrawerDescription className="text-muted-foreground font-medium">
              Create a new category to organize your transactions.
            </DrawerDescription>
          </DrawerHeader>
          <div className="pb-8 px-4">
            {formContent}
          </div>
          <DrawerFooter className="pt-2 px-8 pb-10">
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-xl h-12 text-muted-foreground font-semibold">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-8 ring-1 ring-border/50 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">New Category</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Create a new category to organize your transactions.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
