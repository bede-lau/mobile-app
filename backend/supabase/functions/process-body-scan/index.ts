// Supabase Edge Function — Process Body Scan
// Calls GPU worker to generate 3D avatar from body scan images
// Deploy: supabase functions deploy process-body-scan

import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const gpuWorkerUrl = Deno.env.get('GPU_WORKER_URL') || 'http://localhost:8000';

serve(async (req) => {
  try {
    // Validate authorization
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

    const { scan_id } = await req.json();

    // Fetch scan details including image URLs and height
    const { data: scan, error: fetchError } = await supabase
      .from('body_scans')
      .select('*')
      .eq('id', scan_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update scan status to processing
    const { error: updateError } = await supabase
      .from('body_scans')
      .update({ status: 'processing' })
      .eq('id', scan_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare form data for GPU worker
    const formData = new FormData();

    // Download images from storage and add to form
    const imageUrls: string[] = scan.image_urls || [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imagePath = imageUrls[i];
      const { data: imageData } = supabase.storage
        .from('body-scans')
        .getPublicUrl(imagePath);

      if (imageData?.publicUrl) {
        try {
          const imageResponse = await fetch(imageData.publicUrl);
          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            formData.append('images', blob, `frame_${i.toString().padStart(2, '0')}.jpg`);
          }
        } catch (imgError) {
          console.error(`Failed to fetch image ${i}:`, imgError);
        }
      }
    }

    // Add user height (manual input) and IDs
    const heightCm = scan.height_cm || 170; // Default if not provided
    formData.append('height_cm', heightCm.toString());
    formData.append('user_id', user.id);
    formData.append('scan_id', scan_id);

    // Call GPU worker to generate avatar
    let avatarResult;
    try {
      const avatarResponse = await fetch(`${gpuWorkerUrl}/api/v1/generate-avatar`, {
        method: 'POST',
        body: formData,
      });

      avatarResult = await avatarResponse.json();

      if (!avatarResponse.ok || !avatarResult.success) {
        throw new Error(avatarResult.error || 'Avatar generation failed');
      }
    } catch (gpuError) {
      // Update scan status to failed
      await supabase
        .from('body_scans')
        .update({
          status: 'failed',
          error_message: gpuError instanceof Error ? gpuError.message : 'GPU worker error',
        })
        .eq('id', scan_id);

      return new Response(
        JSON.stringify({ error: 'Avatar generation failed', details: String(gpuError) }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call GPU worker to extract measurements
    let measurementsResult;
    try {
      const measurementsResponse = await fetch(`${gpuWorkerUrl}/api/v1/extract-measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_url: avatarResult.avatar_url,
          user_id: user.id,
          height_cm: heightCm,
        }),
      });

      measurementsResult = await measurementsResponse.json();
    } catch (measError) {
      console.error('Measurement extraction failed:', measError);
      // Continue without measurements - avatar was still generated
    }

    // Update scan with completed status (GPU worker already updated the URLs)
    await supabase
      .from('body_scans')
      .update({ status: 'completed' })
      .eq('id', scan_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Body scan processed successfully',
        scan_id,
        avatar_url: avatarResult.avatar_url,
        measurements: measurementsResult?.measurements || null,
        mock: avatarResult.mock || false,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
