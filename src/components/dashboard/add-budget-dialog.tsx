"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PlusIcon, LoaderCircle, CalendarIcon, PencilIcon, TrashIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { AddCategoryDialog } from "@/components/dashboard/add-category-dialog"
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
import { Budget } from "@/types/api"

const budgetSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Please select a category"),
  period: z.enum(["monthly", "weekly", "yearly"]),
  startDate: z.date(),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

interface Category {
  id: string
  name: string
}

interface AddBudgetDialogProps {
  budget?: Budget
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddBudgetDialog({ budget, trigger, open: controlledOpen, onOpenChange }: AddBudgetDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const isEditing = !!budget

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

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiProxy(`/transactions/category/deleteCategory/${id}`, "DELETE")
    },
    onSuccess: () => {
      toast.success("Category deleted successfully")
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category")
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: budget?.amount ? Number(budget.amount) : 0,
      categoryId: budget?.category_id || "",
      period: (budget?.period as "monthly" | "weekly" | "yearly") || "monthly",
      startDate: budget?.start_date ? new Date(budget.start_date) : new Date(),
    },
  })

  // Reset form when budget changes or modal opens
  React.useEffect(() => {
    if (budget && open) {
      reset({
        amount: Number(budget.amount),
        categoryId: budget.category_id,
        period: budget.period as "monthly" | "weekly" | "yearly",
        startDate: new Date(budget.start_date),
      })
    } else if (!budget && open) {
      reset({
        amount: 0,
        categoryId: "",
        period: "monthly",
        startDate: new Date(),
      })
    }
  }, [budget, reset, open])

  const mutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      if (isEditing && budget) {
        // Update: categoryId is immutable — only send mutable fields
        const updatePayload = {
          amount: Number(data.amount),
          period: data.period,
          startDate: format(data.startDate, "yyyy-MM-dd"),
        }
        return await apiProxy(`/transactions/budgets/${budget.id}`, "PUT", updatePayload)
      }

      // Create: include categoryId
      const createPayload = {
        categoryId: data.categoryId,
        amount: Number(data.amount),
        period: data.period,
        startDate: format(data.startDate, "yyyy-MM-dd"),
      }
      return await apiProxy("/transactions/budgets/createBudget", "POST", createPayload)
    },
    onSuccess: () => {
      toast.success(isEditing ? "Budget updated successfully" : "Budget created successfully")
      queryClient.invalidateQueries({ queryKey: ['budgets-list'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-usage'] })
      setOpen(false)
      if (!isEditing) reset()
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process budget")
    }
  })

  const onSubmit = (data: BudgetFormValues) => {
    mutation.mutate(data)
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-4 sm:px-0">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                <SelectTrigger id="categoryId" className="rounded-xl h-11 border-none ring-1 ring-border/50 bg-background disabled:opacity-50">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none p-1">
                   <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    {categories.length === 0 ? (
                      <div className="py-6 px-2 text-center text-xs text-muted-foreground italic">
                        No categories found
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat.id} className="flex items-center group px-1">
                          <SelectItem 
                            value={cat.id} 
                            className="flex-1 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors"
                          >
                            {cat.name}
                          </SelectItem>
                          {!isEditing && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              type="button"
                              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                deleteCategoryMutation.mutate(cat.id)
                              }}
                            >
                              <TrashIcon className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  {!isEditing && (
                    <div className="mt-1 border-t pt-1">
                      <AddCategoryDialog 
                        defaultType="expense"
                        trigger={
                          <Button 
                            variant="ghost" 
                            type="button"
                            className="w-full justify-start gap-2 h-9 text-xs text-primary hover:text-primary hover:bg-primary/5 rounded-lg font-semibold px-2"
                          >
                            <PlusIcon className="size-3.5" />
                            <span>Add new category</span>
                          </Button>
                        }
                      />
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="amount">Limit Amount (₹)</FieldLabel>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="h-11"
              {...register("amount")}
            />
            {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="period">Period</FieldLabel>
            <Controller
              name="period"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="period" className="rounded-xl h-11 border-none ring-1 ring-border/50 bg-background">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none ring-1 ring-border/50">
                    <SelectItem value="monthly" className="rounded-lg">Monthly</SelectItem>
                    <SelectItem value="weekly" className="rounded-lg">Weekly</SelectItem>
                    <SelectItem value="yearly" className="rounded-lg">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.period && <FieldError>{errors.period.message}</FieldError>}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 pl-3 text-left font-normal rounded-xl border-none ring-1 ring-border/50 bg-background",
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
                <PopoverContent className="w-auto p-0 rounded-xl border-none ring-1 ring-border/50" align="start">
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
          {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
        </Field>
      </FieldGroup>

      <div className="pt-4">
        <Button type="submit" className="w-full h-11 rounded-xl transition-all font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Update Budget" : "Create Budget"
          )}
        </Button>
      </div>
    </form>
  )

  const defaultTrigger = (
    <Button className="gap-2 h-10 rounded-xl px-4 transition-all font-semibold">
      <PlusIcon className="size-4" />
      <span>Add Budget</span>
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
            <DrawerTitle className="text-2xl font-bold">{isEditing ? "Edit Budget" : "New Budget"}</DrawerTitle>
            <DrawerDescription className="text-muted-foreground font-medium">
              {isEditing ? "Update your spending limit and period." : "Set a spending limit for a specific category."}
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
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-6 ring-1 ring-border/50 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{isEditing ? "Edit Budget" : "New Budget"}</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            {isEditing ? "Update your spending limit and period." : "Set a spending limit for a specific category."}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
