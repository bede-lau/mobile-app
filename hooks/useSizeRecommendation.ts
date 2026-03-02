import { useMemo } from 'react';
import { useAvatarStore } from '@/store/avatarStore';
import { getSizeChart, FIT_TOLERANCE, SIZE_ORDER } from '@/constants/sizeCharts';
import type {
  Garment,
  GarmentSize,
  SizeRecommendation,
  FitType,
  BodyMeasurements,
} from '@/types';

function classifyFit(diffCm: number): FitType {
  if (diffCm <= FIT_TOLERANCE.tight) return 'tight';
  if (diffCm <= FIT_TOLERANCE.fitted) return 'fitted';
  if (diffCm <= FIT_TOLERANCE.regular) return 'regular';
  if (diffCm <= FIT_TOLERANCE.relaxed) return 'relaxed';
  return 'oversized';
}

export function useSizeRecommendation(garment: Garment | null): SizeRecommendation | null {
  const { measurements } = useAvatarStore();

  return useMemo(() => {
    if (!garment || !measurements) return null;

    const chart = getSizeChart(garment.gender);
    const available = garment.sizes_available as GarmentSize[];
    if (available.length === 0) return null;

    // Score each available size
    const scored = available.map((size) => {
      const sizeMeasurements = chart[size];
      if (!sizeMeasurements) return { size, score: 999, fitType: 'regular' as FitType };

      // Compute average difference across key measurements
      const chestMid = (sizeMeasurements.chest_cm[0] + sizeMeasurements.chest_cm[1]) / 2;
      const waistMid = (sizeMeasurements.waist_cm[0] + sizeMeasurements.waist_cm[1]) / 2;
      const hipsMid = (sizeMeasurements.hips_cm[0] + sizeMeasurements.hips_cm[1]) / 2;

      const chestDiff = chestMid - measurements.chest_cm;
      const waistDiff = waistMid - measurements.waist_cm;
      const hipsDiff = hipsMid - measurements.hips_cm;

      const avgDiff = (chestDiff + waistDiff + hipsDiff) / 3;
      const score = Math.abs(avgDiff - FIT_TOLERANCE.regular); // how close to ideal ease
      const fitType = classifyFit(avgDiff);

      return { size, score, fitType, chestDiff, waistDiff, hipsDiff };
    });

    scored.sort((a, b) => a.score - b.score);

    const best = scored[0];
    const confidence = Math.max(10, Math.min(98, Math.round(100 - best.score * 10)));

    const alternatives = scored.slice(1, 3).map((s) => ({
      size: s.size,
      fit_type: s.fitType,
      note: s.fitType === 'tight' ? 'Tighter fit' : s.fitType === 'relaxed' ? 'Looser fit' : '',
    }));

    const sizeMeasurements = chart[best.size];
    const measurementComparison: SizeRecommendation['measurement_comparison'] = [];

    if (sizeMeasurements) {
      const chestMid = (sizeMeasurements.chest_cm[0] + sizeMeasurements.chest_cm[1]) / 2;
      const waistMid = (sizeMeasurements.waist_cm[0] + sizeMeasurements.waist_cm[1]) / 2;
      const hipsMid = (sizeMeasurements.hips_cm[0] + sizeMeasurements.hips_cm[1]) / 2;

      measurementComparison.push(
        {
          measurement: 'chest_cm',
          user_cm: measurements.chest_cm,
          garment_cm: chestMid,
          difference_cm: chestMid - measurements.chest_cm,
        },
        {
          measurement: 'waist_cm',
          user_cm: measurements.waist_cm,
          garment_cm: waistMid,
          difference_cm: waistMid - measurements.waist_cm,
        },
        {
          measurement: 'hips_cm',
          user_cm: measurements.hips_cm,
          garment_cm: hipsMid,
          difference_cm: hipsMid - measurements.hips_cm,
        }
      );
    }

    return {
      recommended_size: best.size,
      confidence,
      fit_type: best.fitType,
      alternatives,
      measurement_comparison: measurementComparison,
    };
  }, [garment, measurements]);
}
