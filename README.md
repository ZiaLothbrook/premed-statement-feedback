# Pre-Med Personal Statement Feedback Web App

An AI-powered web application for providing expert feedback on medical school personal statements using Claude AI and RAG (Retrieval-Augmented Generation).

## Features

- ✅ **Magic Link Authentication**: Passwordless email-based login via Supabase
- ✅ **Essay Submission Interface**: Character counter with AMCAS/AACOMAS/TMDSAS format support
- ✅ **AI Feedback Generation**: Paragraph-by-paragraph feedback using Claude API with RAG
- ✅ **Side-by-Side Results**: View original essay and feedback simultaneously
- ✅ **Email Delivery**: Receive feedback as PDF attachment via Postmark
- ✅ **CRM Integration**: Webhook integration with Make.com
- ✅ **Admin Dashboard**: View all submissions and analytics
- ✅ **Medical School HQ Branding**: Blue/orange color palette

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Authentication & Database**: Supabase (PostgreSQL with pgvector)
- **AI**: Claude API (Anthropic) with RAG pipeline
- **Email**: Postmark
- **PDF Generation**: @react-pdf/renderer
- **Hosting**: Vercel (recommended)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- An Anthropic API key (for Claude)
- A Postmark account (for emails)
- A Make.com account (for webhooks, optional)

### 1. Clone and Install

```bash
cd premed-statement-feedback
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase-schema.sql`
3. Run the RAG function from `supabase-rag-function.sql`
4. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Postmark Email
POSTMARK_API_KEY=your-postmark-server-api-key
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# Make.com Webhook (optional)
MAKE_WEBHOOK_URL=your-make-webhook-url

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Get API Keys

#### Anthropic Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key to your `.env.local` file

#### Postmark

1. Sign up at [postmarkapp.com](https://postmarkapp.com)
2. Create a server
3. Go to **Settings** > **API Tokens**
4. Copy the **Server API token**
5. Verify your sender signature or domain
6. Update `POSTMARK_FROM_EMAIL` with a verified email

#### Make.com Webhook (Optional)

1. Create a new scenario at [make.com](https://make.com)
2. Add a **Webhook** module
3. Copy the webhook URL
4. Paste it into your `.env.local` file

### 5. Set Up Email Configuration

In Supabase, configure email templates for magic link authentication:

1. Go to **Authentication** > **Email Templates**
2. Customize the "Magic Link" template if desired
3. Ensure your domain is verified in **Settings** > **Auth**

### 6. Populate Knowledge Base (RAG)

To enable RAG-powered feedback, you'll need to populate the `knowledge_base` table with embeddings from Ryan's personal statement book:

```sql
-- Example: Insert knowledge base content
-- Note: You'll need to generate embeddings using OpenAI or another service
INSERT INTO knowledge_base (content, embedding, metadata)
VALUES (
  'Your expert guidance text here...',
  '[0.1, 0.2, ..., 0.5]'::vector,  -- 1536-dimensional embedding
  '{"source": "personal_statement_book", "chapter": 1}'::jsonb
);
```

**Important**: The current implementation uses placeholder embeddings. For production:

1. Extract text from Ryan's personal statement book
2. Generate embeddings using OpenAI's `text-embedding-3-small` model
3. Insert the content and embeddings into the `knowledge_base` table
4. Update `lib/ai/rag.ts` to use a real embedding service

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### 8. Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy!

Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL.

## Project Structure

```
premed-statement-feedback/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/
│   │   └── feedback/       # API routes for feedback generation and email
│   ├── auth/               # Authentication pages (login, callback, logout)
│   ├── dashboard/          # User dashboard
│   ├── results/[id]/       # Feedback results page
│   ├── submit/             # Essay submission page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── lib/
│   ├── ai/
│   │   └── rag.ts          # RAG pipeline and Claude integration
│   ├── email/
│   │   ├── pdf-generator.ts    # PDF generation
│   │   └── postmark.ts         # Email service
│   └── supabase/
│       ├── client.ts       # Client-side Supabase client
│       └── server.ts       # Server-side Supabase client
├── middleware.ts           # Supabase auth middleware
├── supabase-schema.sql     # Database schema
├── supabase-rag-function.sql   # Vector similarity function
├── .env.example            # Environment variables template
└── package.json
```

## Usage Flow

1. **User Signs In**: Magic link sent to email
2. **Submit Essay**: Paste personal statement, select format (AMCAS/AACOMAS/TMDSAS)
3. **AI Processing**: Claude generates feedback using RAG (~10-15 seconds)
4. **View Results**: Side-by-side display of essay and feedback
5. **Email Delivery**: PDF sent to user's email
6. **Webhook**: Data posted to Make.com for CRM integration

## Customization

### Updating the Feedback Prompt

Edit `lib/ai/rag.ts` in the `buildSystemPrompt()` function to customize the AI's feedback style.

### Changing Branding Colors

Update `tailwind.config.ts`:

```ts
colors: {
  primary: { ... },  // Blue shades
  accent: { ... },   // Orange shades
}
```

### Email Templates

Modify `lib/email/postmark.ts` in the `buildDefaultEmailHtml()` function.

### PDF Styling

Update styles in `lib/email/pdf-generator.ts`.

## Performance Optimization

- **Target**: <15 seconds for feedback generation
- **Caching**: Consider caching frequently used RAG context
- **Streaming**: Implement streaming responses for faster perceived performance
- **Database**: Use Supabase connection pooling for high traffic

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on all Supabase tables
2. **Service Role Key**: Never expose in client-side code
3. **Rate Limiting**: Consider implementing rate limits on API routes
4. **Admin Access**: Add proper admin role checking in production

## Troubleshooting

### Magic Link Not Arriving

- Check Supabase email settings
- Verify email rate limits
- Check spam folder

### Feedback Generation Fails

- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota/limits
- Review server logs for errors

### Email Not Sending

- Verify Postmark API key
- Ensure sender email is verified
- Check Postmark activity log

### RAG Not Working

- Ensure `knowledge_base` table has embeddings
- Verify `match_knowledge_base` function exists
- Implement real embedding generation

## Future Enhancements

- [ ] Historical data import (~17k essays)
- [ ] Fine-tuned model (vs. RAG only)
- [ ] Diff view for essay revisions
- [ ] Payment/billing integration
- [ ] Mobile apps (React Native)
- [ ] Batch processing for admins
- [ ] A/B testing framework

## Support

For issues or questions, refer to the documentation or check server logs.

## License

Proprietary - Medical School HQ

---

Built with ❤️ using Claude AI
