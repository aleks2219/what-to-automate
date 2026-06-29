import { NextRequest, NextResponse } from 'next/server';

// Email capture endpoint — adds subscriber to MailerLite + returns success.
// The actual welcome email (with PDF link + playbook) is triggered by a
// MailerLite automation that fires when a subscriber joins the group.
//
// Required env vars (set on Vercel):
//   MAILERLITE_API_KEY — from https://dashboard.mailerlite.com/integrations/api
//   MAILERLITE_GROUP_ID — the group ID for "AutoScore Users" (from URL when viewing the group)
//
// If env vars aren't set, the endpoint returns success but doesn't actually subscribe.
// This lets the app work in dev/testing without MailerLite configured.

interface EmailCaptureBody {
  email: string;
  processName?: string;
  verdict?: string;
  annualSavings?: string;
  source?: string;
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

    // If MailerLite isn't configured, return success anyway (dev mode)
    if (!apiKey || !groupId) {
      console.warn(
        'MAILERLITE_API_KEY or MAILERLITE_GROUP_ID not set — skipping actual subscribe.'
      );
      return NextResponse.json({
        success: true,
        message: 'Email captured (MailerLite not configured — set MAILERLITE_API_KEY + MAILERLITE_GROUP_ID in production).',
        email: body.email,
        devMode: true,
      });
    }

    // Add subscriber to MailerLite
    // Docs: https://developers.mailerlite.com/docs/subscribers.html#create-update-subscriber
    const subscriberData = {
      email: body.email,
      fields: {
        // Custom fields — create these in MailerLite dashboard first
        // (Subscribers → Fields). If they don't exist, MailerLite ignores them.
        autoscore_process: (body.processName || '').slice(0, 255),
        autoscore_verdict: (body.verdict || '').slice(0, 255),
        autoscore_savings: (body.annualSavings || '').slice(0, 255),
        signup_source: body.source || 'autoscore',
      },
      groups: [groupId],
    };

    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(subscriberData),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '(no error body)');
      console.error('MailerLite API error:', res.status, errText);

      // If subscriber already exists, MailerLite returns 422 Unprocessable Entity
      // — treat this as success (they're already on the list)
      if (res.status === 422 && errText.includes('already')) {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed! Check your inbox for the welcome email.',
          email: body.email,
          alreadySubscribed: true,
        });
      }

      return NextResponse.json(
        { error: `Newsletter signup failed (${res.status}). Please try again.` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed! Check your inbox for the welcome email.',
      email: body.email,
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
