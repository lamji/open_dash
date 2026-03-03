# Shadcn Block: Date Picker with Chart Filter

## 🎯 Purpose
Provides a sophisticated implementation pattern for a dashboard card that combines a `BarChart` with a `DateRangePicker`. This pattern demonstrates how to filter data dynamically using a `Popover` calendar within a `Card` container.

## 📦 Dependencies
```bash
npm install lucide-react recharts
npx shadcn@latest add button calendar card chart popover
```

## 🛠️ Implementation Example (`date-picker-13.tsx`)

```tsx
'use client'

import { useState, useMemo } from 'react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const chartData = [
  { date: '2025-01-01', visitors: 178 },
  // ... rest of chartData
]

const total = chartData.reduce((acc, curr) => acc + curr.visitors, 0)

const chartConfig = {
  visitors: {
    label: 'Visitors',
    color: 'var(--color-primary)'
  }
} satisfies ChartConfig

const ChartFilterDemo = () => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 0, 31)
  })

  const filteredData = useMemo(() => {
    if (!range?.from && !range?.to) {
      return chartData
    }

    return chartData.filter(item => {
      const date = new Date(item.date)
      return date >= range.from! && date <= range.to!
    })
  }, [range])

  return (
    <Card className='@container/card w-full max-w-xl'>
      <CardHeader className='flex flex-col border-b @md/card:grid'>
        <CardTitle>Web Analytics</CardTitle>
        <CardDescription>Showing total visitors for this month.</CardDescription>
        <CardAction className='mt-2 @md/card:mt-0'>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <CalendarIcon />
                {range?.from && range?.to
                  ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                  : 'January 2025'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto overflow-hidden p-0' align='end'>
              <Calendar
                className='w-full'
                mode='range'
                defaultMonth={range?.from}
                selected={range}
                onSelect={setRange}
                startMonth={range?.from}
                fixedWeeks
                showOutsideDays
                disabled={{
                  after: new Date(2025, 0, 31),
                  before: new Date(2025, 0, 1)
                }}
              />
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent className='px-4'>
        <ChartContainer config={chartConfig} className='aspect-auto h-62 w-full'>
          <BarChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={value => new Date(value).toLocaleDateString('en-US', { day: 'numeric' })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='visitors'
                  labelFormatter={value => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                />
              }
            />
            <Bar dataKey='visitors' fill={`var(--color-visitors)`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='border-t'>
        <div className='text-sm'>
          You had <span className='font-semibold'>{total.toLocaleString()}</span> visitors for the month of January.
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartFilterDemo
```

## 📋 Rules
1. **Dynamic Filtering**: Use `useMemo` to filter the chart data based on the `Calendar` range state.
2. **Responsive Card**: Use Tailwind `@container` queries (e.g., `@md/card:grid`) to adjust the layout based on the card's width rather than the viewport.
3. **Chart Integration**: Ensure `chartConfig` and `ChartContainer` are used correctly according to Shadcn UI Charts patterns.
4. **Data Formatting**: Use `toLocaleDateString` for both axis ticks and tooltip labels to ensure consistent data presentation.
