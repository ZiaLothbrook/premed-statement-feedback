# OpenRouter Configuration

This app uses **OpenRouter** to access various AI models through a single API.

## Current Configuration

- **Model**: `x-ai/grok-4-fast:free` ✨ **FREE**
- **Embeddings**: `openai/text-embedding-3-small`
- **Location**: `lib/ai/rag.ts` (line 83)

## Getting Your API Key

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Add credits to your account ($5-10 is plenty to start)
5. Copy the key to your environment file:

```bash
# Edit your environment file
code ~/local-environments/premed-statement-feedback/.env.local

# Add your key:
OPENROUTER_API_KEY=sk-or-v1-...
```

## Switching Models

To change the AI model, edit `lib/ai/rag.ts` line 82-83:

```typescript
// Current (FREE):
model: 'x-ai/grok-4-fast:free',

// Other options:
model: 'openai/gpt-4o-mini',          // Low cost, good quality
model: 'openai/gpt-4o',               // More capable, more expensive
model: 'anthropic/claude-3.5-sonnet', // Excellent for writing
model: 'anthropic/claude-3-haiku',    // Fast and cheap
model: 'google/gemini-pro',           // Good alternative
```

## Available Models

### Recommended for Essay Feedback:

| Model | Cost per 1M tokens | Best For |
|-------|-------------------|----------|
| **openai/gpt-4o-mini** | $0.15 / $0.60 | 🟢 Great balance (default) |
| openai/gpt-4o | $2.50 / $10 | Highest quality |
| anthropic/claude-3.5-sonnet | $3 / $15 | Best for writing |
| anthropic/claude-3-haiku | $0.25 / $1.25 | Fastest, cheapest |

### For Embeddings (RAG):

Currently using `openai/text-embedding-3-small` - this is cost-effective and works well.

## Cost Estimates

**Per essay feedback** (avg 1,500 token input, 2,000 token output):

- **GPT-4o-mini**: ~$0.001 per essay ✅ (default)
- **GPT-4o**: ~$0.024 per essay
- **Claude 3.5 Sonnet**: ~$0.035 per essay
- **Claude 3 Haiku**: ~$0.003 per essay

**Example**: 100 essays with GPT-4o-mini = ~$0.10

## Embeddings Cost

Using `text-embedding-3-small`:
- $0.02 per 1M tokens
- ~$0.00003 per essay (negligible)

## Model Comparison

### GPT-4o-mini (Default) ✅
- **Pros**: Very affordable, fast, good quality
- **Cons**: Not as nuanced as larger models
- **Use when**: Standard feedback, high volume

### GPT-4o
- **Pros**: Excellent quality, very detailed
- **Cons**: More expensive
- **Use when**: Premium tier, complex essays

### Claude 3.5 Sonnet
- **Pros**: Best for creative/writing tasks, very nuanced
- **Cons**: Most expensive
- **Use when**: Highest quality feedback needed

### Claude 3 Haiku
- **Pros**: Fastest, cheapest
- **Cons**: Less detailed
- **Use when**: Quick feedback, testing

## Tips

1. **Start with GPT-4o-mini** - it's the best value
2. **Monitor costs** at [https://openrouter.ai/activity](https://openrouter.ai/activity)
3. **Set spending limits** in your OpenRouter dashboard
4. **Test different models** to find the right balance for your use case

## Rate Limits

OpenRouter handles rate limiting automatically. If you hit limits:
- Upgrade your account tier
- Implement request queuing (not currently built-in)

## Troubleshooting

**"Invalid API key" error:**
- Check that `OPENROUTER_API_KEY` is set correctly
- Verify you have credits in your OpenRouter account

**"Model not found" error:**
- Check the model name is correct (case-sensitive)
- Verify the model is available on OpenRouter

**Slow responses:**
- Some models are faster than others
- Consider switching to GPT-4o-mini or Claude Haiku

## Advanced: Adding Your Own Models

You can use any model from OpenRouter's catalog:

```typescript
// In lib/ai/rag.ts
const response = await openrouter.chat.completions.create({
  model: 'your-model-id-here',  // Change this
  // ... rest of config
});
```

Browse models at: [https://openrouter.ai/models](https://openrouter.ai/models)

---

**Questions?** Check [OpenRouter Documentation](https://openrouter.ai/docs)
