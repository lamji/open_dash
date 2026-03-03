# Shadcn UI: Basic Breadcrumb Variant

## 🎯 Purpose
Provides a standardized implementation pattern for the Shadcn UI `Breadcrumb` component. This variant demonstrates a standard hierarchical navigation trail.

## 📦 Dependencies
```bash
npx shadcn@latest add breadcrumb
```

## 🛠️ Implementation Example (`breadcrumb-01.tsx`)

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

const BreadcrumbDemo = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='#'>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href='#'>Documents</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Add Document</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbDemo
```

## 📋 Rules
1. Uses `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, and `BreadcrumbSeparator` Shadcn components.
2. `BreadcrumbLink` should be used for all parent levels that have an active link.
3. `BreadcrumbPage` should be used for the current page/endpoint (usually the last item) as it provides specific accessibility attributes for the active state.
4. `BreadcrumbSeparator` must be placed between each `BreadcrumbItem`.
