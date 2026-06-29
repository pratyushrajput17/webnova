import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
  Img,
  Tailwind,
} from "@react-email/components";

interface MonthlySummaryEmailProps {
  name: string;
  plan: string;
  month: string;
  auditCount: number;
  totalAuditsAllTime: number;
  remainingAudits: number;
  isUnlimited: boolean;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-center">
      <Text className="m-0 text-2xl font-bold text-zinc-900">{value}</Text>
      <Text className="m-0 mt-0.5 text-xs text-zinc-400">{label}</Text>
    </Section>
  );
}

export default function MonthlySummaryEmail({
  name,
  plan,
  month,
  auditCount,
  totalAuditsAllTime,
  remainingAudits,
  isUnlimited,
}: MonthlySummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your WebNova {month} usage summary</Preview>
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

              <Text className="mt-8 text-center text-3xl font-bold tracking-tight text-zinc-900">
                Your {month} Summary
              </Text>

              <Text className="mt-2 text-center text-base text-zinc-500">
                Hi{name ? `, ${name}` : ""}!
              </Text>

              <Text className="mt-6 leading-relaxed text-zinc-600">
                Here&apos;s how your websites performed on{" "}
                <span className="font-semibold text-zinc-900">{plan}</span>{" "}
                this month.
              </Text>

              <Section className="mt-8 grid grid-cols-2 gap-3">
                <StatBox label="Audits This Month" value={String(auditCount)} />
                <StatBox
                  label="All-Time Audits"
                  value={String(totalAuditsAllTime)}
                />
                <StatBox
                  label="Remaining"
                  value={isUnlimited ? "Unlimited" : String(remainingAudits)}
                />
                <StatBox label="Plan" value={plan} />
              </Section>

              {auditCount > 0 && (
                <Section className="mt-8 text-center">
                  <Button
                    href="https://webnova.dev/dashboard/history"
                    className="inline-flex items-center rounded-xl bg-zinc-900 px-8 py-3 text-sm font-medium text-white"
                  >
                    View Full History
                  </Button>
                </Section>
              )}

              {remainingAudits === 0 && !isUnlimited && (
                <Section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <Text className="m-0 text-sm font-medium text-amber-800">
                    You&apos;ve used all your audits this month.
                  </Text>
                  <Text className="m-0 mt-1 text-sm text-amber-600">
                    <Link
                      href="https://webnova.dev/dashboard/billing"
                      className="font-medium text-amber-800 underline underline-offset-2"
                    >
                      Upgrade your plan
                    </Link>{" "}
                    for more audits.
                  </Text>
                </Section>
              )}

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
