"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { apiProxy } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Target01Icon, Money03Icon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { BudgetUsageData } from "@/types/api"

export function BudgetUsage() {
  const { data: budgetsData, isLoading: loading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await apiProxy<BudgetUsageData[]>("/transactions/budgets/usage", "GET")
      return response.data
    }
  })

  const budgets = budgetsData || []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
  }

  return (
    <Card className="border-none ring-1 ring-border/50 bg-card/30 backdrop-blur-sm rounded-[32px] shadow-none overflow-hidden h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Budget Usage</CardTitle>
            <CardDescription>Track your spending against set budgets</CardDescription>
          </div>
          <HugeiconsIcon icon={Target01Icon} className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 overflow-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-muted">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground text-center">
            No budgets set. <br /> Start by creating a budget for a category.
          </div>
        ) : (
          budgets.map((item) => (
            <div key={item.category} className="space-y-3 group">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    item.percentageUsed > 90 ? 'bg-red-50 text-red-600' : 
                    item.percentageUsed > 75 ? 'bg-orange-50 text-orange-600' : 
                    'bg-primary/10 text-primary'
                  }`}>
                    <HugeiconsIcon icon={Money03Icon} className="size-3.5" />
                  </div>
                  <span className="font-semibold text-foreground tracking-tight">{item.category}</span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="font-bold text-sm">{formatCurrency(item.spent)}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    of {formatCurrency(item.budget)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/30">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      item.percentageUsed > 100 ? 'bg-destructive' : 
                      item.percentageUsed > 90 ? 'bg-red-500' : 
                      item.percentageUsed > 75 ? 'bg-orange-500' : 
                      'bg-primary'
                    }`}
                    style={{ width: `${Math.min(item.percentageUsed, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className={`${
                    item.percentageUsed > 90 ? 'text-red-600' : 
                    item.percentageUsed > 75 ? 'text-orange-600' : 
                    'text-muted-foreground'
                  }`}>
                    {item.percentageUsed}% CONSUMED
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.remaining)} Left
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
