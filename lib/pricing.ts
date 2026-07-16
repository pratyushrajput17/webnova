export interface PricingFeature {
  text: string;
  icon: string;
}

export interface PricingPlan {
  key: string;
  name: string;
  price: string;
  period: string;
  description: string;
  savings: string | null;
  badge: string | null;
  cta: string;
  popular: boolean;
  features: PricingFeature[];
}

export const PLANS: PricingPlan[] = [
  {
    key: "STARTER",
    name: "Starter",
    price: "$10",
    period: "/year",
    description: "For freelancers and beginners",
    savings: null,
    badge: null,
    cta: "Start Starter Plan",
    popular: false,
    features: [
      { text: "100 website audits per year", icon: "Search" },
      { text: "10 competitor analyses per month", icon: "GitCompare" },
      { text: "Basic SEO reports", icon: "FileText" },
      { text: "PDF export", icon: "FileDown" },
      { text: "Audit history", icon: "Clock" },
      { text: "Email support", icon: "Headphones" },
    ],
  },
  {
    key: "PRO",
    name: "Professional",
    price: "$29",
    period: "/year",
    description: "For agencies and growing businesses",
    savings: null,
    badge: "Most Popular",
    cta: "Upgrade to Professional",
    popular: true,
    features: [
      { text: "Unlimited website audits", icon: "Search" },
      { text: "Unlimited competitor tracking", icon: "GitCompare" },
      { text: "Advanced SEO recommendations", icon: "FileText" },
      { text: "White-label PDF reports", icon: "FileDown" },
      { text: "Priority support", icon: "Headphones" },
      { text: "Team collaboration", icon: "Users" },
      { text: "Historical SEO tracking", icon: "Clock" },
      { text: "AI-powered insights", icon: "Sparkles" },
    ],
  },
  {
    key: "LIFETIME",
    name: "Lifetime Access",
    price: "$83",
    period: "one-time",
    description: "5-year plan — everything included",
    savings: "One-time payment",
    badge: "Best Value",
    cta: "Get Lifetime Access",
    popular: false,
    features: [
      { text: "Unlimited website audits", icon: "Search" },
      { text: "Unlimited competitor tracking", icon: "GitCompare" },
      { text: "Advanced SEO recommendations", icon: "FileText" },
      { text: "White-label PDF reports", icon: "FileDown" },
      { text: "Priority support", icon: "Headphones" },
      { text: "Team collaboration", icon: "Users" },
      { text: "Historical SEO tracking", icon: "Clock" },
      { text: "AI-powered insights", icon: "Sparkles" },
      { text: "Future feature updates included", icon: "Package" },
      { text: "Premium AI features", icon: "Brain" },
      { text: "API access", icon: "Code2" },
      { text: "Priority onboarding + dedicated account manager", icon: "UserCheck" },
      { text: "Premium support + early access to new features", icon: "Rocket" },
    ],
  },
];

export const PLAN_DISPLAY: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  FREE: { label: "Free", color: "text-zinc-500", icon: "BarChart3" },
  STARTER: { label: "Starter", color: "text-blue-600", icon: "Zap" },
  PRO: { label: "Professional", color: "text-indigo-600", icon: "Crown" },
  LIFETIME: { label: "Lifetime Access", color: "text-emerald-600", icon: "Sparkles" },
  ENTERPRISE: { label: "Enterprise", color: "text-violet-600", icon: "Crown" },
};
