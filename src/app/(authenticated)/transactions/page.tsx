"use client"

import * as React from "react"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  MoreHorizontalIcon, 
  RefreshCcwIcon, 
  SearchIcon, 
  DownloadIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { TransactionFilters } from "@/components/dashboard/transaction-filters"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiProxy } from "@/lib/api"
import { TransactionResponse, Transaction } from "@/types/api"
import { cn } from "@/lib/utils"

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = React.useState<{
    type?: string
    categoryId?: string
    startDate?: string
    endDate?: string
  }>({})
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | undefined>()
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = React.useState<string | null>(null)

  // Reset page when filters, search or limit change
  React.useEffect(() => {
    setPage(1)
  }, [filters, search, limit])

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters, search, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      
      if (filters.type) params.append("type", filters.type)
      if (filters.categoryId) params.append("categoryId", filters.categoryId)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (search) params.append("search", search)

      const response = await apiProxy<TransactionResponse>(`/transactions/getAllTransactions?${params.toString()}`, "GET")
      return response.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiProxy(`/transactions/deleteTransaction/${id}`, "DELETE")
    },
    onSuccess: () => {
      toast.success("Transaction deleted successfully")
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      setDeletingTransactionId(null)
    },
    onError: () => {
      toast.error("Failed to delete transaction")
    }
  })

  const recurringMutation = useMutation({
    mutationFn: async ({ id, frequency }: { id: string, frequency: string }) => {
      return await apiProxy(`/transactions/recurring/from-transaction/${id}`, "POST", { frequency })
    },
    onSuccess: () => {
      toast.success("Recurring expense setup successfully")
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to setup recurring expense")
    }
  })

  const transactions = transactionsData?.transactions || []
  const totalPages = transactionsData?.totalPages || 1
  const total = transactionsData?.total || 0

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsEditDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deletingTransactionId) {
      deleteMutation.mutate(deletingTransactionId)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Analyze and manage your cash flow with precision.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['transactions'] })}
            className="h-10 rounded-xl px-4 gap-2 border-none ring-1 ring-border/50 hover:bg-muted/50 transition-all group"
          >
            <RefreshCcwIcon className={cn("size-4 text-muted-foreground transition-all duration-500", isLoading && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-10 rounded-xl px-4 gap-2 hidden md:flex border-none ring-1 ring-border/50 hover:bg-muted/50 transition-all">
            <DownloadIcon className="size-4 text-muted-foreground" />
            <span>Export</span>
          </Button>
          <AddTransactionDialog />
        </div>
      </div>

      {/* Control Bar */}
      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TransactionFilters onFiltersChange={setFilters} />
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search descriptions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-card border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all"
              />
            </div>
            
            <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
              <SelectTrigger className="w-[110px] h-10 bg-card border-none ring-1 ring-border/50 rounded-xl font-medium focus:ring-primary/50">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl ring-1 ring-border/50">
                {[5, 10, 20, 50, 100].map((v) => (
                  <SelectItem key={v} value={v.toString()} className="rounded-lg cursor-pointer">
                    {v} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="group rounded-2xl border bg-card/30 backdrop-blur-sm overflow-hidden transition-all flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none h-12">
                  <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground pl-6">Description</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Category</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Type</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Date</TableHead>
                  <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={i} className="border-border/30 h-16">
                      <TableCell className="pl-6"><Skeleton className="h-5 w-[200px] rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-[90px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-[80px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[70px] rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[110px] rounded-lg" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-xl ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                        <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center">
                          <SearchIcon className="size-8 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">No transactions found</h3>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((item) => (
                    <TableRow key={item.id} className="group/row border-border/30 h-16 hover:bg-muted/30 transition-all">
                      <TableCell className="pl-6 font-semibold text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="group-hover/row:text-primary transition-colors">{item.description}</span>
                          {item.recurring_id && (
                            <div className="flex items-center gap-1.5 text-[10px] text-primary/70 font-bold uppercase tracking-widest">
                              <RefreshCcwIcon className="size-2.5" />
                              <span>Recurring</span>
                            </div>
                          )}
                          {recurringMutation.isPending && recurringMutation.variables?.id === item.id && (
                            <div className="flex items-center gap-1.5 text-[10px] text-orange-500 font-bold uppercase tracking-widest animate-pulse">
                              <RefreshCcwIcon className="size-2.5 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full font-medium bg-muted/50 text-muted-foreground border-none px-3 py-0.5 capitalize">
                          {item.category_name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                          item.type === "income" 
                            ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                            : "bg-red-500/10 text-red-600 border border-red-500/20"
                        )}>
                          <div className={cn("size-1.5 rounded-full", item.type === "income" ? "bg-green-500" : "bg-red-500")} />
                          {item.type}
                        </div>
                      </TableCell>
                      <TableCell className={cn(
                        "font-bold text-base tabular-nums tracking-tight",
                        item.type === "income" ? "text-green-600" : "text-foreground"
                      )}>
                        {item.type === "income" ? "+" : "-"}₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium text-xs">
                        {format(new Date(item.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-9 rounded-xl hover:bg-background transition-all hover:ring-1 hover:ring-border"
                              disabled={recurringMutation.isPending && recurringMutation.variables?.id === item.id}
                            >
                              <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-xl ring-1 ring-border/50">
                            <DropdownMenuItem onClick={() => handleEdit(item)} className="gap-2 cursor-pointer rounded-lg">
                              <PencilIcon className="size-3.5 text-muted-foreground" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            
                            {!item.recurring_id && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger 
                                  className="gap-2 rounded-lg"
                                  disabled={recurringMutation.isPending}
                                >
                                  <RefreshCcwIcon className="size-3.5 text-muted-foreground" />
                                  <span>Make Recurring</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="rounded-xl border-none shadow-xl ring-1 ring-border/50 p-1">
                                  {["daily", "weekly", "monthly"].map((freq) => (
                                    <DropdownMenuItem 
                                      key={freq}
                                      onClick={() => recurringMutation.mutate({ id: item.id, frequency: freq })}
                                      className="capitalize cursor-pointer rounded-lg"
                                    >
                                      {freq}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            )}

                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem 
                              onClick={() => setDeletingTransactionId(item.id)} 
                              className="gap-2 cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <TrashIcon className="size-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination UI */}
          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-foreground">{total === 0 ? 0 : (page - 1) * limit + 1}</span> to <span className="text-foreground">{Math.min(page * limit, total)}</span> of <span className="text-foreground">{total}</span> transactions
            </p>
            {totalPages > 1 && (
              <Pagination className="w-auto mx-0">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={cn(
                        "rounded-xl border-none ring-1 ring-border/50 hover:bg-muted/50 cursor-pointer transition-all h-9 px-3",
                        page === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum = page
                    if (page <= 3) pageNum = i + 1
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = page - 2 + i

                    if (pageNum <= 0 || pageNum > totalPages) return null

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className={cn(
                            "rounded-xl border-none ring-1 ring-border/50 hover:bg-muted/50 cursor-pointer transition-all h-9 w-9",
                            page === pageNum && "bg-primary text-primary-foreground ring-primary hover:bg-primary/90"
                          )}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={cn(
                        "rounded-xl border-none ring-1 ring-border/50 hover:bg-muted/50 cursor-pointer transition-all h-9 px-3",
                        page === totalPages && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* Controlled Dialog for Editing */}
      <AddTransactionDialog 
        transaction={editingTransaction}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingTransaction(undefined)
        }}
        trigger={<span className="hidden" />}
      />

      {/* Alert Dialog for Deletion Confirmation */}
      <AlertDialog open={!!deletingTransactionId} onOpenChange={(open) => !open && setDeletingTransactionId(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-base">
              This action cannot be undone. This will permanently delete the transaction from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl h-12 bg-red-600 hover:bg-red-700 font-semibold"
            >
              Delete Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}