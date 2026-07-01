// Shareable results utility — encode/decode assessment data into URL-safe strings.
// Uses base64 encoding so results can be shared via URL without any database.
// The entire result is embedded in the URL itself.

import { AssessmentInput, AssessmentResult } from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';

export interface ShareableResult {
  input: AssessmentInput;
  result: AssessmentResult;
  extraction: ExtractionResult | null;
  toolSlug?: string;
  toolName?: string;
  createdAt: string;
}

// Encode a result into a URL-safe base64 string
export function encodeResult(data: ShareableResult): string {
  try {
    const json = JSON.stringify(data);
    // Use Buffer in Node, btoa in browser
    const base64 = typeof window !== 'undefined'
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, 'utf8').toString('base64');
    // Make URL-safe: replace + with -, / with _, remove = padding
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode result:', err);
    return '';
  }
}

// Decode a URL-safe base64 string back into result data
export function decodeResult(encoded: string): ShareableResult | null {
  try {
    // Restore base64: replace - with +, _ with /
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Restore padding
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = typeof window !== 'undefined'
      ? decodeURIComponent(escape(atob(base64)))
      : Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json) as ShareableResult;
  } catch (err) {
    console.error('Failed to decode result:', err);
    return null;
  }
}

// Generate the full share URL
export function getShareUrl(data: ShareableResult): string {
  const encoded = encodeResult(data);
  if (!encoded) return '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://what-to-automate-dq1j.vercel.app';
  return `${baseUrl}/r/${encoded}`;
}

// ============ localStorage history ============

const HISTORY_KEY = 'autoscore_history';
const MAX_HISTORY = 20;

export interface HistoryItem {
  id: string; // timestamp-based
  toolName: string;
  toolSlug?: string;
  processName: string;
  verdict: string;
  verdictLabel: string;
  score?: number;
  annualSavings?: number;
  createdAt: string;
  // Store the full data for re-opening
  data: ShareableResult;
}

export function saveToHistory(item: Omit<HistoryItem, 'id'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };

    // Add to front, remove duplicates (same process name within last hour)
    const filtered = history.filter((h) => {
      if (h.processName === newItem.processName) {
        const age = Date.now() - parseInt(h.id.split('_')[1]);
        return age > 3600000; // Keep if older than 1 hour
      }
      return true;
    });

    filtered.unshift(newItem);

    // Trim to max
    if (filtered.length > MAX_HISTORY) {
      filtered.length = MAX_HISTORY;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save to history:', err);
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
}
