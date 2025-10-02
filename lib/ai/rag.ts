import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Create a Supabase client with service role for vector search
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generate embeddings for text using Anthropic's embedding model
 * Note: Anthropic doesn't have an embedding API, so we'll use a placeholder
 * In production, you'd use OpenAI embeddings or another service
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // This is a placeholder - in production, use OpenAI's text-embedding-3-small
  // or another embedding service. For now, return a mock embedding.

  // You would do something like:
  // const response = await openai.embeddings.create({
  //   model: "text-embedding-3-small",
  //   input: text,
  // });
  // return response.data[0].embedding;

  // For now, return a zero vector (you'll need to implement real embeddings)
  return new Array(1536).fill(0);
}

/**
 * Retrieve relevant context from knowledge base using RAG
 */
export async function retrieveRelevantContext(
  essayText: string,
  limit: number = 5
): Promise<string[]> {
  try {
    // Generate embedding for the essay
    const embedding = await generateEmbedding(essayText);

    // Query Supabase for similar documents using vector similarity
    const { data, error } = await supabaseAdmin.rpc('match_knowledge_base', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
    });

    if (error) {
      console.error('Error retrieving context:', error);
      return [];
    }

    return data?.map((item: any) => item.content) || [];
  } catch (error) {
    console.error('Error in RAG pipeline:', error);
    return [];
  }
}

/**
 * Generate feedback using Claude with RAG context
 */
export async function generateFeedback(
  essayText: string,
  essayType: string
): Promise<{ feedback: string; processingTime: number; qualityTags: string[] }> {
  const startTime = Date.now();

  try {
    // Retrieve relevant context from knowledge base
    const relevantContext = await retrieveRelevantContext(essayText);

    // Build the system prompt with RAG context
    const systemPrompt = buildSystemPrompt(relevantContext, essayType);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please provide detailed, paragraph-by-paragraph feedback on this ${essayType} personal statement:\n\n${essayText}`,
        },
      ],
    });

    const feedbackText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Extract quality tags from the feedback
    const qualityTags = extractQualityTags(feedbackText);

    const processingTime = (Date.now() - startTime) / 1000;

    return {
      feedback: feedbackText,
      processingTime,
      qualityTags,
    };
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw new Error('Failed to generate feedback');
  }
}

/**
 * Build system prompt with RAG context
 */
function buildSystemPrompt(relevantContext: string[], essayType: string): string {
  const contextSection = relevantContext.length > 0
    ? `\n\nRelevant guidance from our knowledge base:\n${relevantContext.join('\n\n')}`
    : '';

  return `You are an expert medical school admissions consultant specializing in personal statement feedback. Your role is to provide constructive, specific, and actionable feedback on personal statements.

Your feedback style:
- Provide paragraph-by-paragraph specific feedback
- Focus on what works and what doesn't, with clear reasoning
- Suggest what to cut and where to expand
- Ask clarifying questions when the text is ambiguous or unclear
- Maintain the applicant's authentic voice - don't suggest making it sound like a template
- Be encouraging but honest about areas needing improvement
- Focus on storytelling, clarity, and demonstrating motivation for medicine

Avoid:
- Generic or templated responses
- Rigid rubrics or checklists
- Rewriting the essay for them
- Being overly prescriptive about structure

For ${essayType} essays:
- Character limit is ${essayType === 'TMDSAS' ? '5,000' : '5,300'} characters
- Focus on clarity, authenticity, and demonstrating commitment to medicine
${contextSection}

Provide your feedback in a clear, organized manner with specific paragraph references.`;
}

/**
 * Extract quality tags from feedback text
 */
function extractQualityTags(feedbackText: string): string[] {
  const tags: string[] = [];

  const tagPatterns = [
    { pattern: /storytelling|narrative|story/i, tag: 'Storytelling' },
    { pattern: /motivation|why medicine/i, tag: 'Motivation' },
    { pattern: /clarity|clear|confus/i, tag: 'Clarity' },
    { pattern: /specific|vague|detail/i, tag: 'Specificity' },
    { pattern: /structure|organization/i, tag: 'Structure' },
    { pattern: /authentic|voice|genuine/i, tag: 'Authenticity' },
    { pattern: /transition|flow|connect/i, tag: 'Transitions' },
    { pattern: /conclusion|ending/i, tag: 'Conclusion' },
    { pattern: /opening|hook|introduction/i, tag: 'Opening' },
  ];

  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(feedbackText) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags.slice(0, 5); // Limit to 5 tags
}
