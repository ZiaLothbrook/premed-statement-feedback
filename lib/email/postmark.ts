import { ServerClient } from 'postmark';

const client = new ServerClient(process.env.POSTMARK_API_KEY!);

interface SendFeedbackEmailOptions {
  to: string;
  essayType: string;
  pdfAttachment?: Buffer;
  feedbackHtml?: string;
}

/**
 * Send feedback email with PDF attachment or inline HTML
 */
export async function sendFeedbackEmail({
  to,
  essayType,
  pdfAttachment,
  feedbackHtml,
}: SendFeedbackEmailOptions): Promise<void> {
  try {
    const emailOptions: any = {
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: to,
      Subject: `Your ${essayType} Personal Statement Feedback`,
      HtmlBody: feedbackHtml || buildDefaultEmailHtml(essayType),
      TextBody: `Your ${essayType} personal statement feedback is ready. Please see the attached PDF or view it online.`,
      MessageStream: 'outbound',
    };

    // Add PDF attachment if provided
    if (pdfAttachment) {
      emailOptions.Attachments = [
        {
          Name: `${essayType}-Feedback.pdf`,
          Content: pdfAttachment.toString('base64'),
          ContentType: 'application/pdf',
        },
      ];
    }

    await client.sendEmail(emailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Build default HTML email template
 */
function buildDefaultEmailHtml(essayType: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #f97316;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Medical School HQ</h1>
    <p>Your Personal Statement Feedback is Ready</p>
  </div>
  <div class="content">
    <h2>Hi there!</h2>
    <p>
      Your ${essayType} personal statement feedback has been generated and is ready to review.
    </p>
    <p>
      We've attached a PDF copy of your feedback to this email. You can also view your feedback
      online anytime by logging into your dashboard.
    </p>
    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
        View Feedback Online
      </a>
    </center>
    <p>
      <strong>Next Steps:</strong>
    </p>
    <ul>
      <li>Review the feedback carefully</li>
      <li>Make revisions to your personal statement</li>
      <li>Submit another version to track your progress</li>
    </ul>
    <p>
      Good luck with your medical school applications!
    </p>
    <p>
      <em>- The Medical School HQ Team</em>
    </p>
  </div>
  <div class="footer">
    <p>
      This is an automated email. Please do not reply to this message.
    </p>
    <p>
      &copy; ${new Date().getFullYear()} Medical School HQ. All rights reserved.
    </p>
  </div>
</body>
</html>
  `;
}
