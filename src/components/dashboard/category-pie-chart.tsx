"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { apiProxy } from "@/lib/api"

import { useQuery } from "@tanstack/react-query"
import { CategoryAnalyticsData } from "@/types/api"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryPieChart({ startDate, endDate }: { startDate: string, endDate: string }) {
  const { data: rawData, isLoading: loading } = useQuery({
    queryKey: ['category-analytics', startDate, endDate],
    queryFn: async () => {
      const dateQuery = startDate && endDate 
        ? `&startDate=${startDate}&endDate=${endDate}` 
        : ""
      const response = await apiProxy<CategoryAnalyticsData[]>(`/transactions/analytics/category-wise?type=expense${dateQuery}`, "GET")
      return response.data
    },
    enabled: !!startDate && !!endDate
  })

  const { chartData, chartConfig } = React.useMemo(() => {
    if (!rawData) return { chartData: [], chartConfig: { amount: { label: "Amount" } } as ChartConfig }

    const config: ChartConfig = {
      amount: { label: "Amount" }
    }

    const formattedData = rawData.map((item, index) => {
      const safeKey = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
      
      config[safeKey] = {
        label: item.name,
        color: `var(--chart-${(index % 5) + 1})`
      }
      
      return {
        categoryKey: safeKey,
        categoryName: item.name,
        amount: Number(item.total),
        fill: `var(--color-${safeKey})`
      }
    })

    return { chartData: formattedData, chartConfig: config }
  }, [rawData])

  return (
    <Card className="flex flex-col h-full border shadow-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          {startDate && endDate ? `${startDate} to ${endDate}` : "All-time expense distribution"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {loading ? (
          <div className="flex items-center justify-center w-full h-[250px]">
            <Skeleton className="size-[200px] rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-muted-foreground text-sm py-10">No expenses found.</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px] w-full pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie 
                data={chartData} 
                dataKey="amount" 
                nameKey="categoryKey" 
                label 
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="categoryKey" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

