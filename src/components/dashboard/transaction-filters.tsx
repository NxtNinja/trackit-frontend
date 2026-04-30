"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, FilterIcon, XIcon, ChevronDownIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
}

interface TransactionFiltersProps {
  onFiltersChange: (filters: {
    type?: string
    categoryId?: string
    startDate?: string
    endDate?: string
  }) => void
}

export function TransactionFilters({ onFiltersChange }: TransactionFiltersProps) {
  const [type, setType] = React.useState<string>("all")
  const [categoryId, setCategoryId] = React.useState<string>("all")
  const [startDate, setStartDate] = React.useState<Date | undefined>()
  const [endDate, setEndDate] = React.useState<Date | undefined>()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiProxy<Category[]>("/category/getCategories", "GET")
      return response.data
    }
  })

  const handleReset = () => {
    setType("all")
    setCategoryId("all")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  React.useEffect(() => {
    onFiltersChange({
      type: type === "all" ? undefined : type,
      categoryId: categoryId === "all" ? undefined : categoryId,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    })
  }, [type, categoryId, startDate, endDate, onFiltersChange])

  const hasActiveFilters = type !== "all" || categoryId !== "all" || !!startDate || !!endDate

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Type Filter */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[140px] h-10 bg-card border-none ring-1 ring-border/50 hover:ring-primary/30 transition-all rounded-xl px-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "size-1.5 rounded-full",
                type === "income" ? "bg-green-500" : type === "expense" ? "bg-red-500" : "bg-muted-foreground"
              )} />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[180px] h-10 bg-card border-none ring-1 ring-border/50 hover:ring-primary/30 transition-all rounded-xl px-4">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none">
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Group */}
        <div className="flex items-center gap-1 bg-card border-none ring-1 ring-border/50 rounded-xl p-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-lg hover:bg-muted/50 transition-colors",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {startDate ? format(startDate, "MMM d") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl border-none" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="h-4 w-px bg-border/50 mx-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-lg hover:bg-muted/50 transition-colors",
                  !endDate && "text-muted-foreground"
                )}
              >
                {endDate ? format(endDate, "MMM d") : "End Date"}
                <ChevronDownIcon className="ml-2 h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl border-none" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
          >
            <XIcon className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Chips (Optional but good for UI) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
          {type !== "all" && (
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-none flex items-center gap-1">
              <span>Type: {type}</span>
              <XIcon className="size-3 cursor-pointer" onClick={() => setType("all")} />
            </Badge>
          )}
          {categoryId !== "all" && (
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-none flex items-center gap-1">
              <span>Category: {categories?.find(c => c.id === categoryId)?.name}</span>
              <XIcon className="size-3 cursor-pointer" onClick={() => setCategoryId("all")} />
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-none flex items-center gap-1">
              <span>Date: {startDate ? format(startDate, "MMM d") : "?"} - {endDate ? format(endDate, "MMM d") : "?"}</span>
              <XIcon className="size-3 cursor-pointer" onClick={() => { setStartDate(undefined); setEndDate(undefined); }} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ className, variant, ...props }: React.ComponentProps<"div"> & { variant?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}
