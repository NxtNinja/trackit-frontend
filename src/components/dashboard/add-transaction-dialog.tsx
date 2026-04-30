"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PlusIcon, LoaderCircle, CalendarIcon, PencilIcon } from "lucide-react"
import { format, startOfDay } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { apiProxy } from "@/lib/api"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Transaction } from "@/types/api"

const transactionSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Please select a category"),
  type: z.enum(["income", "expense"]),
  date: z.date(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface Category {
  id: string
  name: string
}

interface AddTransactionDialogProps {
  transaction?: Transaction
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddTransactionDialog({ transaction, trigger, open: controlledOpen, onOpenChange }: AddTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const isEditing = !!transaction

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiProxy<Category[]>("/transactions/category/getCategories", "GET")
      return response.data
    }
  })

  const categories = categoriesData || []

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || "",
      amount: transaction?.amount ? Number(transaction.amount) : 0,
      categoryId: transaction?.category_id || "",
      type: (transaction?.type as "expense" | "income") || "expense",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  })

  // Reset form when transaction changes
  React.useEffect(() => {
    if (transaction && open) {
      reset({
        description: transaction.description,
        amount: Number(transaction.amount),
        categoryId: transaction.category_id,
        type: transaction.type as "expense" | "income",
        date: new Date(transaction.date),
      })
    } else if (!transaction && open) {
      reset({
        description: "",
        amount: 0,
        categoryId: "",
        type: "expense",
        date: new Date(),
      })
    }
  }, [transaction, reset, open])

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const payload = {
        type: data.type,
        amount: Number(data.amount),
        categoryId: data.categoryId,
        description: data.description,
        date: format(data.date, "yyyy-MM-dd'T'10:00:00'Z'"),
      }
      
      if (isEditing && transaction) {
        return await apiProxy(`/transactions/updateTransaction/${transaction.id}`, "PUT", payload)
      }
      return await apiProxy("/transactions/addTransaction", "POST", payload)
    },
    onSuccess: () => {
      toast.success(isEditing ? "Transaction updated successfully" : "Transaction added successfully")
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      setOpen(false)
      if (!isEditing) reset()
    },
  })

  const onSubmit = (data: TransactionFormValues) => {
    mutation.mutate(data)
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-4 sm:px-0">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Input
            id="description"
            placeholder="e.g. Starbucks Coffee"
            {...register("description")}
          />
          {errors.description && <FieldError>{errors.description.message as string}</FieldError>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="amount">Amount (₹)</FieldLabel>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && <FieldError>{errors.amount.message as string}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger id="type" className="rounded-xl h-10 border-none ring-1 ring-border/50 bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none">
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <FieldError>{errors.type.message as string}</FieldError>}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger id="categoryId" className="rounded-xl h-10 border-none ring-1 ring-border/50 bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <FieldError>{errors.categoryId.message as string}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-10 pl-3 text-left font-normal rounded-xl border-none ring-1 ring-border/50 bg-background",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border-none" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && <FieldError>{errors.date.message as string}</FieldError>}
        </Field>
      </FieldGroup>

      <div className="pt-4">
        <Button type="submit" className="w-full h-11 rounded-xl transition-all font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Saving..."}
            </>
          ) : (
            isEditing ? "Update Transaction" : "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  )

  const defaultTrigger = (
    <Button className="gap-2 h-10 rounded-xl px-4 transition-all font-semibold">
      <PlusIcon className="size-4" />
      <span className="hidden sm:inline">Add New Transaction</span>
      <span className="sm:hidden">Add</span>
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="rounded-t-[32px] border-none">
          <DrawerHeader className="text-left px-6 pt-8">
            <DrawerTitle className="text-2xl font-bold">{isEditing ? "Edit Transaction" : "Add New Transaction"}</DrawerTitle>
            <DrawerDescription className="text-muted-foreground font-medium">
              {isEditing ? "Update the details of your transaction." : "Fill in the details below to record a new transaction."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-2">
            {formContent}
          </div>
          <DrawerFooter className="pt-2 px-6 pb-8">
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-xl h-11 text-muted-foreground">Cancel</Button>
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
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{isEditing ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            {isEditing ? "Update the details of your transaction." : "Fill in the details below to record a new transaction."}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
