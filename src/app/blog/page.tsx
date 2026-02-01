'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Bot, BookOpen, Code2, MessageSquare, Newspaper, Rocket, Shield, Sparkles, Workflow } from 'lucide-react'
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
    featured: true,
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
    featured: false,
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
    featured: false,
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
    featured: false,
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
    featured: false,
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
    featured: false,
  },
]

export default function BlogPage() {
  const featuredPost = BLOG_POSTS.find(p => p.featured)
  const otherPosts = BLOG_POSTS.filter(p => !p.featured)

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
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 grid-bg" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
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
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back Home
            </Link>
          </Button>
        </header>

        {/* Page Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-4">
            <Newspaper className="size-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-300 retro-font">Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white retro-font mb-4">
            News & Tutorials
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto retro-font text-lg">
            Stay up to date with the latest updates, tutorials, and insights into the world of AI and coding.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
            <article className={`relative rounded-3xl bg-linear-to-br ${featuredPost.gradient} border border-white/10 p-8 md:p-12 overflow-hidden hover:border-emerald-500/40 transition-all`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-300 retro-font flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-sm text-white/70 retro-font">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white retro-font mb-4 group-hover:text-emerald-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-lg text-white/60 retro-font mb-6 max-w-2xl">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/50 retro-font">
                    <span>{featuredPost.date}</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                </div>
                
                <div className="lg:w-32 lg:h-32 w-20 h-20 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <featuredPost.icon className="w-12 h-12 lg:w-16 lg:h-16 text-emerald-400" />
                </div>
              </div>
              
              {/* Read More Indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-emerald-400 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all retro-font">
                <span>Read Article</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </article>
          </Link>
        )}

        {/* Other Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {otherPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <article className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden hover:border-emerald-500/40 hover:bg-black/50 transition-all duration-300 h-full">
                {/* Article Header with Gradient */}
                <div className={`relative h-28 bg-linear-to-br ${post.gradient} border-b border-white/10 overflow-hidden`}>
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)] group-hover:scale-150 transition-transform duration-700" />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 group-hover:border-emerald-500/40 transition-all duration-300 shadow-lg">
                      <post.icon className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-white/80 retro-font group-hover:border-emerald-500/30 transition-colors">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-5">
                  <h3 className="font-bold text-white retro-font text-lg mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/55 retro-font leading-relaxed mb-4 line-clamp-2 group-hover:text-white/70 transition-colors">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/40 retro-font">
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 retro-font">
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </article>
            </Link>
          ))}
        </div>

        {/* Newsletter Section */}
        <section className="rounded-3xl border border-emerald-500/30 bg-linear-to-br from-emerald-950/60 to-black/60 backdrop-blur-xl p-8 md:p-12 text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white retro-font mb-4">
            Stay Updated
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto retro-font">
            Get the latest articles delivered directly to your inbox. No spam, just quality content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400/60 retro-font"
            />
            <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400 font-semibold retro-font">
              Subscribe
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/40 retro-font">
            © 2026 codequest.city. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
