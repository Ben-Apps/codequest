'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Bot, BookOpen, Calendar, ChevronRight, Clock, Code2, MessageSquare, Newspaper, Rocket, Shield, Share2, Sparkles, User, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Blog posts data
const BLOG_POSTS = [
  {
    slug: 'how-ai-agents-are-changing-the-future-of-coding',
    title: 'How AI Agents Are Changing the Future of Coding',
    excerpt: 'A deep dive into the world of autonomous AI agents and how they make developers more productive.',
    category: 'AI Agents',
    date: 'Jan 28, 2026',
    readTime: '5 min',
    icon: Bot,
    gradient: 'from-emerald-500/20 to-emerald-600/20',
    author: 'Grace',
    authorRole: 'Quest Master',
    content: `
## The Rise of AI Agents

AI agents are revolutionizing how we approach software development. Unlike traditional AI assistants that simply respond to prompts, agents can autonomously plan, execute, and iterate on complex tasks.

### What Makes Agents Different?

Traditional AI tools are reactive—they wait for your input. AI agents are proactive. They can:

- **Plan multi-step tasks** and break them down into manageable pieces
- **Use tools** like file systems, browsers, and APIs
- **Learn from feedback** and adjust their approach
- **Collaborate** with other agents for complex workflows

### Real-World Applications

In codequest.city, you'll encounter agents like Otto who manages workflow automation, or Shield who specializes in security. Each agent demonstrates how specialized AI can excel in its domain.

\`\`\`javascript
// Example: An agent planning a code review
const reviewAgent = {
  plan: [
    'Analyze code structure',
    'Check for security vulnerabilities',
    'Suggest performance improvements',
    'Generate documentation'
  ],
  execute: async (code) => {
    // Agent autonomously works through each step
  }
};
\`\`\`

### The Future is Agentic

As agents become more sophisticated, the role of developers will shift from writing every line of code to orchestrating intelligent systems. The key skill becomes **understanding how to direct and collaborate with AI agents effectively**.

This is exactly what codequest.city teaches you—through hands-on quests that put you in control of real AI agents.
    `,
  },
  {
    slug: 'n8n-workflow-automation-for-beginners',
    title: 'n8n Workflow Automation for Beginners',
    excerpt: 'Your first step into the world of workflow automation with n8n. Simply explained.',
    category: 'Tutorial',
    date: 'Jan 25, 2026',
    readTime: '8 min',
    icon: Workflow,
    gradient: 'from-emerald-600/20 to-teal-500/20',
    author: 'Otto',
    authorRole: 'Automation Master',
    content: `
## Getting Started with n8n

n8n is a powerful open-source workflow automation tool that lets you connect different apps and services without writing complex code.

### Why n8n?

Unlike other automation tools, n8n gives you:

- **Full control** over your data (self-hosted option)
- **Visual workflow builder** that's intuitive to use
- **Over 400 integrations** out of the box
- **Custom code nodes** when you need more power

### Your First Workflow

Let's create a simple workflow that monitors a GitHub repository and sends Slack notifications for new issues.

\`\`\`json
{
  "nodes": [
    {
      "name": "GitHub Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "events": ["issues"]
      }
    },
    {
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#dev-alerts",
        "text": "New issue: {{$json.title}}"
      }
    }
  ]
}
\`\`\`

### Best Practices

1. **Start simple** - Build small workflows first
2. **Use error handling** - Always add error nodes
3. **Document your workflows** - Add sticky notes
4. **Test thoroughly** - Use the manual execution feature

### Next Steps

Visit the Automation Factory in codequest.city to practice building workflows with Otto's guidance!
    `,
  },
  {
    slug: 'secure-api-development-best-practices',
    title: 'Secure API Development: Best Practices',
    excerpt: 'Learn the essential security practices for modern APIs and protect your applications.',
    category: 'Security',
    date: 'Jan 22, 2026',
    readTime: '6 min',
    icon: Shield,
    gradient: 'from-teal-500/20 to-emerald-500/20',
    author: 'Shield',
    authorRole: 'Security Expert',
    content: `
## Securing Your APIs

APIs are the backbone of modern applications, but they're also a prime target for attackers. Let's explore essential security practices.

### Authentication & Authorization

Never roll your own auth. Use proven solutions:

\`\`\`javascript
// Good: Using JWT with proper validation
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'codequest.city'
    });
  } catch (err) {
    throw new UnauthorizedError('Invalid token');
  }
};
\`\`\`

### Input Validation

Always validate and sanitize user input:

- Use schema validation (Zod, Joi)
- Sanitize HTML to prevent XSS
- Parameterize database queries
- Limit request body size

### Rate Limiting

Protect against abuse:

\`\`\`javascript
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit per IP
  message: 'Too many requests'
};
\`\`\`

### Security Headers

Always set proper headers:

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security

### Practice at the Security Hub

Visit Shield at the Security Hub in codequest.city to test your knowledge with real security challenges!
    `,
  },
  {
    slug: 'prompt-engineering-masterclass',
    title: 'Prompt Engineering Masterclass',
    excerpt: 'Master the art of prompt engineering and get the most out of LLMs.',
    category: 'AI Basics',
    date: 'Jan 19, 2026',
    readTime: '10 min',
    icon: MessageSquare,
    gradient: 'from-emerald-400/20 to-emerald-600/20',
    author: 'Bernie',
    authorRole: 'News Agent',
    content: `
## The Art of Prompt Engineering

Getting the best results from LLMs isn't about magic—it's about clear communication and understanding how these models think.

### Core Principles

1. **Be Specific** - Vague prompts get vague answers
2. **Provide Context** - Give relevant background
3. **Define the Format** - Specify output structure
4. **Use Examples** - Show what you want

### Effective Prompt Structure

\`\`\`
Role: You are an expert [role]
Context: [Background information]
Task: [What you want done]
Format: [How to structure the output]
Constraints: [Limitations or requirements]
\`\`\`

### Advanced Techniques

**Chain of Thought**: Ask the model to think step by step

\`\`\`
Solve this problem step by step:
1. First, identify...
2. Then, analyze...
3. Finally, conclude...
\`\`\`

**Few-Shot Learning**: Provide examples

\`\`\`
Convert these sentences to formal English:
"gonna grab some food" → "I am going to get something to eat"
"wanna help me out?" → "Would you be willing to assist me?"
"let's bounce" → [model completes]
\`\`\`

### Common Mistakes

- Being too vague
- Not specifying output format
- Ignoring context window limits
- Not iterating on prompts

Master these skills in codequest.city's AI University!
    `,
  },
  {
    slug: 'clean-code-principles-for-ai-assisted-coding',
    title: 'Clean Code Principles for AI-Assisted Coding',
    excerpt: 'Why clean code is more important than ever when AI tools help with development.',
    category: 'Best Practices',
    date: 'Jan 16, 2026',
    readTime: '7 min',
    icon: Code2,
    gradient: 'from-green-500/20 to-emerald-500/20',
    author: 'Grace',
    authorRole: 'Quest Master',
    content: `
## Clean Code in the AI Era

With AI generating more of our code, maintaining clean code principles is more important than ever.

### Why It Matters More Now

AI-generated code can be:
- Verbose when it should be concise
- Missing important edge cases
- Inconsistent with your codebase style
- Technically correct but hard to maintain

### Essential Principles

#### 1. Meaningful Names

\`\`\`javascript
// Bad
const d = new Date();
const x = users.filter(u => u.a > 18);

// Good
const currentDate = new Date();
const adultUsers = users.filter(user => user.age > 18);
\`\`\`

#### 2. Single Responsibility

Each function should do one thing well:

\`\`\`javascript
// Bad
function processUser(user) {
  validateUser(user);
  saveToDatabase(user);
  sendWelcomeEmail(user);
  logActivity(user);
}

// Good
function onboardUser(user) {
  const validatedUser = validateUser(user);
  const savedUser = await saveUser(validatedUser);
  await notifyUser(savedUser);
}
\`\`\`

#### 3. Comment Why, Not What

\`\`\`javascript
// Bad: Describes what code does
// Loop through users and check age
users.forEach(u => checkAge(u));

// Good: Explains why
// GDPR requires age verification before data processing
users.forEach(user => verifyAgeCompliance(user));
\`\`\`

### Reviewing AI-Generated Code

Always review AI code for:
- Consistency with your codebase
- Proper error handling
- Security implications
- Performance considerations

Practice code review skills at the Code Farm!
    `,
  },
  {
    slug: 'the-future-of-codequest-city',
    title: 'The Future of codequest.city',
    excerpt: 'A look at upcoming features: new districts, agents, and community events.',
    category: 'Updates',
    date: 'Jan 12, 2026',
    readTime: '4 min',
    icon: Rocket,
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    author: 'Grace',
    authorRole: 'Quest Master',
    content: `
## What's Coming to codequest.city

We're excited to share our roadmap for the coming months. Here's what Vibe Coders can look forward to!

### New Districts

**The Data Forge** 🔥
- Learn data engineering fundamentals
- Build ETL pipelines
- Master SQL and NoSQL databases

**The Cloud Citadel** ☁️
- Cloud architecture basics
- Container orchestration
- Serverless computing

### New Agents

- **Atlas** - Infrastructure specialist
- **Cipher** - Cryptography expert
- **Flux** - Real-time systems guide

### Community Features

**Guilds**
Form or join guilds with other learners:
- Shared leaderboards
- Group challenges
- Mentorship programs

**Weekly Events**
- Code jams
- Bug bounty hunts
- Agent battles

### Enhanced Learning

**Skill Trees**
Visual progression paths showing:
- Prerequisites
- Unlocked abilities
- Mastery levels

**Certificates**
Earn verifiable certificates for completing learning paths.

### Stay Updated

Follow our progress and join the community:
- Discord server (coming soon)
- Weekly newsletter
- Twitter updates

Thank you for being part of codequest.city! 🎮
    `,
  },
]

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const post = BLOG_POSTS.find(p => p.slug === slug)
  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === slug)
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null

  if (!post) {
    return (
      <main className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-white/60 mb-8">The blog post you're looking for doesn't exist.</p>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-400">
            <Link href="/#blog">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const Icon = post.icon

  return (
    <main className="relative min-h-screen bg-[#0a0f0d]">
      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .retro-font {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          letter-spacing: -0.02em;
        }
        .mono-font {
          font-family: 'JetBrains Mono', monospace;
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .prose-custom h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .prose-custom h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .prose-custom h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose-custom p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .prose-custom ul, .prose-custom ol {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .prose-custom li {
          margin-bottom: 0.5rem;
        }
        .prose-custom strong {
          color: rgba(16, 185, 129, 0.9);
          font-weight: 600;
        }
        .prose-custom code {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 4px;
          padding: 0.125rem 0.375rem;
          font-size: 0.875rem;
          color: #10b981;
          font-family: 'JetBrains Mono', monospace;
        }
        .prose-custom pre {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }
        .prose-custom pre code {
          background: none;
          border: none;
          padding: 0;
          color: #a7f3d0;
          font-size: 0.875rem;
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 grid-bg" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="group flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="codequest.city Logo" 
              width={48} 
              height={48} 
              className="rounded-xl shadow-lg shadow-emerald-500/30"
            />
            <div className="retro-font">
              <span className="text-lg font-bold text-white tracking-tight">
                codequest<span className="text-emerald-400">.city</span>
              </span>
            </div>
          </Link>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white retro-font"
          >
            <Link href="/#blog">
              <ArrowLeft className="size-4" />
              All Posts
            </Link>
          </Button>
        </header>

        {/* Article Header */}
        <article>
          <div className={`relative rounded-3xl bg-linear-to-br ${post.gradient} border border-white/10 p-8 md:p-12 mb-8 overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
            
            <div className="relative">
              {/* Category & Reading Time */}
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-300 retro-font">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-sm text-white/50 retro-font">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white retro-font mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-white/70 retro-font mb-8 max-w-2xl">
                {post.excerpt}
              </p>

              {/* Author & Date */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold retro-font">{post.author}</div>
                    <div className="text-sm text-white/50 retro-font">{post.authorRole}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-white/50 retro-font">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm p-8 md:p-12 mb-8">
            <div 
              className="prose-custom"
              dangerouslySetInnerHTML={{ 
                __html: post.content
                  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                  .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`{3}(\w+)?\n([\s\S]+?)`{3}/g, '<pre><code>$2</code></pre>')
                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                  .replace(/^- (.+)$/gm, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^(?!<[hpul])/gm, '<p>')
              }}
            />
          </div>

          {/* Share Section */}
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white/70 retro-font">Share this article</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white retro-font"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid md:grid-cols-2 gap-4">
            {prevPost && (
              <Link 
                href={`/blog/${prevPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 hover:border-emerald-500/30 hover:bg-black/50 transition-all"
              >
                <div className="flex items-center gap-2 text-sm text-white/50 mb-2 retro-font">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Previous
                </div>
                <div className="text-white font-semibold retro-font group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {prevPost.title}
                </div>
              </Link>
            )}
            {nextPost && (
              <Link 
                href={`/blog/${nextPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 hover:border-emerald-500/30 hover:bg-black/50 transition-all md:text-right"
              >
                <div className="flex items-center justify-end gap-2 text-sm text-white/50 mb-2 retro-font">
                  Next
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-white font-semibold retro-font group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {nextPost.title}
                </div>
              </Link>
            )}
          </div>
        </article>

        {/* CTA Section */}
        <section className="mt-16 rounded-3xl border border-emerald-500/30 bg-linear-to-br from-emerald-950/60 to-black/60 backdrop-blur-xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 mb-4">
            <Sparkles className="size-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-300 retro-font">Ready to learn?</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white retro-font mb-4">
            Put This Knowledge Into Practice
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto retro-font">
            Join codequest.city and learn by completing hands-on quests with AI agents.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 font-bold retro-font"
          >
            <Link href="/#create-character">
              <User className="size-5" />
              Create Your Hero
              <ChevronRight className="size-5" />
            </Link>
          </Button>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/40 retro-font">
            © 2026 codequest.city. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
