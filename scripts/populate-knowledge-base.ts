/**
 * Script to populate the knowledge base with embeddings from Ryan's book
 *
 * Usage:
 * 1. Install OpenAI SDK: npm install openai
 * 2. Set OPENAI_API_KEY in your .env.local
 * 3. Run: npx tsx scripts/populate-knowledge-base.ts
 */

import { createClient } from '@supabase/supabase-js';

// Uncomment when you have OpenAI API key
// import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Uncomment when you have OpenAI API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

interface KnowledgeBaseEntry {
  content: string;
  metadata: {
    source: string;
    chapter?: number;
    section?: string;
    topic?: string;
  };
}

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Uncomment when you have OpenAI API key
  // const response = await openai.embeddings.create({
  //   model: 'text-embedding-3-small',
  //   input: text,
  // });
  // return response.data[0].embedding;

  // Temporary: Return zero vector (REPLACE WITH REAL EMBEDDINGS)
  console.warn('⚠️  Using placeholder embeddings. Please implement OpenAI embeddings!');
  return new Array(1536).fill(0);
}

/**
 * Add entry to knowledge base
 */
async function addToKnowledgeBase(entry: KnowledgeBaseEntry) {
  console.log(`Adding: ${entry.content.substring(0, 50)}...`);

  const embedding = await generateEmbedding(entry.content);

  const { error } = await supabase.from('knowledge_base').insert({
    content: entry.content,
    embedding,
    metadata: entry.metadata,
  });

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('✓ Added successfully');
  }
}

/**
 * Example knowledge base entries
 * Replace these with actual content from Ryan's book
 */
const exampleEntries: KnowledgeBaseEntry[] = [
  {
    content: `When reviewing personal statements, focus on authenticity over perfection.
    Medical schools want to understand the genuine person behind the application, not read
    a polished marketing document. Look for specific examples that demonstrate the applicant's
    journey to medicine, their understanding of what being a physician entails, and their
    personal qualities that will make them a good doctor.`,
    metadata: {
      source: 'personal_statement_book',
      chapter: 1,
      topic: 'authenticity',
    },
  },
  {
    content: `Strong personal statements tell a story with a clear narrative arc. They should
    have a compelling opening that hooks the reader, a middle section that develops the theme
    with specific examples and reflection, and a conclusion that ties everything together.
    Avoid clichés like "I want to help people" without demonstrating how your unique experiences
    have led you to medicine specifically.`,
    metadata: {
      source: 'personal_statement_book',
      chapter: 2,
      topic: 'structure',
    },
  },
  {
    content: `One of the most common mistakes in personal statements is being too vague. Instead
    of saying "I learned the importance of empathy through volunteering," describe a specific
    moment that changed your perspective. Show, don't tell. Use concrete details to bring your
    experiences to life and help admissions committees see the world through your eyes.`,
    metadata: {
      source: 'personal_statement_book',
      chapter: 3,
      topic: 'specificity',
    },
  },
  {
    content: `The conclusion of a personal statement should not simply summarize what came before.
    Instead, it should demonstrate forward-thinking and show how your past experiences have
    prepared you for the challenges of medical school and beyond. Connect your story to your
    future goals and show admissions committees why you'll be a valuable member of their
    incoming class.`,
    metadata: {
      source: 'personal_statement_book',
      chapter: 4,
      topic: 'conclusion',
    },
  },
  {
    content: `When providing feedback, ask clarifying questions when something is unclear or
    seems underdeveloped. For example: "You mention being inspired by a physician, but what
    specific qualities did they demonstrate that influenced your decision?" This helps applicants
    understand where they need to add more depth without telling them exactly what to write.`,
    metadata: {
      source: 'personal_statement_book',
      chapter: 5,
      topic: 'feedback_philosophy',
    },
  },
];

/**
 * Main function to populate knowledge base
 */
async function main() {
  console.log('🚀 Starting knowledge base population...\n');

  for (const entry of exampleEntries) {
    await addToKnowledgeBase(entry);
    // Add small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n✅ Knowledge base population complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Extract content from Ryan\'s personal statement book');
  console.log('2. Split into logical chunks (~500-1000 words each)');
  console.log('3. Update the exampleEntries array with real content');
  console.log('4. Get an OpenAI API key and uncomment the OpenAI code');
  console.log('5. Run this script again with real embeddings');
}

// Run the script
main().catch(console.error);
