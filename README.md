# codequest.city 🎮

An interactive, browser-based learning adventure game where players explore a 2D world, meet AI-controlled NPCs, complete quests, and improve their coding skills through gamified learning stations.

## 🏆 Background

This project was created during the **Cursor AI Hackathon**. The goal was to develop an engaging educational game that combines:
- Classic RPG exploration mechanics
- AI-driven conversations and quest generation
- Interactive coding challenges and educational content

The entire project was built using Cursor AI as the primary development tool, demonstrating the power of AI-assisted development for rapid prototyping and game creation.

## ✨ Features

### Core Gameplay
- **2D World Exploration** – Navigate a pixelated game world with buildings, NPCs, and interactive zones
- **AI-Controlled NPCs** – Have dynamic conversations with characters powered by Google Gemini
- **Quest System** – Accept quests from the Questmaster and complete them with AI-generated objectives
- **Combat System** – Fight mobs using coding challenges as a combat mechanic
- **Voice Recognition** – Speak to NPCs using microphone input

### Learning Stations
- **AI University** – Learn Artificial Intelligence concepts
- **AI Lab** – Practical AI experiments
- **Programming Hub** – Coding challenges and tutorials
- **Design Atelier** – UI/UX design lessons
- **Security Hub** – Cybersecurity learning content
- **Code Farm** – Practice coding skills
- **n8n Factory** – Automation and workflow learning

### Additional Features
- **Character Creation** – Create your own character with preset options or a custom form
- **Text-to-Speech** – Optional voice output for NPC dialogues (ElevenLabs)
- **Mobile Controls** – Touch-friendly controls for mobile gaming
- **XP & Leveling** – Progress tracking and skill development
- **HUD System** – Health, XP, quests, and inventory display
- **Mob System** – Various enemies with unique sprites and challenges

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 16.1.6](https://nextjs.org/) | React framework with App Router |
| [React 19.2.3](https://react.dev/) | UI components |
| [TypeScript 5](https://www.typescriptlang.org/) | Type Safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |

### UI Components
| Library | Purpose |
|---------|---------|
| [Radix UI](https://www.radix-ui.com/) | Accessible UI primitives (Dialog, Tabs, Progress, Label) |
| [Lucide React](https://lucide.dev/) | Icons |
| [class-variance-authority](https://cva.style/docs) | Component variants |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Tailwind class merging |

### AI & Services
| Service | Purpose |
|---------|---------|
| [@google/genai](https://ai.google.dev/) | AI conversations, quest generation, NPC dialogues |
| [ElevenLabs](https://elevenlabs.io/) | Text-to-Speech for immersive audio |

### Development
| Tool | Purpose |
|------|---------|
| ESLint 9 | Code Linting |
| tsx | TypeScript execution for scripts |
| react-markdown | Markdown rendering with GFM support |
| tw-animate-css | CSS animations for Tailwind |

## 🔑 Required API Keys

### Gemini API Key (Required)
The game uses Google's Gemini AI for NPC conversations, quest generation, and interactive dialogues.

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### ElevenLabs API Keys (Optional)
For Text-to-Speech functionality to bring NPCs to life with voice.

1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API Key from the dashboard
3. Choose Voice IDs for male and female characters
4. Add to your `.env` file:
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID` (Default voice)
   - `ELEVENLABS_VOICE_ID_MALE`
   - `ELEVENLABS_VOICE_ID_FEMALE`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone Repository**

```bash
git clone <repository-url>
cd AgentGame
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Environment Variables**

```bash
cp .env.example .env
```
   
Edit `.env` and add your API keys:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (for voice output)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_default_voice_id
ELEVENLABS_VOICE_ID_MALE=your_male_voice_id
ELEVENLABS_VOICE_ID_FEMALE=your_female_voice_id
```

4. **Start Development Server**

```bash
npm run dev
```

5. **Open Game**
   
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Landing Page
│   ├── layout.tsx             # Root Layout
│   ├── world/page.tsx         # Main Game World
│   ├── questmaster/           # Quest Management
│   ├── onboarding/            # New Player Onboarding
│   ├── create/                # Character Creation
│   ├── actions/               # Server Actions
│   │   ├── chat.ts           # Chat with NPCs
│   │   ├── generate.ts       # AI Generation
│   │   └── code-review.ts    # Code Review for Challenges
│   └── api/                   # API Routes
│       ├── tts/              # Text-to-Speech
│       └── webhook-test/     # Webhook Testing
├── components/
│   ├── world/                 # Game-specific components
│   │   ├── game-canvas.tsx   # Canvas Rendering
│   │   ├── game-hud.tsx      # Heads-Up Display
│   │   ├── mobile-controls.tsx
│   │   ├── combat-prompt.tsx # Combat Interaction
│   │   ├── mob-challenge-dialog.tsx
│   │   └── *-dialog.tsx      # Learning Station Dialogs
│   ├── ui/                    # Reusable UI components
│   ├── character-creation/    # Character Creation Wizard
│   └── onboarding/            # Onboarding Flow
├── hooks/                     # Custom React Hooks
│   ├── use-character-movement.ts
│   ├── use-keyboard.ts
│   ├── use-sprite-sheet.ts
│   ├── use-mob-sprites.ts    # Mob Sprite Loading
│   ├── use-npc-sprites.ts    # NPC Sprite Loading
│   └── use-speech-recognition.ts  # Speech Input
├── lib/                       # Utilities and Services
│   ├── gemini-service.ts     # AI Integration
│   ├── questmaster.ts        # Quest Logic
│   ├── agents.ts             # AI Agent Definitions
│   ├── tiles.ts              # World Map Data
│   ├── mobs.ts               # Mob Definitions
│   ├── decorations.ts        # World Decorations
│   ├── challenge-generator.ts # Challenge Generation
│   ├── xp.ts                 # XP Calculation
│   └── sprite-utils.ts       # Sprite Helpers
├── types/                     # TypeScript Definitions
│   └── index.ts
├── public/
│   └── sprites/               # Sprite Assets
│       ├── agents/           # NPC Sprites
│       └── mobs/             # Mob Sprites
└── scripts/
    └── generate-sprites.ts   # Sprite Generation
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run generate-sprites` | Generate sprite sheets |

## 🎮 How to Play

1. **Start** – Launch the game and create your character
2. **Explore** – Use WASD or Arrow Keys (or mobile controls) to move
3. **Interact** – Press E or tap to interact with NPCs and buildings
4. **Learn** – Enter learning stations to complete coding challenges
5. **Quest** – Talk to the Questmaster to get quests and earn XP
6. **Combat** – Defeat mobs by solving code challenges
7. **Level Up** – Complete challenges to gain experience and unlock new areas

## 🎨 Sprites & Assets

The game features handcrafted pixel art sprites for:
- **NPCs/Agents**: Questmaster, Creative Agent, Helper Agent, Research Agent, and more
- **Mobs**: Array Spider, Binary Ghost, Bug Slime, Loop Wolf, Syntax Dragon, and others
- **Background Music**: Immersive game atmosphere

## 🤝 Contributing

This project was created as a Hackathon submission. Feel free to fork it and expand upon it!

## 📄 License

MIT License – See LICENSE file for details.

---

**Built with ❤️ at the Cursor AI Hackathon**
