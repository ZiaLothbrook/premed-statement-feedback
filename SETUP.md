# Deployment Setup Guide

This guide walks you through deploying the Pre-Med Personal Statement Feedback app from scratch.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Supabase Configuration](#supabase-configuration)
3. [Anthropic API Setup](#anthropic-api-setup)
4. [Postmark Email Setup](#postmark-email-setup)
5. [Make.com Webhook Setup](#makecom-webhook-setup)
6. [Local Development](#local-development)
7. [Production Deployment](#production-deployment)
8. [Post-Deployment Tasks](#post-deployment-tasks)

---

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Copy Environment Template

```bash
cp .env.example .env.local
```

---

## Supabase Configuration

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `premed-feedback` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify success (should see green checkmark)

6. Create a new query for the RAG function:
7. Copy contents of `supabase-rag-function.sql`
8. Paste and click "Run"

### Step 4: Configure Authentication

1. Go to **Authentication** > **Settings**
2. Under **Site URL**, set to `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - Your production URL (e.g., `https://yourapp.vercel.app/auth/callback`)
4. Disable **Email Confirmations** if you want simpler testing
5. Under **Email Templates** > **Magic Link**:
   - Customize the template if desired
   - Default template works fine

### Step 5: Enable Vector Extension

The schema already includes this, but verify:

1. Go to **Database** > **Extensions**
2. Search for `vector`
3. Ensure it's enabled (green toggle)

---

## Anthropic API Setup

### Step 1: Create Account

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Complete onboarding

### Step 2: Get API Key

1. Navigate to **API Keys** in the sidebar
2. Click "Create Key"
3. Give it a name (e.g., "PreMed App - Production")
4. Copy the key immediately (you won't see it again!)
5. Add to `.env.local` as `ANTHROPIC_API_KEY`

### Step 3: Set Up Billing

1. Go to **Billing**
2. Add a payment method
3. Set up usage limits if desired
4. Recommended: Set a monthly budget alert

### Pricing Note

- Claude 3.5 Sonnet costs approximately $3 per million input tokens, $15 per million output tokens
- Average essay: ~1,500 tokens input, ~2,000 tokens output
- Estimated cost per feedback: ~$0.035

---

## Postmark Email Setup

### Step 1: Create Account

1. Go to [postmarkapp.com](https://postmarkapp.com)
2. Sign up for an account
3. Choose a plan (Free tier: 100 emails/month)

### Step 2: Create Server

1. Click "Servers" in the sidebar
2. Click "Create a Server"
3. Name it (e.g., "PreMed Feedback App")
4. Click "Create Server"

### Step 3: Get API Token

1. In your server, go to **API Tokens**
2. Copy the **Server API Token**
3. Add to `.env.local` as `POSTMARK_API_KEY`

### Step 4: Verify Sender Signature

**Option A: Single Email (Easier for Testing)**

1. Go to **Sender Signatures**
2. Click "Add Sender Signature"
3. Enter your email address
4. Click "Send Verification Email"
5. Check your inbox and click the verification link
6. Use this email for `POSTMARK_FROM_EMAIL` in `.env.local`

**Option B: Domain (Better for Production)**

1. Go to **Sender Signatures** > **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (can take up to 48 hours)
6. Use an email like `noreply@yourdomain.com` for `POSTMARK_FROM_EMAIL`

### Step 5: Configure Message Stream

1. Go to **Message Streams**
2. Select "Transactional"
3. This is where your emails will be sent from

---

## Make.com Webhook Setup

### Step 1: Create Account

1. Go to [make.com](https://make.com)
2. Sign up for a free account

### Step 2: Create Scenario

1. Click "Create a new scenario"
2. Click the "+" button to add a module
3. Search for "Webhooks"
4. Select "Custom webhook"
5. Click "Add" to create a new webhook
6. Give it a name (e.g., "PreMed Feedback Submissions")
7. Click "Save"

### Step 3: Get Webhook URL

1. Copy the webhook URL shown
2. Add to `.env.local` as `MAKE_WEBHOOK_URL`
3. Click "OK" in the webhook module

### Step 4: Configure Workflow

Example workflow modules to add:

1. **Webhook** (already added)
2. **Router** → Route to different actions based on data
3. **Google Sheets** → Log submissions
4. **Airtable** → Add to CRM
5. **Slack** → Send notifications
6. **HTTP** → Call another API

### Step 5: Test Webhook

1. Keep the Make scenario open
2. Submit a test essay in your app
3. Make should receive the webhook data
4. Verify the data structure is correct

---

## Local Development

### 1. Verify Environment Variables

Ensure `.env.local` has all required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-api...
POSTMARK_API_KEY=xxxxx-xxx-xxx
POSTMARK_FROM_EMAIL=noreply@yourdomain.com
MAKE_WEBHOOK_URL=https://hook.make.com/xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Continue with Email"
3. Enter your email address
4. Check your inbox for the magic link
5. Click the link to log in
6. Submit a test essay
7. Wait for feedback generation
8. Verify feedback appears correctly
9. Test email PDF delivery

---

## Production Deployment

### Step 1: Prepare for Deployment

1. **Update environment variables** in `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
   ```

2. **Build locally to test**:
   ```bash
   npm run build
   npm start
   ```

3. **Fix any build errors** before deploying

### Step 2: Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/premed-feedback.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**:
   - In the import screen, expand "Environment Variables"
   - Add ALL variables from your `.env.local`
   - **Important**: Use production URLs for `NEXT_PUBLIC_APP_URL`

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - Click the domain to view your app

### Step 3: Update Supabase Settings

1. Go back to Supabase > **Authentication** > **Settings**
2. Update **Site URL** to your production URL
3. Add your production URL to **Redirect URLs**:
   - `https://yourapp.vercel.app/auth/callback`

### Step 4: Test Production

1. Visit your production URL
2. Test the complete user flow
3. Verify emails are sent correctly
4. Check Make.com receives webhook data

---

## Post-Deployment Tasks

### 1. Populate Knowledge Base

To enable RAG, you need to add embeddings to the `knowledge_base` table.

**Using OpenAI Embeddings** (recommended):

```typescript
// Example script to generate embeddings
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(url, serviceKey);

async function addToKnowledgeBase(text: string, metadata: any) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = response.data[0].embedding;

  // Insert into Supabase
  await supabase.from('knowledge_base').insert({
    content: text,
    embedding,
    metadata,
  });
}

// Add content from Ryan's book
await addToKnowledgeBase(
  "Your expert guidance text...",
  { source: 'book', chapter: 1 }
);
```

**Steps**:

1. Extract text from Ryan's personal statement book
2. Split into logical chunks (~500-1000 words each)
3. Generate embeddings using the script above
4. Insert into the `knowledge_base` table
5. Update `lib/ai/rag.ts` to use OpenAI for embeddings

### 2. Monitor Performance

- **Supabase Dashboard**: Check query performance
- **Vercel Analytics**: Monitor page load times
- **Anthropic Console**: Track API usage and costs
- **Postmark**: Monitor email deliverability

### 3. Set Up Monitoring

**Recommended tools**:

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Mixpanel**: User analytics

### 4. Configure Custom Domain (Optional)

1. In Vercel, go to **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 5. Implement Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Example using Vercel KV
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const { success } = await ratelimit.limit(
    request.headers.get('x-forwarded-for') ?? 'anonymous'
  );

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }

  // ... rest of your code
}
```

### 6. Backup Strategy

- **Supabase**: Automatic daily backups (check **Database** > **Backups**)
- **Code**: Keep GitHub repository up to date
- **Embeddings**: Export `knowledge_base` table periodically

---

## Troubleshooting

### Common Issues

**Magic link not working**:
- Check Supabase email logs
- Verify redirect URLs in Supabase settings
- Check spam folder

**Feedback generation fails**:
- Verify Anthropic API key
- Check API quota limits
- Review Vercel function logs

**Emails not sending**:
- Verify Postmark sender signature
- Check Postmark activity log
- Ensure `POSTMARK_FROM_EMAIL` is verified

**Webhook not firing**:
- Check Make.com webhook URL
- Verify webhook is active
- Check Vercel function logs

### Getting Help

- Check Vercel deployment logs
- Review Supabase logs
- Check browser console for errors
- Review server logs in Vercel dashboard

---

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is in environment variables only (not in code)
- [ ] Row Level Security enabled on all tables
- [ ] Redirect URLs configured in Supabase
- [ ] Rate limiting implemented
- [ ] CORS configured correctly
- [ ] Admin routes protected
- [ ] API keys not committed to GitHub
- [ ] `.env.local` in `.gitignore`

---

## Next Steps

Once deployed, consider:

1. Adding analytics to track user engagement
2. Implementing A/B testing for feedback quality
3. Creating a feedback loop for users to rate AI feedback
4. Building a dashboard for Ryan to review submissions
5. Automating knowledge base updates

---

**Questions?** Review the README.md or check your deployment logs.

Good luck! 🚀
