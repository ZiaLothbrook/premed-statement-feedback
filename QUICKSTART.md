# Quick Start Guide

Get the app running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once created, go to **Settings** > **API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Run Database Schema

1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy-paste contents of `supabase-schema.sql`
4. Click "Run"
5. Create another query for `supabase-rag-function.sql` and run it

### 5. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account
3. Go to **API Keys** and create a new key
4. Copy it to `ANTHROPIC_API_KEY` in `.env.local`

### 6. Set Up Postmark (Optional for Testing)

For local testing, you can skip email setup initially. If you want emails:

1. Create account at [postmarkapp.com](https://postmarkapp.com)
2. Create a server
3. Copy the **Server API Token** to `POSTMARK_API_KEY`
4. Verify a sender signature (your email)
5. Add verified email to `POSTMARK_FROM_EMAIL`

### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test the App

1. Click "Continue with Email"
2. Enter your email
3. Check inbox for magic link (might be in spam)
4. Click the link to log in
5. Submit a test essay
6. Wait ~15 seconds for feedback
7. View results!

## Troubleshooting

**Magic link not arriving?**
- Check your Supabase email settings
- Look in spam folder
- Check Supabase logs under **Authentication** > **Logs**

**Feedback generation fails?**
- Verify your `ANTHROPIC_API_KEY` is correct
- Check you have credits/billing set up in Anthropic Console
- Check browser console and Vercel logs for errors

**Can't connect to Supabase?**
- Verify URLs and keys are correct in `.env.local`
- Make sure you ran both SQL files
- Check the pgvector extension is enabled

## Next Steps

Once you have the basic app working:

1. Read `SETUP.md` for production deployment
2. Populate the knowledge base with real content (see `scripts/populate-knowledge-base.ts`)
3. Set up Make.com webhook
4. Deploy to Vercel

## Minimal `.env.local` for Testing

If you want to test without email/webhook integrations:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
ANTHROPIC_API_KEY=your-key

# Optional (can leave as placeholders for testing)
POSTMARK_API_KEY=placeholder
POSTMARK_FROM_EMAIL=test@example.com
MAKE_WEBHOOK_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The app will work without Postmark/Make.com, but:
- Email PDF feature won't work
- Webhook won't send to Make.com

---

**Ready to deploy?** See `SETUP.md` for full deployment guide.
