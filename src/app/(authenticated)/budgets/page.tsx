"use client"

import * as React from "react"
import { PlusIcon, MoreHorizontalIcon, PencilIcon, TrashIcon, TargetIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, RefreshCcwIcon } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddBudgetDialog } from "@/components/dashboard/add-budget-dialog"
import { apiProxy } from "@/lib/api"
import { Budget, BudgetUsageData } from "@/types/api"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

export default function BudgetsPage() {
  const queryClient = useQueryClient()
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear())

  const [editingBudget, setEditingBudget] = React.useState<Budget | undefined>()
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [deletingBudgetId, setDeletingBudgetId] = React.useState<string | null>(null)

  // Fetch Budget Usage with year/month filter
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['budgets-usage', selectedYear, selectedMonth],
    queryFn: async () => {
      const response = await apiProxy<BudgetUsageData[]>(`/transactions/budgets/usage?year=${selectedYear}&month=${selectedMonth}`, "GET")
      return response.data
    }
  })

  // Fetch All Budgets (Config)
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets-list'],
    queryFn: async () => {
      const response = await apiProxy<Budget[]>("/transactions/budgets/getBudgets", "GET")
      return response.data
    }
  })

  // Fetch Categories for mapping
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiProxy<Category[]>("/transactions/category/getCategories", "GET")
      return response.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiProxy(`/transactions/budgets/${id}`, "DELETE")
    },
    onSuccess: () => {
      toast.success("Budget deleted successfully")
      queryClient.invalidateQueries({ queryKey: ['budgets-list'] })
      queryClient.invalidateQueries({ queryKey: ['budgets-usage'] })
      setDeletingBudgetId(null)
    },
    onError: () => {
      toast.error("Failed to delete budget")
    }
  })

  const categoriesMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    categoriesData?.forEach(cat => {
      map[cat.id] = cat.name
    })
    return map
  }, [categoriesData])

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount) || 0)
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(y => y - 1)
    } else {
      setSelectedMonth(m => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(y => y + 1)
    } else {
      setSelectedMonth(m => m + 1)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsEditDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deletingBudgetId) {
      deleteMutation.mutate(deletingBudgetId)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Budgets
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Plan your spending and track your limits by category.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['budgets-usage'] })
              queryClient.invalidateQueries({ queryKey: ['budgets-list'] })
            }}
            className="h-10 rounded-xl px-4 gap-2 border-none ring-1 ring-border/50 hover:bg-muted/50 transition-all group"
          >
            <RefreshCcwIcon className={cn("size-4 text-muted-foreground transition-all duration-500", (usageLoading || budgetsLoading) && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <AddBudgetDialog />
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card/30 ring-1 ring-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-xl size-9">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[200px] justify-center font-bold text-lg">
            <CalendarIcon className="size-5 text-primary" />
            <span>{MONTHS[selectedMonth - 1]} {selectedYear}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-xl size-9">
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-none ring-1 ring-border/50 bg-card">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none ring-1 ring-border/50">
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={(i + 1).toString()} className="rounded-lg">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px] h-10 rounded-xl border-none ring-1 ring-border/50 bg-card">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none ring-1 ring-border/50">
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()} className="rounded-lg">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Budget Usage Overview */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TargetIcon className="size-5 text-primary" />
            Active Usage
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {usageLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border shadow-none ring-1 ring-border/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : usageData?.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center border-2 border-dashed border-border/50 rounded-[32px] bg-muted/5">
                <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center">
                  <TargetIcon className="size-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">No budgets found</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    There are no budgets active for this period.
                  </p>
                </div>
              </div>
            ) : (
              usageData?.map((item) => (
                <Card key={item.id} className="border shadow-none ring-1 ring-border/50 overflow-hidden group hover:ring-primary/30 transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          item.percentageUsed > 90 ? "bg-red-50 text-red-600" : 
                          item.percentageUsed > 75 ? "bg-orange-50 text-orange-600" : 
                          "bg-primary/10 text-primary"
                        )}>
                          <div className={cn(
                            "size-1.5 rounded-full",
                            item.percentageUsed > 90 ? "bg-red-600" : 
                            item.percentageUsed > 75 ? "bg-orange-600" : 
                            "bg-primary"
                          )} />
                        </div>
                        <span className="font-bold text-base">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-sm">{formatCurrency(item.spent)}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Spent</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 ease-out rounded-full",
                            item.percentageUsed > 100 ? "bg-destructive" :
                            item.percentageUsed > 90 ? "bg-red-500" :
                            item.percentageUsed > 75 ? "bg-orange-500" :
                            "bg-primary"
                          )}
                          style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className={cn(
                          item.percentageUsed > 90 ? "text-red-600" :
                          item.percentageUsed > 75 ? "text-orange-600" :
                          "text-muted-foreground"
                        )}>
                          {item.percentageUsed}% CONSUMED
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.budget)} Limit
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/30 flex justify-between items-center">
                      <span className="text-[11px] font-medium text-muted-foreground">Remaining</span>
                      <span className={cn(
                        "text-xs font-bold",
                        item.remaining < 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {formatCurrency(item.remaining)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: All Budgets Management */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="size-5 text-primary" />
            Budget Settings
          </h2>
          
          <Card className="border shadow-none ring-1 ring-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50 h-12">
                      <th className="text-left font-bold text-[11px] uppercase tracking-widest text-muted-foreground pl-6">Category</th>
                      <th className="text-left font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Limit</th>
                      <th className="text-left font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Period</th>
                      <th className="text-left font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Start Date</th>
                      <th className="text-right font-bold text-[11px] uppercase tracking-widest text-muted-foreground pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {budgetsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="h-16">
                          <td className="pl-6"><Skeleton className="h-4 w-24 rounded" /></td>
                          <td><Skeleton className="h-4 w-20 rounded" /></td>
                          <td><Skeleton className="h-6 w-16 rounded-full" /></td>
                          <td><Skeleton className="h-4 w-24 rounded" /></td>
                          <td className="pr-6 text-right"><Skeleton className="h-8 w-8 rounded-xl ml-auto" /></td>
                        </tr>
                      ))
                    ) : budgetsData?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-32 text-center text-muted-foreground italic">
                          No budget configurations found.
                        </td>
                      </tr>
                    ) : (
                      budgetsData?.map((budget) => (
                        <tr key={budget.id} className="group hover:bg-muted/30 transition-all h-16">
                          <td className="pl-6 font-bold text-foreground">
                            {categoriesMap[budget.category_id] || "Loading..."}
                          </td>
                          <td className="font-bold text-primary">
                            {formatCurrency(budget.amount)}
                          </td>
                          <td>
                            <Badge variant="secondary" className="rounded-md font-bold uppercase text-[10px] bg-muted/50 border-none">
                              {budget.period}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground font-medium text-xs">
                            {format(new Date(budget.start_date), "MMM d, yyyy")}
                          </td>
                          <td className="pr-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-background transition-all hover:ring-1 hover:ring-border">
                                  <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl border-none shadow-xl ring-1 ring-border/50">
                                <DropdownMenuItem onClick={() => handleEdit(budget)} className="gap-2 cursor-pointer rounded-lg">
                                  <PencilIcon className="size-3.5 text-muted-foreground" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/50" />
                                <DropdownMenuItem 
                                  onClick={() => setDeletingBudgetId(budget.id)} 
                                  className="gap-2 cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <TrashIcon className="size-3.5" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controlled Dialog for Editing */}
      <AddBudgetDialog 
        budget={editingBudget}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingBudget(undefined)
        }}
        trigger={<span className="hidden" />}
      />

      {/* Alert Dialog for Deletion Confirmation */}
      <AlertDialog open={!!deletingBudgetId} onOpenChange={(open) => !open && setDeletingBudgetId(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8 ring-1 ring-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-base">
              This action cannot be undone. This will permanently delete the budget limit for this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl h-12 bg-red-600 hover:bg-red-700 font-semibold"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Budget"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}