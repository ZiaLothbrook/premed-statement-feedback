export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-700 mb-4">
            Medical School HQ
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Personal Statement Feedback
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get expert AI-powered feedback on your medical school personal statement
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Get Started
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Sign in with your email to submit your personal statement
          </p>
          <div className="text-center">
            <a
              href="/auth/login"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Continue with Email
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-accent-500 text-4xl mb-4">📝</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Submit Your Essay
            </h4>
            <p className="text-gray-600">
              Paste your AMCAS, AACOMAS, or TMDSAS personal statement
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-accent-500 text-4xl mb-4">🤖</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              AI Analysis
            </h4>
            <p className="text-gray-600">
              Get paragraph-by-paragraph expert feedback in under 15 seconds
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-accent-500 text-4xl mb-4">📧</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Receive Feedback
            </h4>
            <p className="text-gray-600">
              View online and receive a PDF copy via email
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
