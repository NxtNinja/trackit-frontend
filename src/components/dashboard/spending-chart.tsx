"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { apiProxy } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { MonthlyTrendData } from "@/types/api"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function SpendingChart() {
  const { data: rawData, isLoading: loading } = useQuery({
    queryKey: ['monthly-trends'],
    queryFn: async () => {
      const response = await apiProxy<MonthlyTrendData[]>("/transactions/analytics/monthly", "GET")
      return response.data
    }
  })

  const chartData = React.useMemo(() => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return []

    // Sort response by month and filter out invalid entries
    const sortedData = [...rawData]
      .filter(item => item && typeof item.month === 'string' && item.month.includes('-'))
      .sort((a, b) => a.month.localeCompare(b.month))
    
    if (sortedData.length === 0) return []

    // Earliest month
    const earliestMonth = sortedData[0].month
    const monthParts = earliestMonth.split("-")
    if (monthParts.length < 2) return []

    const earliestYear = Number(monthParts[0])
    const earliestMonthNum = Number(monthParts[1])
    
    if (isNaN(earliestYear) || isNaN(earliestMonthNum)) return []
    
    const currentMonthDate = new Date()
    const currentYear = currentMonthDate.getFullYear()
    const currentMonthNum = currentMonthDate.getMonth() + 1
    
    const generatedMonths = []
    let iterYear = earliestYear
    let iterMonth = earliestMonthNum
    
    // Safety break to prevent infinite loops if data is weird
    let safetyCounter = 0
    while (safetyCounter < 120 && (iterYear < currentYear || (iterYear === currentYear && iterMonth <= currentMonthNum))) {
      const monthStr = `${iterYear}-${String(iterMonth).padStart(2, '0')}`
      generatedMonths.push(monthStr)
      
      iterMonth++
      if (iterMonth > 12) {
        iterMonth = 1
        iterYear++
      }
      safetyCounter++
    }

    // Ensure at least 2 months so the line chart can draw a line
    if (generatedMonths.length === 1) {
      let prevMonth = earliestMonthNum - 1
      let prevYear = earliestYear
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear -= 1
      }
      generatedMonths.unshift(`${prevYear}-${String(prevMonth).padStart(2, '0')}`)
    }

    // Merge API data
    const dataMap = new Map(sortedData.map((item) => [item.month, item]))
    
    return generatedMonths.map(monthStr => {
      const [year, monthNum] = monthStr.split("-")
      const date = new Date(Number(year), Number(monthNum) - 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const item = dataMap.get(monthStr)
      return {
        month: monthName,
        income: item ? Number(item.income || 0) : 0,
        expense: item ? Number(item.expense || 0) : 0,
      }
    })
  }, [rawData])

  return (
    <Card className="flex flex-col h-full border shadow-sm">
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>Monthly Income vs Expenses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {loading ? (
          <div className="h-[300px] w-full flex flex-col gap-4">
             <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No trend data found.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="income"
                type="natural"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="expense"
                type="natural"
                stroke="var(--color-expense)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
