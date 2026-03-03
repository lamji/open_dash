# Shadcn UI: Data Table Pricing Variant

## 🎯 Purpose
Provides a simplified implementation pattern for exhibiting data (like pricing history or transaction lists) using Shadcn UI's `Table` components. This pattern is optimized for clarity and responsive data presentation.

## 📦 Dependencies
```bash
npx shadcn@latest add table badge
```

## 🛠️ Implementation Example (`table-pricing.tsx`)

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
]

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>
              <Badge variant={invoice.paymentStatus === "Paid" ? "default" : "secondary"}>
                {invoice.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## 📋 Rules
1. **Column Alignment**: Use `text-right` on table cells containing numerical data (amounts) for better readability.
2. **Fixed Width**: Use classes like `w-[100px]` on specific `TableHead` elements to ensure the layout remains stable.
3. **Semantic Highlighting**: Use `Badge` components within `TableCell` to visually represent statuses (Paid, Pending, etc.).
4. **Captions**: Always include a `TableCaption` for accessibility and context.
