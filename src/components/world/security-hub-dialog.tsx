'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Security topics/lessons
const SECURITY_TOPICS = [
    {
        id: 'auth-basics',
        title: 'Authentication Basics',
        description: 'Learn about passwords, MFA, and secure login practices',
        icon: '🔐',
        level: 'Beginner',
        content: [
            'Use strong, unique passwords for each account',
            'Enable Two-Factor Authentication (2FA/MFA)',
            'Use a password manager to store credentials',
            'Avoid password reuse across services',
            'Regularly update and rotate passwords',
        ],
    },
    {
        id: 'encryption',
        title: 'Encryption Fundamentals',
        description: 'Understand how encryption protects your data',
        icon: '🔒',
        level: 'Intermediate',
        content: [
            'Symmetric vs Asymmetric encryption',
            'TLS/SSL for secure web connections',
            'End-to-end encryption in messaging',
            'Data at rest vs data in transit',
            'Key management best practices',
        ],
    },
    {
        id: 'network-security',
        title: 'Network Security',
        description: 'Protect your network from unauthorized access',
        icon: '🌐',
        level: 'Intermediate',
        content: [
            'Firewall configuration and rules',
            'VPN usage for secure connections',
            'Network segmentation strategies',
            'Intrusion detection systems (IDS)',
            'Secure WiFi configurations',
        ],
    },
    {
        id: 'owasp-top10',
        title: 'OWASP Top 10',
        description: 'The most critical web application security risks',
        icon: '⚠️',
        level: 'Advanced',
        content: [
            'Injection attacks (SQL, NoSQL, LDAP)',
            'Broken Authentication',
            'Cross-Site Scripting (XSS)',
            'Security Misconfiguration',
            'Insufficient Logging & Monitoring',
        ],
    },
    {
        id: 'zero-trust',
        title: 'Zero Trust Architecture',
        description: 'Never trust, always verify',
        icon: '🛡️',
        level: 'Advanced',
        content: [
            'Verify every user and device',
            'Least privilege access principle',
            'Micro-segmentation of networks',
            'Continuous monitoring and validation',
            'Identity-based security policies',
        ],
    },
]

interface SecurityHubDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SecurityHubDialog({ open, onOpenChange }: SecurityHubDialogProps) {
    const [selectedTopic, setSelectedTopic] = useState<typeof SECURITY_TOPICS[0] | null>(null)

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner':
                return 'text-green-400 bg-green-400/10'
            case 'Intermediate':
                return 'text-yellow-400 bg-yellow-400/10'
            case 'Advanced':
                return 'text-red-400 bg-red-400/10'
            default:
                return 'text-white/60 bg-white/5'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!w-[calc(100vw-2rem)] !max-w-none bg-black/85 text-white border-cyan-500/20 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span aria-hidden="true">🛡️</span>
                        <span>Security Hub</span>
                        <span className="text-white/50">•</span>
                        <span className="text-cyan-400">Learn & Protect</span>
                    </DialogTitle>
                    <DialogDescription className="text-white/65">
                        Master cybersecurity concepts and protect your digital assets.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
                    {/* Topic List */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold text-white/90 mb-3">Security Topics</div>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                            {SECURITY_TOPICS.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTopic?.id === topic.id
                                            ? 'border-cyan-500/50 bg-cyan-500/10'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{topic.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-white/90">{topic.title}</div>
                                            <div className="text-xs text-white/50 mt-0.5">{topic.description}</div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getLevelColor(topic.level)}`}>
                                            {topic.level}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic Details */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold text-white/90 mb-3">Topic Details</div>
                        {selectedTopic ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{selectedTopic.icon}</span>
                                    <div>
                                        <div className="font-semibold text-white">{selectedTopic.title}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getLevelColor(selectedTopic.level)}`}>
                                            {selectedTopic.level}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-white/70">{selectedTopic.description}</p>

                                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                                    <div className="text-xs font-medium text-cyan-400 mb-3">Key Concepts</div>
                                    <ul className="space-y-2">
                                        {selectedTopic.content.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                                                <span className="text-cyan-400 mt-0.5">▸</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700"
                                    onClick={() => {
                                        // Future: Mark as completed, award XP
                                    }}
                                >
                                    Complete Lesson
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-white/40 py-12">
                                <span className="text-5xl mb-3 block">📚</span>
                                Select a topic to learn about cybersecurity
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
