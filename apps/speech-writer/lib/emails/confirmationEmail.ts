const TIER_LABELS: Record<string, string> = {
  single: 'Single Speech',
  full: 'Full Package (3 speeches + editing)',
  premium: 'Premium Package (3 speeches + editing + rehearsal mode)',
};

export function buildConfirmationEmail(params: {
  email: string;
  accessToken: string;
  tier: string;
}): { subject: string; html: string } {
  const { email, accessToken, tier } = params;
  const speechUrl = `https://brightsparks.ai/speech-writer/${accessToken}`;
  const tierLabel = TIER_LABELS[tier] ?? tier;
  const greeting = email.includes('@') ? email : 'there';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your wedding speech is ready</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FEFCF7;border-radius:8px;overflow:hidden;border:1px solid #E8DDD0;">

          <!-- Header -->
          <tr>
            <td style="background:#2C1810;padding:32px 48px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:13px;letter-spacing:2px;color:#C9A84C;text-transform:uppercase;">Bright Sparks AI</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 40px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:#2C1810;font-weight:normal;">Your speech is on its way</h1>
              <p style="margin:0 0 32px;font-family:Georgia,serif;font-size:15px;color:#7A6659;">It&rsquo;ll be ready in about a minute.</p>

              <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#2C1810;line-height:1.6;">Hi ${greeting},</p>

              <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#2C1810;line-height:1.6;">
                Your speech is being generated right now and will be ready in about two minutes. Here&rsquo;s your personal link to access it anytime:
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#C9A84C;border-radius:6px;">
                    <a href="${speechUrl}" style="display:inline-block;padding:14px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:bold;color:#2C1810;text-decoration:none;">
                      View My Speech &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#7A6659;line-height:1.6;">
                Or copy this link: <a href="${speechUrl}" style="color:#C9A84C;word-break:break-all;">${speechUrl}</a>
              </p>

              <p style="margin:0 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#2C1810;line-height:1.6;">
                <strong>Bookmark this link</strong> &mdash; it&rsquo;s how you&rsquo;ll access your speech. No login needed.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr><td style="border-top:1px solid #E8DDD0;"></td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;background:#F5F0E8;border-radius:6px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#7A6659;text-transform:uppercase;">Your purchase</p>
                    <p style="margin:0;font-family:Georgia,serif;font-size:15px;color:#2C1810;">${tierLabel}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#7A6659;line-height:1.6;">
                Questions? Reply to this email or reach us at <a href="mailto:hello@brightsparks.ai" style="color:#C9A84C;">hello@brightsparks.ai</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #E8DDD0;text-align:center;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#A89080;">
                &copy; Bright Sparks AI &middot; <a href="https://brightsparks.ai/speech-writer" style="color:#A89080;">brightsparks.ai/speech-writer</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: 'Your wedding speech is ready 🎤',
    html,
  };
}
