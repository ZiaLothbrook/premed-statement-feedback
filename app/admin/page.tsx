import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all essays with user info and feedback
  // Note: In production, you'd want to add admin role checking
  const { data: essays } = await supabase
    .from('essays')
    .select(`
      id,
      essay_type,
      character_count,
      created_at,
      profiles!inner (
        email
      ),
      feedback (
        id,
        quality_tags,
        processing_time_seconds,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  // Calculate stats
  const totalSubmissions = essays?.length || 0;
  const submissionsWithFeedback = essays?.filter(e => e.feedback && e.feedback.length > 0).length || 0;
  const avgProcessingTime = essays
    ?.filter(e => e.feedback && e.feedback.length > 0 && e.feedback[0].processing_time_seconds)
    .reduce((sum, e) => sum + (e.feedback[0].processing_time_seconds || 0), 0) / submissionsWithFeedback || 0;

  const essayTypeBreakdown = essays?.reduce((acc: any, essay) => {
    acc[essay.essay_type] = (acc[essay.essay_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary-700 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">View all submissions and analytics</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Total Submissions
              </div>
              <div className="text-3xl font-bold text-primary-700">
                {totalSubmissions}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">
                With Feedback
              </div>
              <div className="text-3xl font-bold text-green-600">
                {submissionsWithFeedback}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Avg Processing Time
              </div>
              <div className="text-3xl font-bold text-accent-600">
                {avgProcessingTime.toFixed(1)}s
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">
                Essay Types
              </div>
              <div className="space-y-1">
                {essayTypeBreakdown && Object.entries(essayTypeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-700">{type}:</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Submissions
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Characters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quality Tags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {essays && essays.map((essay: any) => (
                    <tr key={essay.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {essay.profiles?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                          {essay.essay_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {essay.character_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(essay.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {essay.feedback && essay.feedback.length > 0 ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Complete
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {essay.feedback && essay.feedback[0]?.quality_tags ? (
                          <div className="flex flex-wrap gap-1">
                            {essay.feedback[0].quality_tags.slice(0, 3).map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-accent-100 text-accent-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
