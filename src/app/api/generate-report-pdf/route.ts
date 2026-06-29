import { NextRequest, NextResponse } from 'next/server';
import { renderReportToBuffer } from '@/lib/report-pdf';
import { AssessmentInput, AssessmentResult, computeAssessment } from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';

// POST /api/generate-report-pdf
// Generates a PDF from the report data passed in the request body.
// Returns the PDF as a downloadable file (application/pdf).
//
// Body: { input: AssessmentInput, result: AssessmentResult, extraction?: ExtractionResult }

interface RequestBody {
  input: AssessmentInput;
  result: AssessmentResult;
  extraction?: ExtractionResult | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.input || !body.result) {
      return NextResponse.json(
        { error: 'Missing input or result data.' },
        { status: 400 }
      );
    }

    const pdfBuffer = await renderReportToBuffer(body.input, body.result, body.extraction || null);

    const processName = body.input.processName || 'process-assessment';
    const filename = `autoscore-${processName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    console.error('PDF generation error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `PDF generation failed: ${message}` },
      { status: 500 }
    );
  }
}
