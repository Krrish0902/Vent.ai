# Vent.ai - Your Friendly AI Third Wheel

A friendly AI companion that listens, validates, and offers gentle perspective when you need it. Like having a supportive friend on speed dial who's great at listening and never judges. Built with React, TypeScript, and modern web technologies.

![Vent.ai](https://img.shields.io/badge/Vent.ai-AI%20Counselor-teal?style=for-the-badge&logo=heart)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

### 🤖 Your AI Friend
- **Genuine Listener**: A friend who actually listens without judgment
- **Validation First**: Understands and validates your feelings before anything else
- **Gentle Perspective**: Offers thoughtful viewpoints only when you want them
- **Privacy-First**: All conversations stay between just you two
- **Multiple AI Models**: Choose your preferred conversation style

### 🎨 Modern Interface
- **Dark Mode Support**: Beautiful dark theme with actual black backgrounds
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Accessible**: WCAG compliant design with proper contrast ratios

### 💬 Conversation Management
- **Thread Organization**: Organize conversations by topics
- **Search & Filter**: Find past conversations quickly
- **Message History**: Keep track of your chats like text history with a friend
- **Export/Import**: Backup and restore your conversations

### 🔒 Privacy & Security
- **Local Storage**: All data stored on your device
- **Encrypted API Keys**: AES-256 encryption for API credentials
- **No Tracking**: Zero analytics or user tracking
- **Complete Control**: Full ownership of your data

### ⚙️ Customization
- **Custom AI Name**: Personalize your AI friend's name
- **Theme Selection**: Light, dark, or system theme
- **Preferences**: Make it feel like chatting with a real friend
- **Model Selection**: Choose your preferred AI model

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Vent.ai.git
   cd Vent.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### First Time Setup

1. **Add API Key**: Click the settings icon and add your OpenAI API key
2. **Name Your Friend**: Choose what you'd like to call your AI companion
3. **Choose Theme**: Select light, dark, or system theme
4. **Start Chatting**: Begin your first conversation!

## 🏗️ Project Structure

```
Vent.ai/
├── src/
│   ├── components/
│   │   ├── Chat/           # Chat interface components
│   │   ├── Layout/         # Main layout components
│   │   ├── Settings/       # Settings and configuration
│   │   ├── Sidebar/        # Thread list and navigation
│   │   └── UI/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external services
│   ├── stores/            # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Database**: Dexie (IndexedDB wrapper)
- **Encryption**: CryptoJS
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🎯 Key Features Explained

### Your AI Friend's Personality
Vent.ai uses OpenAI's GPT models to be your supportive friend. Your AI companion is designed to:
- Listen first, validate always - like a good friend should
- Share gentle perspective only when it feels right
- Use casual, relatable language - never clinical or formal
- Know when to just say "that really sucks" vs offering advice
- Encourage professional help for serious issues, as any caring friend would

### Privacy-First Design
- **Local Storage**: All conversations and settings stored locally using IndexedDB
- **Encrypted Keys**: API keys encrypted with AES-256 before storage
- **No Server Communication**: Except for AI responses, no data leaves your device
- **User Control**: Complete ownership and control over your data

## 🔧 Configuration

### API Configuration
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add the key in the app settings
3. Choose your preferred AI model (GPT-4 recommended)

## 📱 Usage

### Starting a Conversation
1. Click "New Conversation" or select an existing thread
2. Choose from casual starters like "Need to vent..." or just start typing
3. Your AI friend will respond with understanding and support

### Managing Conversations
- **Search**: Use the search bar to find specific conversations
- **Pin**: Pin important conversations for quick access
- **Archive**: Archive old conversations to keep your list organized
- **Delete**: Permanently delete conversations when needed

### Customization
- **Friend's Name**: Give your AI companion a name that feels right
- **Theme**: Switch between light, dark, or system themes
- **Chat Style**: Make conversations feel natural and comfortable

## 🙏 Acknowledgments

- OpenAI for providing the AI models
- The React and TypeScript communities
- All contributors and users of Vent.ai

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: ananthuk0902@gmail.com
  
---

**Made with ❤️ for better relationships** 

---

**Remember**: While Vent.ai is a supportive friend who's great at listening, it's not a replacement for professional help when you need it. Sometimes the kindest thing a friend can do is encourage you to talk to a professional.