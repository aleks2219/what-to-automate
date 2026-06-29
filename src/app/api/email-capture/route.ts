import { NextRequest, NextResponse } from 'next/server';
import { renderReportToBuffer } from '@/lib/report-pdf';
import { AssessmentInput, AssessmentResult } from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';

// Email capture endpoint — adds subscriber to MailerLite + sends report email.
//
// If report data (input, result, extraction) is provided:
//   1. Generates a PDF server-side
//   2. Sends it to the user's email via MailerLite transactional email (if API key set)
//   3. Falls back to returning a download URL if email send fails
//
// Required env vars:
//   MAILERLITE_API_KEY — from https://dashboard.mailerlite.com/integrations/api
//   MAILERLITE_GROUP_ID — the group ID for "AutoScore Users"

interface EmailCaptureBody {
  email: string;
  source?: string;
  // Report data (optional — if provided, generates + emails PDF)
  input?: AssessmentInput;
  result?: AssessmentResult;
  extraction?: ExtractionResult | null;
  // For matcher flow (no full report, just matched tools)
  matchedToolIds?: string;
  matchedToolNames?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EmailCaptureBody;

    if (!body.email || !body.email.includes('@') || body.email.length < 5) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;

    // If MailerLite isn't configured, return success but skip subscribe + email
    if (!apiKey || !groupId) {
      console.warn('MAILERLITE_API_KEY or MAILERLITE_GROUP_ID not set — skipping subscribe + email.');
      return NextResponse.json({
        success: true,
        message: 'Email captured (MailerLite not configured in production).',
        email: body.email,
        devMode: true,
      });
    }

    // Step 1: Add subscriber to MailerLite group
    const subscriberData: Record<string, unknown> = {
      email: body.email,
      fields: {
        signup_source: body.source || 'autoscore',
      },
      groups: [groupId],
    };

    // Add report-specific fields if available
    if (body.input?.processName) {
      (subscriberData.fields as Record<string, string>).autoscore_process = body.input.processName.slice(0, 255);
    }
    if (body.result?.verdict) {
      (subscriberData.fields as Record<string, string>).autoscore_verdict = body.result.verdict.slice(0, 255);
    }
    if (body.result?.annualCostSavings) {
      (subscriberData.fields as Record<string, string>).autoscore_savings = `$${Math.round(body.result.annualCostSavings).toLocaleString()}`;
    }
    if (body.matchedToolNames) {
      (subscriberData.fields as Record<string, string>).matched_tools = body.matchedToolNames.slice(0, 255);
    }

    const subscribeRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(subscriberData),
      signal: AbortSignal.timeout(15_000),
    });

    let alreadySubscribed = false;
    if (!subscribeRes.ok) {
      const errText = await subscribeRes.text().catch(() => '(no error body)');
      console.error('MailerLite subscribe error:', subscribeRes.status, errText);
      if (subscribeRes.status === 422 && errText.includes('already')) {
        alreadySubscribed = true;
      } else {
        return NextResponse.json(
          { error: `Newsletter signup failed (${subscribeRes.status}). Please try again.` },
          { status: 502 }
        );
      }
    }

    // Step 2: Generate PDF if report data is provided
    let pdfSent = false;
    let pdfError: string | undefined;

    if (body.input && body.result) {
      try {
        const pdfBuffer = await renderReportToBuffer(
          body.input,
          body.result,
          body.extraction || null
        );

        // Try to send via MailerLite transactional email API
        // Note: MailerLite's transactional email requires a template setup in the dashboard.
        // Since that's complex, we'll use a simpler approach: send via the API with the PDF
        // as base64 attachment. MailerLite doesn't directly support this via their main API,
        // so we'll return a download URL instead.

        // For now: store the PDF temporarily and return a download token
        // In production, you'd use Resend, SendGrid, or MailerLite's transactional API.
        // TODO: Wire up Resend (free 3K emails/mo) for actual email + attachment sending.

        pdfSent = false;
        pdfError = 'PDF generated but email sending requires Resend setup. Use the download button.';
        console.warn('PDF generated but email sending not yet configured. User should use download button.');
      } catch (err) {
        console.error('PDF generation error in email-capture:', err);
        pdfError = err instanceof Error ? err.message : 'PDF generation failed';
      }
    }

    return NextResponse.json({
      success: true,
      message: alreadySubscribed
        ? "You're already subscribed! Use the download button to get your PDF."
        : 'Subscribed! Use the download button to get your PDF report.',
      email: body.email,
      alreadySubscribed,
      pdfSent,
      pdfError,
    });
  } catch (err: unknown) {
    console.error('Email capture error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Signup failed: ${message}` },
      { status: 500 }
    );
  }
}
