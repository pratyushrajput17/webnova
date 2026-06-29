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

interface AuditCompletedEmailProps {
  name: string;
  websiteUrl: string;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  reportUrl: string;
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const colors =
    score >= 80
      ? "bg-emerald-50 text-emerald-700"
      : score >= 60
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return (
    <Section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-center">
      <Text className="m-0 text-xs font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </Text>
      <Text className={`m-0 mt-1 text-2xl font-bold ${colors.split(" ")[1]}`}>
        {score}
      </Text>
      <Text className={`m-0 mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${colors}`}>
        {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
      </Text>
    </Section>
  );
}

export default function AuditCompletedEmail({
  name,
  websiteUrl,
  seoScore,
  performanceScore,
  accessibilityScore,
  reportUrl,
}: AuditCompletedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your audit for {websiteUrl} is ready</Preview>
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
                Audit Complete
              </Text>

              <Text className="mt-2 text-center text-base text-zinc-500">
                Hi{name ? `, ${name}` : ""}!
              </Text>

              <Text className="mt-6 leading-relaxed text-zinc-600">
                We&apos;ve finished analyzing{" "}
                <Link
                  href={websiteUrl}
                  className="text-zinc-900 underline underline-offset-2"
                >
                  {websiteUrl}
                </Link>
                . Here&apos;s a quick overview:
              </Text>

              <Section className="mt-8 grid grid-cols-3 gap-3">
                <ScoreBadge label="SEO" score={seoScore} />
                <ScoreBadge label="Performance" score={performanceScore} />
                <ScoreBadge label="Accessibility" score={accessibilityScore} />
              </Section>

              <Section className="mt-8 text-center">
                <Button
                  href={reportUrl}
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-8 py-3 text-sm font-medium text-white"
                >
                  View Full Report
                </Button>
              </Section>

              <Text className="mt-4 text-center text-xs text-zinc-400">
                <Link
                  href={reportUrl}
                  className="text-zinc-500 underline underline-offset-2"
                >
                  {reportUrl}
                </Link>
              </Text>

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
