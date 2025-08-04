"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, Bar, BarChart, Area, AreaChart, XAxis, YAxis } from "recharts"
import { Loader2Icon } from "lucide-react"
import { cn } from "@/utils"
import {
  type ChartConfig,
  ChartContainer as ChartContainerPrimitive,
  ChartTooltip as ChartTooltipPrimitive,
  ChartTooltipContent as ChartTooltipContentPrimitive,
} from "@/components/chart"

// Define a type for common chart props
interface CommonChartProps {
  data: Record<string, any>[]
  chartConfig: ChartConfig
  className?: string
}

// Line Chart Component
interface LineChartProps extends CommonChartProps {
  lines: {
    dataKey: string
    stroke: string
    strokeWidth?: number
    dot?: boolean
  }[]
}

function LineChartComponent({ data, chartConfig, lines, className }: LineChartProps) {
  return (
    <ChartContainerPrimitive config={chartConfig} className={className}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltipPrimitive cursor={false} content={<ChartTooltipContentPrimitive hideLabel />} />
        {lines.map((lineProps, index) => (
          <Line key={index} type="monotone" dataKey={lineProps.dataKey} {...lineProps} />
        ))}
      </LineChart>
    </ChartContainerPrimitive>
  )
}

// Bar Chart Component
interface BarChartProps extends CommonChartProps {
  bars: {
    dataKey: string
    fill: string
    radius?: number
  }[]
}

function BarChartComponent({ data, chartConfig, bars, className }: BarChartProps) {
  return (
    <ChartContainerPrimitive config={chartConfig} className={className}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltipPrimitive cursor={false} content={<ChartTooltipContentPrimitive hideLabel />} />
        {bars.map((barProps, index) => (
          <Bar key={index} dataKey={barProps.dataKey} {...barProps} />
        ))}
      </BarChart>
    </ChartContainerPrimitive>
  )
}

// Area Chart Component
interface AreaChartProps extends CommonChartProps {
  areas: {
    dataKey: string
    fill: string
    stroke: string
  }[]
}

function AreaChartComponent({ data, chartConfig, areas, className }: AreaChartProps) {
  return (
    <ChartContainerPrimitive config={chartConfig} className={className}>
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltipPrimitive cursor={false} content={<ChartTooltipContentPrimitive hideLabel />} />
        {areas.map((areaProps, index) => (
          <Area key={index} type="monotone" dataKey={areaProps.dataKey} {...areaProps} />
        ))}
      </AreaChart>
    </ChartContainerPrimitive>
  )
}

// Chart components for specific use cases (e.g., Overview in Admin Dashboard)
export function OverviewChart() {
  const [revenueData, setRevenueData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const res = await fetch("/api/admin/revenue")
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        setRevenueData(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRevenueData()
  }, [])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2Icon className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading chart data: {error}</div>
  }

  return (
    <ChartContainerPrimitive config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={revenueData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis tickFormatter={(value) => `$${value / 1000}k`} tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltipPrimitive cursor={false} content={<ChartTooltipContentPrimitive indicator="dashed" />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainerPrimitive>
  )
}

// Re-exporting for direct use if needed
export { LineChartComponent, BarChartComponent, AreaChartComponent }

// Helper components for Chart (from shadcn/ui examples)
const ChartLegend = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof ChartPrimitive.ChartLegend>>(
  ({ className, ...props }, ref) => (
    <ChartPrimitive.ChartLegend
      ref={ref}
      className={cn("flex items-center justify-center gap-4", className)}
      {...props}
    />
  ),
)
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChartPrimitive.ChartLegendContent>
>(({ className, ...props }, ref) => (
  <ChartPrimitive.ChartLegendContent
    ref={ref}
    className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-2", className)}
    {...props}
  />
))
ChartLegendContent.displayName = "ChartLegendContent"

const ChartPrimitive = {
  ChartContainer: ChartContainerPrimitive,
  ChartTooltip: ChartTooltipPrimitive,
  ChartTooltipContent: ChartTooltipContentPrimitive,
  ChartLegend,
  ChartLegendContent,
}

type ChartConfigType = {
  [key: string]: {
    label: string
    color: string
    icon?: React.ElementType
  }
}
