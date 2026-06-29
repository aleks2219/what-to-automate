// Server-side PDF generation for the assessment report.
// Uses @react-pdf/renderer to create a styled PDF from the report data.
// The PDF is returned as a Buffer that can be attached to emails.

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { AssessmentInput, AssessmentResult, formatCurrency, formatMonths, formatNumber, APPROACHES } from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';
import { getToolsByIds } from '@/lib/tools-db';
import { getCaseStudiesByIds } from '@/lib/case-studies-db';
import { getTemplatesByIds } from '@/lib/workflow-templates-db';

// Register a clean font (uses built-in Helvetica for reliability)
// No custom font registration needed — Helvetica is built into PDF spec.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1c1917',
    lineHeight: 1.5,
  },
  coverPage: {
    padding: 60,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1c1917',
    lineHeight: 1.5,
    justifyContent: 'space-between',
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 20,
    borderBottom: '2px solid #047857',
  },
  brandMark: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#047857',
  },
  brandSub: {
    fontSize: 8,
    color: '#78716c',
    marginTop: 2,
  },
  dateText: {
    fontSize: 9,
    color: '#78716c',
    textAlign: 'right',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginTop: 80,
    marginBottom: 12,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 12,
    color: '#57534e',
    marginBottom: 40,
    lineHeight: 1.5,
  },
  coverVerdict: {
    padding: 16,
    borderRadius: 6,
    marginBottom: 30,
  },
  coverVerdictLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverVerdictReason: {
    fontSize: 11,
    color: '#ffffff',
    lineHeight: 1.5,
  },
  coverMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 40,
  },
  coverMetric: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f4',
    borderRadius: 6,
  },
  coverMetricValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1c1917',
    marginBottom: 2,
  },
  coverMetricLabel: {
    fontSize: 8,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverFooter: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1px solid #e7e5e4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#a8a29e',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1c1917',
    marginBottom: 8,
    marginTop: 20,
    paddingBottom: 4,
    borderBottom: '1px solid #e7e5e4',
  },
  body: {
    fontSize: 10,
    color: '#44403c',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 10,
    color: '#047857',
    marginRight: 6,
  },
  bulletText: {
    fontSize: 10,
    color: '#44403c',
    flex: 1,
    lineHeight: 1.5,
  },
  riskItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  riskDot: {
    fontSize: 10,
    color: '#d97706',
    marginRight: 6,
  },
  callout: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  calloutLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#065f46',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  calloutBody: {
    fontSize: 10,
    color: '#1c1917',
    lineHeight: 1.5,
  },
  toolCard: {
    border: '1px solid #e7e5e4',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  toolName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1c1917',
    marginBottom: 2,
  },
  toolTagline: {
    fontSize: 9,
    color: '#78716c',
    marginBottom: 4,
  },
  toolField: {
    fontSize: 9,
    color: '#44403c',
    marginBottom: 2,
  },
  toolLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#57534e',
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  inputItem: {
    width: '48%',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 8,
    color: '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputValue: {
    fontSize: 10,
    color: '#1c1917',
    fontFamily: 'Helvetica-Bold',
  },
});

interface ReportPDFProps {
  input: AssessmentInput;
  result: AssessmentResult;
  extraction: ExtractionResult | null;
}

const VERDICT_COLORS: Record<string, string> = {
  AUTOMATE_NOW: '#047857',
  PILOT_FIRST: '#d97706',
  NOT_YET: '#57534e',
};

const VERDICT_LABELS: Record<string, string> = {
  AUTOMATE_NOW: 'AUTOMATE NOW',
  PILOT_FIRST: 'PILOT FIRST',
  NOT_YET: 'NOT YET',
};

// Main PDF document — cover page + content pages
export function ReportPDF({ input, result, extraction }: ReportPDFProps) {
  const verdictColor = VERDICT_COLORS[result.verdict] || '#57534e';
  const verdictLabel = VERDICT_LABELS[result.verdict] || result.verdict;
  const approachMeta = APPROACHES.find((a) => a.value === input.approach);
  const recommendedTools = extraction ? getToolsByIds(extraction.recommendedToolIds) : [];
  const caseStudies = extraction ? getCaseStudiesByIds(extraction.caseStudyIds) : [];
  const templates = extraction ? getTemplatesByIds(extraction.templateIds) : [];

  return (
    <Document
      title={`AutoScore Report — ${input.processName || 'Process Assessment'}`}
      author="AutoScore"
      subject="Automation Assessment Report"
    >
      {/* ============ COVER PAGE ============ */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverHeader}>
          <View>
            <Text style={styles.brandMark}>AutoScore</Text>
            <Text style={styles.brandSub}>AI Tool Discovery & Automation Assessment</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {'\n'}Confidential — for internal use
          </Text>
        </View>

        <View>
          <Text style={styles.coverTitle}>{input.processName || 'Process Assessment'}</Text>
          <Text style={styles.coverSubtitle}>
            {result.executiveSummary}
          </Text>

          {/* Verdict banner */}
          <View style={[styles.coverVerdict, { backgroundColor: verdictColor }]}>
            <Text style={styles.coverVerdictLabel}>{verdictLabel}</Text>
            <Text style={styles.coverVerdictReason}>{result.verdictReason}</Text>
          </View>

          {/* Key metrics */}
          <View style={styles.coverMetrics}>
            <View style={styles.coverMetric}>
              <Text style={styles.coverMetricValue}>{formatCurrency(result.annualCostSavings)}</Text>
              <Text style={styles.coverMetricLabel}>Annual savings</Text>
            </View>
            <View style={styles.coverMetric}>
              <Text style={styles.coverMetricValue}>{formatMonths(result.paybackMonths)}</Text>
              <Text style={styles.coverMetricLabel}>Payback period</Text>
            </View>
            <View style={styles.coverMetric}>
              <Text style={styles.coverMetricValue}>{formatNumber(result.annualHoursSaved)} hrs</Text>
              <Text style={styles.coverMetricLabel}>Hours reclaimed</Text>
            </View>
            <View style={styles.coverMetric}>
              <Text style={styles.coverMetricValue}>{result.riskAdjustedScore.toFixed(1)}/10</Text>
              <Text style={styles.coverMetricLabel}>Risk score</Text>
            </View>
          </View>
        </View>

        <View style={styles.coverFooter}>
          <Text>Generated by AutoScore</Text>
          <Text>Estimates only — validate before capital allocation</Text>
        </View>
      </Page>

      {/* ============ PAGE 2: STRATEGIC VALUE + RISKS ============ */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.body}>{result.executiveSummary}</Text>

        <Text style={styles.sectionTitle}>Strategic Value</Text>
        <Text style={styles.body}>Beyond direct savings, this initiative delivers:</Text>
        {result.strategicValueCallouts.map((callout, i) => (
          <View key={i} style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{callout}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Risks & Considerations</Text>
        {result.risks.length === 0 ? (
          <Text style={styles.body}>No material risks identified for this profile.</Text>
        ) : (
          result.risks.map((risk, i) => (
            <View key={i} style={styles.riskItem}>
              <Text style={styles.riskDot}>⚠</Text>
              <Text style={styles.bulletText}>{risk}</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Recommendation</Text>
        <Text style={styles.body}>{result.recommendation}</Text>
      </Page>

      {/* ============ PAGE 3: ROADMAP ============ */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Implementation Roadmap</Text>
        <Text style={styles.body}>
          Phased rollout for {approachMeta?.label.toLowerCase() || 'the recommended'} approach.
        </Text>

        {result.roadmap.map((phase, i) => (
          <View key={i} style={{ marginBottom: 12, paddingLeft: 8, borderLeft: '2px solid #047857' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                {phase.phase}
              </Text>
              <Text style={{ fontSize: 9, color: '#78716c' }}>{phase.duration}</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#44403c', lineHeight: 1.5 }}>
              {phase.description}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>3-Year Financial Projection</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flex: 1, padding: 8, backgroundColor: '#f5f5f4', borderRadius: 4, marginRight: 4 }}>
            <Text style={{ fontSize: 8, color: '#78716c', textTransform: 'uppercase' }}>3-Year Net Value</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#047857', marginTop: 2 }}>
              {formatCurrency(3 * result.annualCostSavings - result.implementationCost)}
            </Text>
          </View>
          <View style={{ flex: 1, padding: 8, backgroundColor: '#f5f5f4', borderRadius: 4, marginRight: 4 }}>
            <Text style={{ fontSize: 8, color: '#78716c', textTransform: 'uppercase' }}>5-Year Net Value</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#047857', marginTop: 2 }}>
              {formatCurrency(result.fiveYearNetValue)}
            </Text>
          </View>
          <View style={{ flex: 1, padding: 8, backgroundColor: '#f5f5f4', borderRadius: 4 }}>
            <Text style={{ fontSize: 8, color: '#78716c', textTransform: 'uppercase' }}>3-Year ROI</Text>
            <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#047857', marginTop: 2 }}>
              {result.threeYearROI > 0 ? '+' : ''}{Math.round(result.threeYearROI)}%
            </Text>
          </View>
        </View>
      </Page>

      {/* ============ PAGE 4+: ACTION PLAN (only if extraction data available) ============ */}
      {extraction && (recommendedTools.length > 0 || extraction.firstStep) && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.sectionTitle}>Action Plan — Recommended Tools</Text>

          {extraction.toolRationale && (
            <View style={styles.callout}>
              <Text style={styles.calloutLabel}>Why these tools</Text>
              <Text style={styles.calloutBody}>{extraction.toolRationale}</Text>
            </View>
          )}

          {recommendedTools.map((tool) => (
            <View key={tool.id} style={styles.toolCard}>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolTagline}>{tool.tagline}</Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Best for: </Text>
                {tool.bestFor}
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>What you do: </Text>
                {tool.whatYouDo}
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Pricing: </Text>
                {tool.startingPrice}
                {tool.freeTier ? ` · ${tool.freeTier}` : ''}
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Get started: </Text>
                {tool.getStartedUrl}
              </Text>
            </View>
          ))}

          {extraction.firstStep && (
            <View style={[styles.callout, { backgroundColor: '#ecfdf5' }]}>
              <Text style={styles.calloutLabel}>Your first step today (~15-30 min)</Text>
              <Text style={styles.calloutBody}>{extraction.firstStep}</Text>
            </View>
          )}

          {extraction.budgetBreakdown && (extraction.budgetBreakdown.tooling || extraction.budgetBreakdown.implementation) && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>Budget Breakdown</Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Tooling: </Text>
                {extraction.budgetBreakdown.tooling || 'N/A'}
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Implementation: </Text>
                {extraction.budgetBreakdown.implementation || 'N/A'}
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Ongoing (annual): </Text>
                {extraction.budgetBreakdown.ongoing || 'N/A'}
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Year 1 total: </Text>
                {extraction.budgetBreakdown.totalYear1 || 'N/A'}
              </Text>
            </View>
          )}

          {extraction.industryBenchmarks && extraction.industryBenchmarks.maturity && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>Industry Benchmarks</Text>
              <Text style={styles.body}>{extraction.industryBenchmarks.maturity}</Text>
              {extraction.industryBenchmarks.commonPatterns.map((p, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{p}</Text>
                </View>
              ))}
              {extraction.industryBenchmarks.averageRoi && (
                <Text style={styles.body}>{extraction.industryBenchmarks.averageRoi}</Text>
              )}
            </View>
          )}
        </Page>
      )}

      {/* ============ CASE STUDIES PAGE (if available) ============ */}
      {caseStudies.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.sectionTitle}>Similar Companies — Real Results</Text>
          <Text style={styles.body}>Companies with similar processes who already automated:</Text>

          {caseStudies.map((study) => (
            <View key={study.id} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e7e5e4' }}>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1c1917', marginBottom: 2 }}>
                {study.title}
              </Text>
              <Text style={{ fontSize: 9, color: '#78716c', marginBottom: 4 }}>
                {study.industry} · {study.companySize}
              </Text>
              <Text style={{ fontSize: 9, color: '#44403c', marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>What they automated: </Text>
                {study.processAutomated}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: '#047857' }}>
                  Time saved: {study.results.timeSaved}
                </Text>
                <Text style={{ fontSize: 9, color: '#047857' }}>
                  Cost saved: {study.results.costSaved}
                </Text>
              </View>
              <Text style={{ fontSize: 9, color: '#44403c', lineHeight: 1.5, marginTop: 4 }}>
                {study.summary}
              </Text>
              <View style={styles.callout}>
                <Text style={styles.calloutLabel}>Key learning</Text>
                <Text style={styles.calloutBody}>{study.keyLearning}</Text>
              </View>
            </View>
          ))}
        </Page>
      )}

      {/* ============ TEMPLATES PAGE (if available) ============ */}
      {templates.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.sectionTitle}>Starter Templates</Text>
          <Text style={styles.body}>Pre-built workflow blueprints you can clone:</Text>

          {templates.map((tpl) => (
            <View key={tpl.id} style={styles.toolCard}>
              <Text style={styles.toolName}>{tpl.title}</Text>
              <Text style={styles.toolTagline}>{tpl.description}</Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Time to build: </Text>
                {tpl.timeToBuild} · Difficulty: {tpl.difficulty}/5
              </Text>
              <Text style={styles.toolField}>
                <Text style={styles.toolLabel}>Template URL: </Text>
                {tpl.templateUrl}
              </Text>
              <Text style={{ fontSize: 9, color: '#44403c', marginTop: 4, lineHeight: 1.5 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Steps: </Text>
                {tpl.steps.join(' → ')}
              </Text>
            </View>
          ))}
        </Page>
      )}

      {/* ============ APPENDIX: ASSESSMENT INPUTS ============ */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Assessment Inputs</Text>
        <Text style={styles.body}>The values used to generate this report:</Text>

        <View style={styles.inputGrid}>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Industry</Text>
            <Text style={styles.inputValue}>{input.industry}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Company size</Text>
            <Text style={styles.inputValue}>{input.companySize}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Frequency</Text>
            <Text style={styles.inputValue}>{input.frequency}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Occurrences / cycle</Text>
            <Text style={styles.inputValue}>{input.occurrencesPerCycle}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Minutes / occurrence</Text>
            <Text style={styles.inputValue}>{input.minutesPerOccurrence}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>People performing</Text>
            <Text style={styles.inputValue}>{input.numberOfPeople}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Loaded $/hour</Text>
            <Text style={styles.inputValue}>${input.hourlyCost}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Approach</Text>
            <Text style={styles.inputValue}>{approachMeta?.label || input.approach}</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Automation %</Text>
            <Text style={styles.inputValue}>{input.automationPercentage}%</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Implementation cost</Text>
            <Text style={styles.inputValue}>
              {input.implementationCost > 0
                ? formatCurrency(input.implementationCost)
                : `${approachMeta?.typicalCost || 'N/A'} (default)`}
            </Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Criticality</Text>
            <Text style={styles.inputValue}>{input.criticality}/5</Text>
          </View>
          <View style={styles.inputItem}>
            <Text style={styles.inputLabel}>Error tolerance</Text>
            <Text style={styles.inputValue}>{input.errorTolerance}/5</Text>
          </View>
        </View>

        <Text style={{ ...styles.sectionTitle, marginTop: 30 }}>Disclaimer</Text>
        <Text style={{ fontSize: 8, color: '#a8a29e', lineHeight: 1.5 }}>
          This report is generated by AutoScore using AI-assisted extraction and a rule-based scoring engine.
          All estimates (savings, ROI, payback) are approximations based on the inputs provided and industry
          benchmarks. Validate assumptions with your finance team before making capital allocation decisions.
          Tool recommendations are based on publicly available information and may not reflect the most
          current pricing or features. Always conduct your own due diligence before purchasing.
        </Text>
      </Page>
    </Document>
  );
}

// Helper to render the PDF to a Buffer (for email attachment)
export async function renderReportToBuffer(
  input: AssessmentInput,
  result: AssessmentResult,
  extraction: ExtractionResult | null
): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const buffer = await renderToBuffer(
    <ReportPDF input={input} result={result} extraction={extraction} />
  );
  return Buffer.from(buffer);
}
