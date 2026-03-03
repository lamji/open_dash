# Shadcn UI: Select & Radio Group Variants

## 🎯 Purpose
Provides standardized implementation patterns for `Select` (dropdowns) and `RadioGroup` (toggle selection) components. Essential for forms requiring plan selection, date picking (expiry months), or categorization.

## 📦 Dependencies
```bash
npx shadcn@latest add select radio-group label
```

## 🛠️ Implementation Examples

### 1. Select for Expiry Date (`select-expiry.tsx`)
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const ExpirySelectDemo = () => {
  return (
    <div className="grid gap-2">
      <Label>Expiration Date</Label>
      <div className="grid grid-cols-2 gap-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i} value={`${i + 1}`}>
                {new Date(0, i).toLocaleString('en', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(10)].map((_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <SelectItem key={year} value={`${year}`}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
```

### 2. Radio Group for Plan Selection (`radio-group-plans.tsx`)
```tsx
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const PlanRadioGroupDemo = () => {
  return (
    <RadioGroup defaultValue="pro" className="grid grid-cols-3 gap-4">
      <div>
        <RadioGroupItem value="starter" id="starter" className="peer sr-only" />
        <Label
          htmlFor="starter"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <span className="text-sm font-semibold">Starter</span>
          <span className="text-xs text-muted-foreground">$0/mo</span>
        </Label>
      </div>
      <div>
        <RadioGroupItem value="pro" id="pro" className="peer sr-only" />
        <Label
          htmlFor="pro"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <span className="text-sm font-semibold">Pro</span>
          <span className="text-xs text-muted-foreground">$19/mo</span>
        </Label>
      </div>
      <div>
        <RadioGroupItem value="enterprise" id="enterprise" className="peer sr-only" />
        <Label
          htmlFor="enterprise"
          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <span className="text-sm font-semibold">Enterprise</span>
          <span className="text-xs text-muted-foreground">Custom</span>
        </Label>
      </div>
    </RadioGroup>
  )
}
```

## 📋 Rules
1. **Interactive Cards**: For plan selection, use `sr-only` on the `RadioGroupItem` and style the `Label` as a card. Use the `peer` selector and `peer-data-[state=checked]` to update the border color.
2. **Grid Layout**: Use `grid` with `gap` to organize multiple `Select` components (like Month/Year pairs) or `RadioGroup` cards.
3. **Placeholder**: Always provide a clear `placeholder` in `SelectValue` to guide the user.
4. **Validation**: When using within a form, use `FormField` to wrap these components to handle state and error messages via React Hook Form.
