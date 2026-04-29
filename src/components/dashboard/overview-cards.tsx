"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Wallet01Icon, 
  ArrowUp01Icon,
  ArrowDown01Icon
} from "@hugeicons/core-free-icons"
import { apiProxy } from "@/lib/api"

interface OverviewCardsProps {
  startDate: string
  endDate: string
}

import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { SummaryData } from "@/types/api"

export function OverviewCards({ startDate, endDate }: OverviewCardsProps) {
  const { data: summaryData, isLoading: loading } = useQuery({
    queryKey: ['summary', startDate, endDate],
    queryFn: async () => {
      const query = startDate && endDate 
        ? `?startDate=${startDate}&endDate=${endDate}`
        : "";
      const response = await apiProxy<SummaryData>(`/transactions/analytics/summary${query}`, "GET")
      return response.data
    },
    enabled: !!startDate && !!endDate
  })

  const summary = summaryData || { totalIncome: 0, totalExpense: 0, balance: 0 }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <Badge variant="secondary" className="bg-muted text-foreground flex items-center gap-1 font-medium">
              <HugeiconsIcon icon={Wallet01Icon} className="size-3" />
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${summary.balance < 0 ? 'text-destructive' : ''}`}>
              {loading ? <Skeleton className="h-9 w-[150px]" /> : formatCurrency(summary.balance)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>Overall net balance for period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 font-medium">
              <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-green-600">
              {loading ? <Skeleton className="h-9 w-[150px]" /> : formatCurrency(summary.totalIncome)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>Total earnings for period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 font-medium">
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-600">
              {loading ? <Skeleton className="h-9 w-[150px]" /> : formatCurrency(summary.totalExpense)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>Total spending for period</span>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}



