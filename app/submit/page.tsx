'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type EssayType = 'AMCAS' | 'AACOMAS' | 'TMDSAS';

const CHARACTER_LIMITS = {
  AMCAS: 5300,
  AACOMAS: 5300,
  TMDSAS: 5000,
};

export default function SubmitPage() {
  const router = useRouter();
  const [essayText, setEssayText] = useState('');
  const [essayType, setEssayType] = useState<EssayType>('AMCAS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const characterCount = essayText.length;
  const limit = CHARACTER_LIMITS[essayType];
  const isOverLimit = characterCount > limit;
  const percentUsed = (characterCount / limit) * 100;

  const stripFormatting = () => {
    // Remove extra whitespace and normalize
    const stripped = essayText
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .trim();
    setEssayText(stripped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!essayText.trim()) {
      setError('Please enter your essay');
      return;
    }

    if (characterCount > limit) {
      setError(`Your essay exceeds the ${essayType} limit of ${limit} characters. Please trim ${characterCount - limit} characters.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essayText,
          essayType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate feedback');
      }

      // Redirect to results page
      router.push(`/results/${data.essayId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <a
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
            >
              ← Back to Dashboard
            </a>
            <h1 className="text-4xl font-bold text-primary-700 mb-2">
              Submit Your Personal Statement
            </h1>
            <p className="text-gray-600">
              Paste your essay below to receive AI-powered feedback
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Essay Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Application Type
                </label>
                <div className="flex gap-3">
                  {(['AMCAS', 'AACOMAS', 'TMDSAS'] as EssayType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEssayType(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        essayType === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {essayType === 'TMDSAS' ? '5,000' : '5,300'} character limit
                </p>
              </div>

              {/* Essay Textarea */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="essay" className="block text-sm font-medium text-gray-700">
                    Your Personal Statement
                  </label>
                  <button
                    type="button"
                    onClick={stripFormatting}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Strip Formatting
                  </button>
                </div>
                <textarea
                  id="essay"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className={`w-full h-96 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-mono text-sm ${
                    isOverLimit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Paste your personal statement here..."
                  disabled={loading}
                />
              </div>

              {/* Character Counter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-700'}`}>
                    {characterCount.toLocaleString()} / {limit.toLocaleString()} characters
                  </span>
                  {isOverLimit && (
                    <span className="text-sm text-red-600 font-medium">
                      {(characterCount - limit).toLocaleString()} over limit
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOverLimit
                        ? 'bg-red-500'
                        : percentUsed > 90
                        ? 'bg-accent-500'
                        : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !essayText.trim() || isOverLimit}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-lg transition-colors text-lg"
              >
                {loading ? 'Generating Feedback...' : 'Get Feedback'}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Feedback typically takes 10-15 seconds to generate
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
