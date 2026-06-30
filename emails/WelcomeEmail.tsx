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

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to WebNova — Start auditing your websites today</Preview>
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
                Welcome to WebNova
              </Text>

              <Text className="mt-2 text-center text-base text-zinc-500">
                Hi{name ? `, ${name}` : ""}!
              </Text>

              <Text className="mt-6 leading-relaxed text-zinc-600">
                We&apos;re excited to have you on board. WebNova gives you
                powerful tools to analyze, optimize, and monitor your
                websites — all in one place.
              </Text>

              <Section className="mt-8 grid grid-cols-1 gap-4">
                <Section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <Text className="m-0 text-sm font-semibold text-zinc-800">
                    Website Audits
                  </Text>
                  <Text className="m-0 mt-1 text-sm text-zinc-500">
                    Get detailed SEO, performance, and accessibility scores.
                  </Text>
                </Section>
                <Section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <Text className="m-0 text-sm font-semibold text-zinc-800">
                    Competitor Analysis
                  </Text>
                  <Text className="m-0 mt-1 text-sm text-zinc-500">
                    Compare your site against competitors side by side.
                  </Text>
                </Section>
                <Section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <Text className="m-0 text-sm font-semibold text-zinc-800">
                    AI Recommendations
                  </Text>
                  <Text className="m-0 mt-1 text-sm text-zinc-500">
                    Get actionable insights powered by AI.
                  </Text>
                </Section>
              </Section>

              <Section className="mt-8 text-center">
                <Button
                  href="https://webnova.dev/dashboard"
                  className="inline-flex items-center rounded-xl bg-zinc-900 px-8 py-3 text-sm font-medium text-white"
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
