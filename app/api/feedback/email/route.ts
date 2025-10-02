import { createClient } from '@/lib/supabase/server';
import { generateFeedbackPDF } from '@/lib/email/pdf-generator';
import { sendFeedbackEmail } from '@/lib/email/postmark';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get essay ID from form data
    const formData = await request.formData();
    const essayId = formData.get('essayId') as string;

    if (!essayId) {
      return NextResponse.json(
        { error: 'Essay ID is required' },
        { status: 400 }
      );
    }

    // Fetch essay and feedback
    const { data: essay, error } = await supabase
      .from('essays')
      .select(`
        id,
        essay_text,
        essay_type,
        character_count,
        created_at,
        feedback (
          feedback_text,
          quality_tags
        )
      `)
      .eq('id', essayId)
      .eq('user_id', user.id)
      .single();

    if (error || !essay || !essay.feedback || essay.feedback.length === 0) {
      return NextResponse.json(
        { error: 'Essay or feedback not found' },
        { status: 404 }
      );
    }

    const feedback = essay.feedback[0];

    // Generate PDF
    const pdfBuffer = await generateFeedbackPDF({
      essayText: essay.essay_text,
      feedbackText: feedback.feedback_text,
      essayType: essay.essay_type,
      characterCount: essay.character_count,
      qualityTags: feedback.quality_tags || [],
      date: new Date(essay.created_at).toLocaleDateString(),
    });

    // Send email with PDF attachment
    await sendFeedbackEmail({
      to: user.email!,
      essayType: essay.essay_type,
      pdfAttachment: pdfBuffer,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
