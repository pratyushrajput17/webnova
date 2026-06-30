import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
  Tailwind,
} from "@react-email/components";

interface PlanUpgradeEmailProps {
  name: string;
  plan: string;
  duration: number;
  subscriptionEndsAt: string;
}

const planColors: Record<string, { badge: string; gradient: string }> = {
  STARTER: {
    badge: "bg-blue-100 text-blue-700",
    gradient: "from-blue-500 to-blue-600",
  },
  PRO: {
    badge: "bg-indigo-100 text-indigo-700",
    gradient: "from-indigo-500 to-indigo-600",
  },
  ENTERPRISE: {
    badge: "bg-amber-100 text-amber-700",
    gradient: "from-amber-500 to-amber-600",
  },
};

export default function PlanUpgradeEmail({
  name,
  plan,
  duration,
  subscriptionEndsAt,
}: PlanUpgradeEmailProps) {
  const colors = planColors[plan] ?? planColors.STARTER;
  const endsAt = new Date(subscriptionEndsAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Html>
      <Head />
      <Preview>You&apos;re now on {plan} — welcome to the next level</Preview>
      <Tailwind>
        <Body className="bg-zinc-50 font-sans">
          <Container className="mx-auto max-w-[600px] py-10">
            <Section className="rounded-2xl bg-white p-8 shadow-sm">
              <Section className="text-center">
                <Img
                  src="https://webnova.dev/logo.png"
                  alt="WebNova"
                  width={48}
                  height={48}
                  className="mx-auto"
                />
              </Section>

              <Section className="mt-8 text-center">
                <span
                  className={`inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${colors.badge}`}
                >
                  {plan} Plan
                </span>
              </Section>

              <Text className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900">
                You&apos;ve been upgraded!
              </Text>

              <Text className="mt-2 text-center text-base text-zinc-500">
                Hi{name ? `, ${name}` : ""}!
              </Text>

              <Text className="mt-6 leading-relaxed text-zinc-600">
                Your account has been upgraded to the{" "}
                <span className="font-semibold text-zinc-900">{plan}</span>{" "}
                plan. You now have access to all the features included in this
                plan.
              </Text>

              <Section className="mt-8 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
                <Text className="m-0 text-sm font-medium text-zinc-800">
                  Subscription Details
                </Text>
                <Section className="mt-3 space-y-2">
                  <Text className="m-0 text-sm text-zinc-500">
                    Plan:{" "}
                    <span className="font-medium text-zinc-800">{plan}</span>
                  </Text>
                  <Text className="m-0 text-sm text-zinc-500">
                    Duration:{" "}
                    <span className="font-medium text-zinc-800">
                      {duration} days
                    </span>
                  </Text>
                  <Text className="m-0 text-sm text-zinc-500">
                    Expires:{" "}
                    <span className="font-medium text-zinc-800">{endsAt}</span>
                  </Text>
                </Section>
              </Section>

              <Section className="mt-8 text-center">
                <Button
                  href="https://webnova.dev/dashboard"
                  className={`inline-flex items-center rounded-xl bg-gradient-to-r ${colors.gradient} px-8 py-3 text-sm font-medium text-white shadow-lg`}
                >
                  Go to Dashboard
                </Button>
              </Section>

              <Hr className="my-8 border-zinc-100" />

              <Text className="text-center text-xs text-zinc-400">
                &copy; {new Date().getFullYear()} WebNova. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
