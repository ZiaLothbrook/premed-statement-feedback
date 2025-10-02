import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch user's previous essays
  const { data: essays } = await supabase
    .from('essays')
    .select(`
      id,
      essay_type,
      character_count,
      created_at,
      feedback (
        id,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary-700 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome, {user.email}</p>
            </div>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Sign Out
              </button>
            </form>
          </div>

          {/* Submit New Essay CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-3">Submit Your Personal Statement</h2>
            <p className="mb-6 text-primary-100">
              Get AI-powered feedback on your AMCAS, AACOMAS, or TMDSAS personal statement
            </p>
            <a
              href="/submit"
              className="inline-block bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Submit New Essay
            </a>
          </div>

          {/* Previous Submissions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              Your Submissions
            </h3>

            {essays && essays.length > 0 ? (
              <div className="space-y-4">
                {essays.map((essay: any) => (
                  <div
                    key={essay.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                            {essay.essay_type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {essay.character_count} characters
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Submitted {new Date(essay.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {essay.feedback && essay.feedback.length > 0 && (
                          <a
                            href={`/results/${essay.id}`}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                          >
                            View Feedback
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t submitted any essays yet
                </p>
                <a
                  href="/submit"
                  className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Submit Your First Essay
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
