"use client"

import * as React from "react"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  MoreHorizontalIcon, 
  TrashIcon,
  RefreshCcwIcon,
  CalendarIcon,
  ArrowRightIcon
} from "lucide-react"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { apiProxy } from "@/lib/api"
import { RecurringTransaction } from "@/types/api"
import { cn } from "@/lib/utils"

export default function RecurringPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const { data: recurringData, isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: async () => {
      const response = await apiProxy<RecurringTransaction[]>("/transactions/recurring", "GET")
      return response.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiProxy(`/transactions/recurring/${id}`, "DELETE")
    },
    onSuccess: () => {
      toast.success("Recurring expense cancelled")
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      setDeletingId(null)
    },
    onError: () => {
      toast.error("Failed to cancel recurring expense")
    }
  })

  const recurring = recurringData || []

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 bg-background/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Recurring Bills
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your automated subscriptions and scheduled expenses.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['recurring'] })}
            className="h-10 rounded-xl px-4 gap-2 border-none ring-1 ring-border/50 hover:bg-muted/50 transition-all group"
          >
            <RefreshCcwIcon className={cn("size-4 text-muted-foreground transition-all duration-500", isLoading && "animate-spin text-primary")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="group rounded-2xl border bg-card/30 backdrop-blur-sm overflow-hidden transition-all flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-none h-12">
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground pl-6">Description</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Category</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Frequency</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Amount</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Last Run</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/30 h-16">
                  <TableCell className="pl-6"><Skeleton className="h-5 w-[200px] rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-[90px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-[80px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[70px] rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[110px] rounded-lg" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-xl ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : recurring.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center">
                      <RefreshCcwIcon className="size-8 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">No recurring bills found</h3>
                      <p className="text-sm text-muted-foreground">Setup recurring expenses from the transactions page.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              recurring.map((item) => (
                <TableRow key={item.id} className="group/row border-border/30 h-16 hover:bg-muted/30 transition-all">
                  <TableCell className="pl-6 font-semibold text-sm">
                    <div className="flex items-center gap-3">
                       <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <RefreshCcwIcon className="size-4 text-primary" />
                       </div>
                       <span className="group-hover/row:text-primary transition-colors">{item.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full font-medium bg-muted/50 text-muted-foreground border-none px-3 py-0.5 capitalize">
                      {item.category_name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {item.frequency}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-base tabular-nums tracking-tight">
                    ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium text-xs">
                    <div className="flex items-center gap-2">
                       <CalendarIcon className="size-3.5" />
                       <span>{item.last_run ? format(new Date(item.last_run), "MMM dd, yyyy") : "Never run"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-background transition-all hover:ring-1 hover:ring-border">
                          <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl border-none shadow-xl ring-1 ring-border/50">
                        <DropdownMenuItem 
                          onClick={() => setDeletingId(item.id)} 
                          className="gap-2 cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <TrashIcon className="size-3.5" />
                          <span>Cancel Billing</span>
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

      {/* Alert Dialog for Deletion Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-[32px] border-none p-8 ring-1 ring-border/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Cancel recurring billing?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-base">
              This will stop all future automated transactions for this billing cycle. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-semibold">Keep Active</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl h-12 bg-red-600 hover:bg-red-700 font-semibold"
            >
              Cancel Billing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}