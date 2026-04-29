"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Settings02Icon, 
  MoreHorizontalIcon, 
  Menu01Icon, 
  Add02Icon,
  Calendar01Icon
} from "@hugeicons/core-free-icons"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { apiProxy } from "@/lib/api"
import { BudgetUsage } from "@/components/dashboard/budget-usage"
import { RefreshCcwIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

import { useQuery } from "@tanstack/react-query"
import { TransactionResponse } from "@/types/api"

export default function Page() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [endDate, setEndDate] = React.useState<Date | undefined>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
  })

  const startStr = startDate ? format(startDate, "yyyy-MM-dd") : ""
  const endStr = endDate ? format(endDate, "yyyy-MM-dd") : ""

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', startStr, endStr],
    queryFn: async () => {
      const query = startStr && endStr 
        ? `&startDate=${startStr}&endDate=${endStr}`
        : "";
      const response = await apiProxy<TransactionResponse>(`/transactions/getAllTransactions?page=1&limit=5${query}`, "GET")
      return response.data.transactions
    },
    enabled: !!startStr && !!endStr
  })

  const transactions = transactionsData || []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4 self-center" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Financial Summary</h2>
            <div className="flex items-center gap-1.5 sm:gap-3 bg-card border rounded-lg p-1 shadow-sm w-full sm:w-auto overflow-hidden">
              <div className="flex items-center gap-2 px-1.5 sm:px-2 text-muted-foreground shrink-0">
                <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                <span className="text-sm font-medium hidden md:inline">Date Range</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-1 sm:gap-2 flex-1">
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!startDate}
                      className="flex-1 sm:w-[120px] h-8 justify-between text-left font-normal text-[10px] sm:text-xs data-[empty=true]:text-muted-foreground border-0 shadow-none bg-transparent hover:bg-muted/50 px-2"
                    >
                      <span className="truncate">{startDate ? format(startDate, "MMM d, yy") : "Start"}</span>
                      <ChevronDownIcon className="size-3 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      defaultMonth={startDate}
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground text-[10px] font-medium shrink-0">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!endDate}
                      className="flex-1 sm:w-[120px] h-8 justify-between text-left font-normal text-[10px] sm:text-xs data-[empty=true]:text-muted-foreground border-0 shadow-none bg-transparent hover:bg-muted/50 px-2"
                    >
                      <span className="truncate">{endDate ? format(endDate, "MMM d, yy") : "End"}</span>
                      <ChevronDownIcon className="size-3 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      defaultMonth={endDate}
                    />
                  </PopoverContent>
                </Popover>

              </div>
            </div>
          </div>

          <OverviewCards startDate={startStr} endDate={endStr} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <CategoryPieChart startDate={startStr} endDate={endStr} />
            </div>
            <div className="lg:col-span-2">
              <SpendingChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <BudgetUsage />
            </div>
            <div className="lg:col-span-2 space-y-4">


              <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="font-medium">Description</TableHead>
                      <TableHead className="font-medium">Category</TableHead>
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Amount</TableHead>
                      <TableHead className="font-medium">Date</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[80px] rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[70px] rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        </TableRow>
                      ))
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No transactions found for this period.</TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <HugeiconsIcon icon={Menu01Icon} className="size-3.5 text-muted-foreground cursor-grab" />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.description}</span>
                              {item.recurring_id && (
                                <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-tighter">
                                  <RefreshCcwIcon className="size-2.5" />
                                  <span>Recurring</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-md font-normal bg-muted text-muted-foreground px-2 py-0.5 capitalize">
                              {item.category_name || "Uncategorized"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`rounded-md font-normal gap-1.5 px-2 py-0.5 capitalize ${item.type === "income" ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                              <div className={`size-1.5 rounded-full ${item.type === "income" ? "bg-green-600" : "bg-red-600"}`} />
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-semibold ${item.type === "income" ? "text-green-600" : ""}`}>
                            {item.type === "income" ? "+" : ""}₹{Number(item.amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(item.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4 text-muted-foreground cursor-pointer" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


import { ArrowLeft01Icon, ArrowRight01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"



