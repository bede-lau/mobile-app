import { GarmentSize, GarmentCategory, BodyMeasurements } from '@/types';

// ─── Malaysian/SEA Size Charts ───────────────────────────────────────────────
// Based on Malaysian Standards MS 1560 and common SEA sizing

interface SizeMeasurements {
  chest_cm: [number, number]; // [min, max]
  waist_cm: [number, number];
  hips_cm: [number, number];
}

type SizeChart = Record<GarmentSize, SizeMeasurements>;

export const WOMEN_SIZE_CHART: SizeChart = {
  XS: { chest_cm: [76, 80], waist_cm: [58, 62], hips_cm: [84, 88] },
  S: { chest_cm: [80, 84], waist_cm: [62, 66], hips_cm: [88, 92] },
  M: { chest_cm: [84, 90], waist_cm: [66, 72], hips_cm: [92, 98] },
  L: { chest_cm: [90, 96], waist_cm: [72, 78], hips_cm: [98, 104] },
  XL: { chest_cm: [96, 104], waist_cm: [78, 86], hips_cm: [104, 112] },
  '2XL': { chest_cm: [104, 112], waist_cm: [86, 94], hips_cm: [112, 120] },
};

export const MEN_SIZE_CHART: SizeChart = {
  XS: { chest_cm: [84, 88], waist_cm: [68, 72], hips_cm: [86, 90] },
  S: { chest_cm: [88, 92], waist_cm: [72, 76], hips_cm: [90, 94] },
  M: { chest_cm: [92, 100], waist_cm: [76, 84], hips_cm: [94, 100] },
  L: { chest_cm: [100, 108], waist_cm: [84, 92], hips_cm: [100, 108] },
  XL: { chest_cm: [108, 116], waist_cm: [92, 100], hips_cm: [108, 116] },
  '2XL': { chest_cm: [116, 124], waist_cm: [100, 108], hips_cm: [116, 124] },
};

// ─── Tolerance ranges for fit classification (cm) ────────────────────────────
export const FIT_TOLERANCE = {
  tight: -3,    // garment is 3cm+ smaller than body
  fitted: -1,   // garment is ~1cm smaller
  regular: 2,   // garment is ~2cm larger (standard ease)
  relaxed: 6,   // garment is ~6cm larger
  oversized: 10, // garment is 10cm+ larger
} as const;

// ─── Size order for comparison ───────────────────────────────────────────────
export const SIZE_ORDER: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

// ─── Helper: get chart by gender ─────────────────────────────────────────────
export function getSizeChart(gender: 'male' | 'female' | 'unisex'): SizeChart {
  return gender === 'male' ? MEN_SIZE_CHART : WOMEN_SIZE_CHART;
}

// ─── Helper: check if measurement is within size range ───────────────────────
export function measurementInRange(
  value: number,
  range: [number, number],
  toleranceCm: number = 2
): boolean {
  return value >= range[0] - toleranceCm && value <= range[1] + toleranceCm;
}

// ─── Height conversion ──────────────────────────────────────────────────────
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

// ─── Currency ────────────────────────────────────────────────────────────────
export function formatMYR(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}
