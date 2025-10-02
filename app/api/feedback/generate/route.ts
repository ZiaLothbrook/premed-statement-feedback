import { createClient } from '@/lib/supabase/server';
import { generateFeedback } from '@/lib/ai/rag';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { essayText, essayType } = body;

    if (!essayText || !essayType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate essay type
    if (!['AMCAS', 'AACOMAS', 'TMDSAS'].includes(essayType)) {
      return NextResponse.json({ error: 'Invalid essay type' }, { status: 400 });
    }

    // Insert essay into database
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .insert({
        user_id: user.id,
        essay_text: essayText,
        essay_type: essayType,
        character_count: essayText.length,
      })
      .select()
      .single();

    if (essayError || !essay) {
      console.error('Error inserting essay:', essayError);
      return NextResponse.json(
        { error: 'Failed to save essay' },
        { status: 500 }
      );
    }

    // Generate AI feedback
    const { feedback, processingTime, qualityTags } = await generateFeedback(
      essayText,
      essayType
    );

    // Save feedback to database
    const { error: feedbackError } = await supabase.from('feedback').insert({
      essay_id: essay.id,
      user_id: user.id,
      feedback_text: feedback,
      quality_tags: qualityTags,
      processing_time_seconds: processingTime,
    });

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Send webhook to Make.com
    if (process.env.MAKE_WEBHOOK_URL) {
      try {
        await axios.post(process.env.MAKE_WEBHOOK_URL, {
          email: user.email,
          essay: essayText.substring(0, 500), // Send first 500 chars
          feedback: feedback.substring(0, 500), // Send first 500 chars
          quality_tags: qualityTags,
          essay_type: essayType,
          essay_id: essay.id,
          timestamp: new Date().toISOString(),
        });
      } catch (webhookError) {
        // Log but don't fail the request
        console.error('Error sending webhook:', webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      essayId: essay.id,
      processingTime,
    });
  } catch (error: any) {
    console.error('Error in feedback generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
