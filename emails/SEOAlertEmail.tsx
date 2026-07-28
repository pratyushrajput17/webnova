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

interface ChangeItem {
  severity: string;
  changeType: string;
  summary: string;
  metadata: Record<string, unknown>;
}

interface SEOAlertEmailProps {
  websiteUrl: string;
  previousScore: number;
  currentScore: number;
  scoreChange: number;
  changes: ChangeItem[];
  isImprovement: boolean;
  reportUrl: string;
  settingsUrl: string;
  userName?: string;
}

export default function SEOAlertEmail({
  websiteUrl,
  previousScore,
  currentScore,
  scoreChange,
  changes,
  isImprovement,
  reportUrl,
  settingsUrl,
  userName,
}: SEOAlertEmailProps) {
  const criticalChanges = changes.filter((c) => c.severity === "CRITICAL");
  const warningChanges = changes.filter((c) => c.severity === "WARNING");
  const improvementChanges = changes.filter((c) => c.severity === "IMPROVEMENT");
  const otherChanges = changes.filter(
    (c) => c.severity !== "CRITICAL" && c.severity !== "WARNING" && c.severity !== "IMPROVEMENT"
  );

  const scoreDown = scoreChange < 0;
  const scoreAbs = Math.abs(scoreChange);

  const domain = websiteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  return (
    <Html>
      <Head />
      <Preview>
        {isImprovement
          ? `SEO Improvement: ${domain} gained ${scoreAbs} points`
          : `SEO Alert: New issues detected on ${domain}`}
      </Preview>
      <Tailwind>
        <Body className="bg-zinc-50 font-sans">
          <Container className="mx-auto max-w-[600px] py-10">
            <Section className="rounded-2xl bg-white p-8 shadow-sm">
              <Section className="text-center">
                <Img
                  src="https://webnova.business/logo.png"
                  alt="WebNova"
                  width={48}
                  height={48}
                  className="mx-auto"
                />
              </Section>

              <Text className="mt-6 text-center text-2xl font-bold tracking-tight text-zinc-900">
                {isImprovement ? "SEO Improvement" : "SEO Alert"}
              </Text>

              <Text className="mt-1 text-center text-sm text-zinc-500">
                {domain}
              </Text>

              {userName && (
                <Text className="mt-4 text-sm text-zinc-600">
                  Hi {userName},
                </Text>
              )}

              {isImprovement ? (
                <Text className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Great news! Your SEO score for{" "}
                  <Link
                    href={websiteUrl}
                    className="text-zinc-900 underline underline-offset-2"
                  >
                    {domain}
                  </Link>{" "}
                  has improved.
                </Text>
              ) : (
                <Text className="mt-2 text-sm leading-relaxed text-zinc-600">
                  We detected meaningful SEO changes on{" "}
                  <Link
                    href={websiteUrl}
                    className="text-zinc-900 underline underline-offset-2"
                  >
                    {domain}
                  </Link>{" "}
                  during your latest scheduled audit.
                </Text>
              )}

              <Section className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <Text className="m-0 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">
                  SEO Score
                </Text>
                <Section className="mt-2 flex items-center justify-center gap-3">
                  <Text className="m-0 text-3xl font-bold text-zinc-400">
                    {previousScore}
                  </Text>
                  <Text className="m-0 text-xl text-zinc-300">
                    {scoreDown ? "↓" : "↑"}
                  </Text>
                  <Text className="m-0 text-3xl font-bold text-zinc-900">
                    {currentScore}
                  </Text>
                </Section>
                <Text
                  className={`m-0 mt-1 text-center text-sm font-semibold ${
                    scoreDown ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {scoreDown
                    ? `${scoreAbs} point${scoreAbs > 1 ? "s" : ""} decrease`
                    : `${scoreAbs} point${scoreAbs > 1 ? "s" : ""} increase`}
                </Text>
              </Section>

              {criticalChanges.length > 0 && (
                <Section className="mt-6">
                  <Text className="text-sm font-semibold text-red-700">
                    🔴 Critical Issues
                  </Text>
                  <Section className="mt-2 space-y-2">
                    {criticalChanges.map((change, i) => (
                      <Section
                        key={i}
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                      >
                        <Text className="m-0 text-sm font-medium text-red-800">
                          {change.summary}
                        </Text>
                      </Section>
                    ))}
                  </Section>
                </Section>
              )}

              {warningChanges.length > 0 && (
                <Section className="mt-6">
                  <Text className="text-sm font-semibold text-amber-700">
                    ⚠️ Warnings
                  </Text>
                  <Section className="mt-2 space-y-2">
                    {warningChanges.map((change, i) => (
                      <Section
                        key={i}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                      >
                        <Text className="m-0 text-sm font-medium text-amber-800">
                          {change.summary}
                        </Text>
                      </Section>
                    ))}
                  </Section>
                </Section>
              )}

              {improvementChanges.length > 0 && (
                <Section className="mt-6">
                  <Text className="text-sm font-semibold text-emerald-700">
                    ✅ Resolved
                  </Text>
                  <Section className="mt-2 space-y-2">
                    {improvementChanges.map((change, i) => (
                      <Section
                        key={i}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
                      >
                        <Text className="m-0 text-sm font-medium text-emerald-800">
                          {change.summary}
                        </Text>
                      </Section>
                    ))}
                  </Section>
                </Section>
              )}

              {otherChanges.length > 0 && (
                <Section className="mt-6">
                  <Text className="text-sm font-semibold text-blue-700">
                    ℹ️ Notices
                  </Text>
                  <Section className="mt-2 space-y-2">
                    {otherChanges.map((change, i) => (
                      <Section
                        key={i}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3"
                      >
                        <Text className="m-0 text-sm font-medium text-blue-800">
                          {change.summary}
                        </Text>
                      </Section>
                    ))}
                  </Section>
                </Section>
              )}

              <Section className="mt-8 text-center">
                <Button
                  href={reportUrl}
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-8 py-3 text-sm font-medium text-white"
                >
                  {isImprovement ? "View Progress" : "View Full Report"}
                </Button>
              </Section>

              <Hr className="my-8 border-zinc-100" />

              <Section className="text-center">
                <Text className="text-xs text-zinc-400">
                  Manage your{" "}
                  <Link
                    href={settingsUrl}
                    className="text-zinc-500 underline underline-offset-2"
                  >
                    Alert Settings
                  </Link>{" "}
                  to control which notifications you receive.
                </Text>
              </Section>

              <Text className="mt-4 text-center text-xs text-zinc-400">
                &copy; {new Date().getFullYear()} WebNova. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
