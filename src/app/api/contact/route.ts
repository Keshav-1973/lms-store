import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http";
import nodemailer from "nodemailer";

type ContactRequest = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await parseJsonBody<ContactRequest>(request);

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const subject = body?.subject?.trim() ?? "General inquiry";
  const message = body?.message?.trim() ?? "";

  if (!name || !email || !message) {
    return jsonError("name, email, and message are required.", 400);
  }

  if (!isValidEmail(email)) {
    return jsonError("Please provide a valid email address.", 400);
  }

  if (message.length < 10) {
    return jsonError("Message must be at least 10 characters.", 400);
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT ?? "587";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM ?? smtpUser;
  const mailTo = process.env.MAIL_TO ?? "support@skillsolutions.com";

  const smtpPort = Number.parseInt(smtpPortRaw, 10);
  const secure =
    process.env.SMTP_SECURE === "true" || Number.isNaN(smtpPort)
      ? process.env.SMTP_SECURE === "true"
      : smtpPort === 465;

  if (
    !smtpHost ||
    !smtpUser ||
    !smtpPass ||
    !mailFrom ||
    Number.isNaN(smtpPort)
  ) {
    return jsonError("Contact email is not configured on the server.", 500);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: `${name} <${email}>`,
      subject: `[Contact Form] ${subject}`,
      text: [`Name: ${name}`, `Email: ${email}`, "", "Message:", message].join(
        "\n",
      ),
    });

    return jsonSuccess({ message: "Your message has been sent successfully." });
  } catch {
    return jsonError("Failed to send your message. Please try again.", 500);
  }
}
