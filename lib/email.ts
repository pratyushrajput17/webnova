import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "WebNova <notifications@webnova.business>";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  retries?: number;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendEmail({
  to,
  subject,
  react,
  retries = 3,
}: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn(
      "[Email] RESEND_API_KEY not set. Skipping email to",
      to,
      "subject:",
      subject
    );
    return false;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject,
        react,
      });

      if (error) {
        console.error(`[Email] Resend error (attempt ${attempt + 1}):`, error);
        if (attempt < retries - 1) {
          await sleep(Math.pow(2, attempt) * 1000);
        }
        continue;
      }

      return true;
    } catch (err) {
      console.error(
        `[Email] Unexpected error (attempt ${attempt + 1}):`,
        err
      );
      if (attempt < retries - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  return false;
}
