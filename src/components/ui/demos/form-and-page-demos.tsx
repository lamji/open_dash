"use client";

import { useId, useMemo, useState } from "react";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  Clock8Icon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// ═══════════════════════════════════════════════════════════════
// INPUT DEMOS
// ═══════════════════════════════════════════════════════════════

// ─── 1. Input Basic Variants ────────────────────────────────

export const InputBasicDemo = () => {
  const id = useId();
  return (
    <div className="flex flex-col gap-6 max-w-xs">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-basic`}>Basic Input</Label>
        <Input
          id={`${id}-basic`}
          placeholder="Enter text..."
          data-test-id="input-basic"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-required`}>
          Required Input <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${id}-required`}
          placeholder="Required field"
          required
          data-test-id="input-required"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-disabled`}>Disabled Input</Label>
        <Input
          id={`${id}-disabled`}
          placeholder="Disabled"
          disabled
          data-test-id="input-disabled"
        />
      </div>
    </div>
  );
};

// ─── 2. Input Advanced Variants ─────────────────────────────

export const InputAdvancedDemo = () => {
  const id = useId();
  return (
    <div className="flex flex-col gap-6 max-w-xs">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-error`}>With Error</Label>
        <Input
          id={`${id}-error`}
          placeholder="Error state"
          aria-invalid="true"
          data-test-id="input-error"
        />
        <p className="text-destructive text-sm">This field is required.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-icon`}>With Start Icon</Label>
        <div className="relative">
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <CalendarIcon className="size-4" />
          </div>
          <Input
            id={`${id}-icon`}
            placeholder="With icon"
            className="pl-9"
            data-test-id="input-start-icon"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-addon`}>With Text Add-on</Label>
        <div className="flex">
          <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">
            https://
          </span>
          <Input
            id={`${id}-addon`}
            placeholder="example.com"
            className="rounded-l-none"
            data-test-id="input-addon"
          />
        </div>
      </div>
    </div>
  );
};

// ─── 3. Password Strength ───────────────────────────────────

const passwordRequirements = [
  { regex: /.{12,}/, text: "At least 12 characters" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, text: "At least 1 special character" },
];

export const InputPasswordStrengthDemo = () => {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  const strength = passwordRequirements.map((req) => ({
    met: req.regex.test(password),
    text: req.text,
  }));

  const strengthScore = useMemo(
    () => strength.filter((req) => req.met).length,
    [strength]
  );

  const getColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-destructive";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-amber-500";
    if (score === 4) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score <= 3) return "Medium password";
    if (score === 4) return "Strong password";
    return "Very strong password";
  };

  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor={id}>Password with strength</Label>
      <div className="relative mb-3">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-9"
          data-test-id="input-password-strength"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible((prev) => !prev)}
          className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
          data-test-id="input-password-toggle"
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
          <span className="sr-only">
            {isVisible ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
      <div className="mb-4 flex h-1 w-full gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-full flex-1 rounded-full transition-all duration-500 ease-out",
              index < strengthScore ? getColor(strengthScore) : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="text-foreground text-sm font-medium">
        {getText(strengthScore)}. Must contain:
      </p>
      <ul className="mb-4 space-y-1.5">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
            ) : (
              <XIcon className="text-muted-foreground size-4" />
            )}
            <span
              className={cn(
                "text-xs",
                req.met
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              )}
            >
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SELECT & RADIO DEMOS
// ═══════════════════════════════════════════════════════════════

export const SelectRadioDemo = () => {
  const id = useId();
  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-select`}>Expiry Date</Label>
        <div className="grid grid-cols-2 gap-4">
          <Select>
            <SelectTrigger data-test-id="select-month">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger data-test-id="select-year">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={String(2024 + i)}>
                  {2024 + i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Select Plan</legend>
        <RadioGroup defaultValue="pro" className="grid grid-cols-3 gap-3">
          {[
            { value: "basic", label: "Basic", price: "$9/mo" },
            { value: "pro", label: "Pro", price: "$19/mo" },
            { value: "enterprise", label: "Enterprise", price: "$49/mo" },
          ].map((plan) => (
            <Label
              key={plan.value}
              htmlFor={`${id}-${plan.value}`}
              className="border-input has-data-[state=checked]:border-primary cursor-pointer rounded-lg border p-4 text-center"
            >
              <RadioGroupItem
                id={`${id}-${plan.value}`}
                value={plan.value}
                className="sr-only"
                data-test-id={`radio-plan-${plan.value}`}
              />
              <span className="block text-sm font-medium">{plan.label}</span>
              <span className="text-muted-foreground text-xs">{plan.price}</span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TABS DEMO
// ═══════════════════════════════════════════════════════════════

export const TabsBasicDemo = () => {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" data-test-id="tabs-account">
          Account
        </TabsTrigger>
        <TabsTrigger value="password" data-test-id="tabs-password">
          Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="tab-name">Name</Label>
              <Input
                id="tab-name"
                defaultValue="John Doe"
                data-test-id="tabs-name-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tab-username">Username</Label>
              <Input
                id="tab-username"
                defaultValue="@johndoe"
                data-test-id="tabs-username-input"
              />
            </div>
            <Button data-test-id="tabs-save-account">Save changes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="tab-current">Current password</Label>
              <Input
                id="tab-current"
                type="password"
                data-test-id="tabs-current-pw"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tab-new">New password</Label>
              <Input
                id="tab-new"
                type="password"
                data-test-id="tabs-new-pw"
              />
            </div>
            <Button data-test-id="tabs-save-password">Save password</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// ═══════════════════════════════════════════════════════════════
// BREADCRUMB DEMO
// ═══════════════════════════════════════════════════════════════

export const BreadcrumbBasicDemo = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" data-test-id="breadcrumb-home">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#" data-test-id="breadcrumb-documents">
            Documents
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Add Document</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

// ═══════════════════════════════════════════════════════════════
// DATE PICKER DEMOS
// ═══════════════════════════════════════════════════════════════

// ─── Basic Date Picker ──────────────────────────────────────

export const DatePickerBasicDemo = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="date-basic" className="px-1">
        Date picker
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-basic"
            className="w-full justify-between font-normal"
            data-test-id="datepicker-basic-trigger"
          >
            {date ? date.toLocaleDateString() : "Pick a date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ─── Date Range Picker ──────────────────────────────────────

export const DatePickerRangeDemo = () => {
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="date-range" className="px-1">
        Range date picker
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-range"
            className="w-full justify-between font-normal"
            data-test-id="datepicker-range-trigger"
          >
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : "Pick a date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar mode="range" selected={range} onSelect={setRange} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ─── Date Picker with Icon ──────────────────────────────────

export const DatePickerWithIconDemo = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="date-icon" className="px-1">
        Date picker with icon
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-icon"
            className="w-full justify-between font-normal"
            data-test-id="datepicker-icon-trigger"
          >
            <span className="flex items-center">
              <CalendarIcon className="mr-2" />
              {date ? date.toLocaleDateString() : "Pick a date"}
            </span>
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TIME PICKER DEMOS
// ═══════════════════════════════════════════════════════════════

export const TimePickerNativeDemo = () => {
  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="time-native" className="px-1">
        Time input
      </Label>
      <Input
        type="time"
        id="time-native"
        step="1"
        defaultValue="08:30:00"
        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        data-test-id="timepicker-native"
      />
    </div>
  );
};

export const TimePickerWithIconDemo = () => {
  return (
    <div className="w-full max-w-xs space-y-2">
      <Label htmlFor="time-icon">Time input with icon</Label>
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Clock8Icon className="size-4" />
        </div>
        <Input
          type="time"
          id="time-icon"
          step="1"
          defaultValue="08:30:00"
          className="peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          data-test-id="timepicker-icon"
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PAGINATION DEMO
// ═══════════════════════════════════════════════════════════════

export const PaginationBasicDemo = () => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" data-test-id="pagination-prev" />
        </PaginationItem>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === 1}
              data-test-id={`pagination-page-${page}`}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" data-test-id="pagination-next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

// ═══════════════════════════════════════════════════════════════
// TABLE PRICING DEMO
// ═══════════════════════════════════════════════════════════════

const invoices = [
  { invoice: "INV001", paymentStatus: "Paid", totalAmount: "$250.00", paymentMethod: "Credit Card" },
  { invoice: "INV002", paymentStatus: "Pending", totalAmount: "$150.00", paymentMethod: "PayPal" },
  { invoice: "INV003", paymentStatus: "Unpaid", totalAmount: "$350.00", paymentMethod: "Bank Transfer" },
];

export const TablePricingDemo = () => {
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
          <TableRow key={invoice.invoice} data-test-id={`table-row-${invoice.invoice}`}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>
              <Badge
                variant={invoice.paymentStatus === "Paid" ? "default" : "secondary"}
                data-test-id={`table-status-${invoice.invoice}`}
              >
                {invoice.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// ═══════════════════════════════════════════════════════════════
// HERO SECTION DEMOS (Simplified Self-Contained)
// ═══════════════════════════════════════════════════════════════

export const HeroSectionInkDemo = () => {
  return (
    <section className="bg-muted py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
        <Badge variant="outline" className="text-sm font-normal">
          Trusted by 1,000,000+ professionals
        </Badge>
        <h1 className="text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl">
          Build Better Products with Insights that Drive Real Impact.
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Learn how to design, develop, launch, and grow digital products through practical knowledge.
        </p>
        <div className="flex items-center gap-3 p-2">
          <Input
            type="email"
            placeholder="Your email"
            className="bg-background h-10 sm:w-70"
            data-test-id="hero-ink-email"
          />
          <Button size="lg" data-test-id="hero-ink-subscribe">
            Subscribe
          </Button>
        </div>
      </div>
      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2">
        {[
          { date: "January 20, 2026", title: "Build with Empathy for Better User Outcomes", badge: "UI", author: "Allen Reilly" },
          { date: "May 20, 2025", title: "Write Code That Scales with Your Product", badge: "Coding", author: "Sara Wilkerson" },
        ].map((item, index) => (
          <Card key={index} className="group shadow-none">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="flex items-center gap-1.5">
                <CalendarDaysIcon className="text-muted-foreground size-4" />
                <span className="text-muted-foreground text-sm">{item.date}</span>
                <Badge className="bg-primary/10 text-primary ml-auto border-0 text-xs">
                  {item.badge}
                </Badge>
              </div>
              <h3 className="text-lg font-medium">{item.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.author}</span>
                <Button
                  size="icon"
                  variant="outline"
                  data-test-id={`hero-ink-card-${index}`}
                >
                  <ArrowUpRightIcon />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export const HeroSectionBistroDemo = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Savor the taste of perfection
          </h1>
          <p className="text-muted-foreground mt-5 text-xl">
            Welcome to Restaurant where passion meets the plate.
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" className="rounded-full" data-test-id="hero-bistro-order">
              Order now <ArrowUpRightIcon className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              data-test-id="hero-bistro-book"
            >
              Book table
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════
// SONNER (TOAST) DEMO — Uses toast() from sonner, needs Toaster mounted at root
// ═══════════════════════════════════════════════════════════════

export const SonnerVariantsDemo = () => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        data-test-id="sonner-default"
        onClick={() => {
          if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
              toast("Event has been created.");
            });
          }
        }}
      >
        Default Toast
      </Button>
      <Button
        variant="outline"
        data-test-id="sonner-success"
        onClick={() => {
          if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
              toast.success("Successfully saved!");
            });
          }
        }}
      >
        Success Toast
      </Button>
      <Button
        variant="outline"
        data-test-id="sonner-error"
        onClick={() => {
          if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
              toast.error("Something went wrong.");
            });
          }
        }}
      >
        Error Toast
      </Button>
      <Button
        variant="outline"
        data-test-id="sonner-action"
        onClick={() => {
          if (typeof window !== "undefined") {
            import("sonner").then(({ toast }) => {
              toast("Event created", {
                action: { label: "Undo", onClick: () => {} },
              });
            });
          }
        }}
      >
        Toast with Action
      </Button>
    </div>
  );
};
