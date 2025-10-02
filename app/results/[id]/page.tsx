import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
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
        id,
        feedback_text,
        quality_tags,
        processing_time_seconds,
        created_at
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !essay) {
    notFound();
  }

  const feedback = essay.feedback?.[0];

  if (!feedback) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Feedback Not Yet Available
            </h1>
            <p className="text-gray-600 mb-8">
              Your feedback is still being generated. Please check back in a moment.
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <a
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </a>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Personal Statement Feedback
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                  {essay.essay_type}
                </span>
                <span>{essay.character_count} characters</span>
                <span>
                  {new Date(essay.created_at).toLocaleDateString()}
                </span>
                {feedback.processing_time_seconds && (
                  <span>
                    Generated in {feedback.processing_time_seconds.toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <form action="/api/feedback/email" method="post" className="inline">
                <input type="hidden" name="essayId" value={essay.id} />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  📧 Email PDF
                </button>
              </form>
              <a
                href="/submit"
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium"
              >
                Submit Another
              </a>
            </div>
          </div>
        </div>

        {/* Two-Pane Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Pane: Original Essay */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📝</span>
                Your Personal Statement
              </h2>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                  {essay.essay_text}
                </div>
              </div>
            </div>

            {/* Right Pane: AI Feedback */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                AI Feedback
              </h2>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {feedback.feedback_text}
                </div>
              </div>

              {/* Quality Tags */}
              {feedback.quality_tags && feedback.quality_tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Key Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.quality_tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">
              Need more feedback?
            </h3>
            <p className="mb-6 text-primary-100">
              You can submit multiple revisions to track your progress
            </p>
            <a
              href="/submit"
              className="inline-block bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Submit Another Version
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
