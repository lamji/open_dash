"use client";

import { HeadsetIcon, PackageIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// ─── Shared Data ────────────────────────────────────────────

const faqItems = [
  {
    title: "How do I track my order?",
    content:
      'You can track your order by logging into your account and visiting the "Orders" section. You\'ll receive tracking information via email once your order ships.',
  },
  {
    title: "What is your return policy?",
    content:
      "We offer a 30-day return policy for most items. Products must be unused and in their original packaging.",
  },
  {
    title: "How can I contact customer support?",
    content:
      "Our customer support team is available 24/7. You can reach us via live chat, email at support@example.com, or by phone at 1-800-123-4567.",
  },
];

const faqItemsWithIcons = [
  { ...faqItems[0], icon: PackageIcon },
  { ...faqItems[1], icon: RefreshCwIcon },
  { ...faqItems[2], icon: HeadsetIcon },
];

const avatarItems = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    image: "https://github.com/shadcn.png",
    content:
      "Alex is a senior developer with 10 years of experience in full-stack development.",
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    image: "",
    content:
      "Maria leads the design team and specializes in user experience research.",
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    image: "",
    content:
      "James is a project manager who coordinates between engineering and product teams.",
  },
];

// ─── 1. Basic Accordion ────────────────────────────────────

export const AccordionBasicDemo = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      {faqItems.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ─── 2. Accordion with Avatar ──────────────────────────────

export const AccordionAvatarDemo = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {avatarItems.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className="hover:no-underline">
            <span className="flex items-center gap-3">
              <Avatar className="size-10.5 rounded-sm">
                <AvatarImage src={item.image} alt={item.name} />
                <AvatarFallback className="rounded-sm">
                  {item.name
                    .split(" ")
                    .reduce((acc, n) => acc + n[0], "")}
                </AvatarFallback>
              </Avatar>
              <span className="flex flex-col space-y-0.5">
                <span>{item.name}</span>
                <span className="text-muted-foreground font-normal">
                  {item.email}
                </span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ─── 3. Accordion with Expand Icon (Plus → X) ─────────────

export const AccordionExpandIconDemo = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      {faqItemsWithIcons.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
              data-slot="accordion-trigger"
              className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-45"
            >
              <span className="flex items-center gap-4">
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </span>
              <PlusIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionContent className="text-muted-foreground">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ─── 4. Split Accordion (Card Style) ──────────────────────

export const AccordionSplitDemo = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-2"
      defaultValue="item-1"
    >
      {faqItems.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index + 1}`}
          className="bg-card rounded-md border-b-0 shadow-md data-[state=open]:shadow-lg"
        >
          <AccordionTrigger className="px-5 [&>svg]:rotate-[270deg] [&[data-state=open]>svg]:rotate-0">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground px-5">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// ─── 5. Accordion with Left Icons ─────────────────────────

export const AccordionLeftIconDemo = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      {faqItemsWithIcons.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className="justify-start [&>svg]:order-first">
            <span className="flex items-center gap-4">
              <item.icon className="text-muted-foreground size-4 shrink-0" />
              <span>{item.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
