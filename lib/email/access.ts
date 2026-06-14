import "server-only";

type AccessApprovedEmail = {
  to: string;
  customerName: string;
  pageTitle: string;
  creatorName: string;
  accessUrl: string;
};

export async function sendAccessApprovedEmail(input: AccessApprovedEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const subject = `Your access to ${input.pageTitle} is ready`;
  const text = [
    `Hi ${input.customerName},`,
    "",
    `Your access to ${input.pageTitle} has been approved by ${input.creatorName}.`,
    "",
    `Open your content: ${input.accessUrl}`,
    "",
    "If you have questions, contact the creator.",
    "",
    "Thank you,",
    "OnlineSkiller",
  ].join("\n");

  if (!apiKey || !from) {
    console.info("Access approval email not sent because email is not configured.", {
      to: input.to,
      subject,
      accessUrl: input.accessUrl,
    });
    return { sent: false, reason: "not_configured" as const };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: input.to, subject, text }),
    });

    if (!response.ok) {
      return { sent: false, reason: "provider_error" as const };
    }

    return { sent: true, reason: null };
  } catch {
    return { sent: false, reason: "provider_error" as const };
  }
}
