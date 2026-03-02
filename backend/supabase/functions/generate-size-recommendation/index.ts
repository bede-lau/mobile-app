// Supabase Edge Function — Generate Size Recommendation (Server-side authoritative)
// Deploy: supabase functions deploy generate-size-recommendation

import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Malaysian/SEA size charts
interface ScoredSize {
  size: string;
  score: number;
  fit: string;
}

interface SizeSpecs {
  chest: number[];
  waist: number[];
  hips: number[];
}

interface BodyMeasurements {
  chest_cm: number;
  waist_cm: number;
  hips_cm: number;
}

const WOMEN_SIZE_CHART: Record<string, SizeSpecs> = {
  XS: { chest: [76, 80], waist: [58, 62], hips: [84, 88] },
  S: { chest: [80, 84], waist: [62, 66], hips: [88, 92] },
  M: { chest: [84, 90], waist: [66, 72], hips: [92, 98] },
  L: { chest: [90, 96], waist: [72, 78], hips: [98, 104] },
  XL: { chest: [96, 104], waist: [78, 86], hips: [104, 112] },
  '2XL': { chest: [104, 112], waist: [86, 94], hips: [112, 120] },
};

const MEN_SIZE_CHART: Record<string, SizeSpecs> = {
  XS: { chest: [84, 88], waist: [68, 72], hips: [86, 90] },
  S: { chest: [88, 92], waist: [72, 76], hips: [90, 94] },
  M: { chest: [92, 100], waist: [76, 84], hips: [94, 100] },
  L: { chest: [100, 108], waist: [84, 92], hips: [100, 108] },
  XL: { chest: [108, 116], waist: [92, 100], hips: [108, 116] },
  '2XL': { chest: [116, 124], waist: [100, 108], hips: [116, 124] },
};

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { garment_id, user_id } = await req.json();

    // Fetch user measurements from latest completed scan
    const { data: scan } = await supabase
      .from('body_scans')
      .select('measurements')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!scan?.measurements) {
      return new Response(
        JSON.stringify({ error: 'No measurements found. Complete a body scan first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch garment
    const { data: garment } = await supabase
      .from('garments')
      .select('*')
      .eq('id', garment_id)
      .single();

    if (!garment) {
      return new Response(
        JSON.stringify({ error: 'Garment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const m = scan.measurements as unknown as BodyMeasurements;
    const chart: Record<string, SizeSpecs> = garment.gender === 'male' ? MEN_SIZE_CHART : WOMEN_SIZE_CHART;
    const availableSizes = garment.sizes_available || [];

    // Score each size
    const scored = availableSizes.map((size: string) => {
      const s = chart[size];
      if (!s) return { size, score: 999, fit: 'regular' };

      const chestMid = (s.chest[0] + s.chest[1]) / 2;
      const waistMid = (s.waist[0] + s.waist[1]) / 2;
      const hipsMid = (s.hips[0] + s.hips[1]) / 2;

      const diff = ((chestMid - m.chest_cm) + (waistMid - m.waist_cm) + (hipsMid - m.hips_cm)) / 3;
      const score = Math.abs(diff - 2); // 2cm ease is ideal

      let fit = 'regular';
      if (diff <= -3) fit = 'tight';
      else if (diff <= -1) fit = 'fitted';
      else if (diff <= 2) fit = 'regular';
      else if (diff <= 6) fit = 'relaxed';
      else fit = 'oversized';

      return { size, score, fit };
    });

    scored.sort((a: ScoredSize, b: ScoredSize) => a.score - b.score);
    const best = scored[0];
    const confidence = Math.max(10, Math.min(98, Math.round(100 - best.score * 10)));

    return new Response(
      JSON.stringify({
        recommended_size: best.size,
        confidence,
        fit_type: best.fit,
        alternatives: scored.slice(1, 3).map((s: ScoredSize) => ({
          size: s.size,
          fit_type: s.fit,
        })),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
