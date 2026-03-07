export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  span?: "wide" | "tall";
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
}

export interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}
