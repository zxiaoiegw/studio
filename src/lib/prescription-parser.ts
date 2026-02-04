/**
 * Parses OCR text from a prescription to extract medication information.
 * This is a basic parser - can be enhanced with NLP/LLM for better accuracy.
 */

export type ParsedMedication = {
  name?: string;
  dosage?: string;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'custom';
    times: string[];
  };
  refill?: {
    quantity?: number;
    reminderThreshold?: number;
  };
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
};

/**
 * Common medication names to help identify drugs in OCR text
 */
const COMMON_MEDICATIONS = [
  'lisinopril',
  'metformin',
  'amlodipine',
  'omeprazole',
  'atorvastatin',
  'metoprolol',
  'albuterol',
  'gabapentin',
  'sertraline',
  'montelukast',
  'tramadol',
  'trazodone',
  'ibuprofen',
  'acetaminophen',
  'aspirin',
  'warfarin',
  'levothyroxine',
  'azithromycin',
  'amoxicillin',
  'prednisone',
];

/**
 * Frequency patterns to detect schedule
 */
const FREQUENCY_PATTERNS = {
  daily: /\b(once\s+)?daily|qd|every\s+day|1x\s+day\b/gi,
  twice: /\btwice\s+daily|bid|two\s+times\s+daily|2x\s+daily\b/gi,
  three: /\bthree\s+times|tid|3x\s+daily\b/gi,
  four: /\bfour\s+times|qid|4x\s+daily\b/gi,
  weekly: /\bweekly|once\s+per\s+week\b/gi,
  prn: /\bprn|as\s+needed\b/gi,
};

/**
 * Time patterns to extract dosing times
 */
const TIME_PATTERNS = [
  /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/gi, // "9:00 AM", "14:30"
  /\b(\d{1,2})\s*(am|pm)\b/gi, // "9 AM", "2pm"
  /\bmorning|am\b/gi,
  /\bnoon|midday\b/gi,
  /\bafternoon\b/gi,
  /\bevening|pm\b/gi,
  /\bnight|bedtime\b/gi,
];

/**
 * Dosage patterns
 */
const DOSAGE_PATTERN = /\b(\d+(?:\.\d+)?)\s*(mg|ml|mcg|g|tablet|tab|cap|capsule|unit|units)\b/gi;

/**
 * Quantity patterns
 */
const QUANTITY_PATTERN = /\b(qty|quantity|dispense|disp|#)\s*:?\s*(\d+)\b/gi;

export function parsePrescriptionText(ocrText: string): ParsedMedication {
  const text = ocrText.toLowerCase();
  const result: ParsedMedication = {
    confidence: 'low',
    rawText: ocrText,
  };

  // Extract medication name
  for (const med of COMMON_MEDICATIONS) {
    if (text.includes(med)) {
      result.name = med.charAt(0).toUpperCase() + med.slice(1);
      result.confidence = 'medium';
      break;
    }
  }

  // If no common medication found, try to extract capitalized words (likely drug names)
  if (!result.name) {
    const lines = ocrText.split('\n');
    for (const line of lines.slice(0, 5)) {
      // Look for capitalized words that might be medication names
      const words = line.split(/\s+/).filter((w) => /^[A-Z][a-z]+$/.test(w));
      if (words.length > 0 && words.length <= 3) {
        result.name = words.join(' ');
        result.confidence = 'low';
        break;
      }
    }
  }

  // Extract dosage
  const dosageMatch = text.match(DOSAGE_PATTERN);
  if (dosageMatch) {
    // Take the first dosage found
    const dosage = dosageMatch[0].trim();
    result.dosage = dosage;
    if (result.confidence === 'low') result.confidence = 'medium';
  }

  // Extract schedule frequency
  let frequency: 'daily' | 'weekly' | 'custom' = 'daily';
  let times: string[] = [];

  if (FREQUENCY_PATTERNS.daily.test(text)) {
    frequency = 'daily';
    times = ['09:00']; // Default morning time
  } else if (FREQUENCY_PATTERNS.twice.test(text)) {
    frequency = 'daily';
    times = ['09:00', '21:00']; // Morning and evening
  } else if (FREQUENCY_PATTERNS.three.test(text)) {
    frequency = 'daily';
    times = ['08:00', '14:00', '20:00']; // Every 8 hours
  } else if (FREQUENCY_PATTERNS.weekly.test(text)) {
    frequency = 'weekly';
    times = ['09:00'];
  } else {
    frequency = 'custom';
    times = ['09:00'];
  }

  // Extract specific times
  const extractedTimes: string[] = [];
  for (const pattern of TIME_PATTERNS) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[0].includes('morning') || match[0].includes('am')) {
        extractedTimes.push('09:00');
      } else if (match[0].includes('noon') || match[0].includes('midday')) {
        extractedTimes.push('12:00');
      } else if (match[0].includes('afternoon')) {
        extractedTimes.push('15:00');
      } else if (match[0].includes('evening') || match[0].includes('pm')) {
        extractedTimes.push('18:00');
      } else if (match[0].includes('night') || match[0].includes('bedtime')) {
        extractedTimes.push('21:00');
      } else if (match[1] && match[2]) {
        // Time format like "9:00" or "14:30"
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const period = match[3]?.toLowerCase() || match[2]?.toLowerCase();

        if (period === 'pm' && hour < 12) hour += 12;
        if (period === 'am' && hour === 12) hour = 0;

        extractedTimes.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
      }
    }
  }

  if (extractedTimes.length > 0) {
    // Remove duplicates and sort
    times = [...new Set(extractedTimes)].sort();
    frequency = extractedTimes.length > 1 ? 'daily' : frequency;
  }

  result.schedule = {
    frequency,
    times: times.length > 0 ? times : ['09:00'],
  };

  // Extract quantity
  const quantityMatch = text.match(QUANTITY_PATTERN);
  if (quantityMatch) {
    const quantity = parseInt(quantityMatch[0].match(/\d+/)![0]);
    result.refill = {
      quantity,
      reminderThreshold: Math.max(5, Math.floor(quantity * 0.2)), // 20% or min 5
    };
    if (result.confidence === 'low') result.confidence = 'medium';
  } else {
    // Default values
    result.refill = {
      quantity: 30,
      reminderThreshold: 5,
    };
  }

  // Boost confidence if we found multiple fields
  if (result.name && result.dosage && result.schedule) {
    result.confidence = 'high';
  }

  return result;
}
