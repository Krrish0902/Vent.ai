# LoveLogic - Your AI Relationship Counselor

A compassionate AI-powered relationship counseling application that provides private, empathetic guidance for all your relationship challenges. Built with React, TypeScript, and modern web technologies.

![LoveLogic](https://img.shields.io/badge/LoveLogic-AI%20Counselor-teal?style=for-the-badge&logo=heart)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple?style=flat&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=flat&logo=tailwind-css)

## ✨ Features

### 🤖 AI-Powered Counseling
- **Compassionate AI Counselor**: Personalized AI assistant
- **Relationship-Focused**: Specialized in relationship advice and communication
- **Privacy-First**: All conversations stored locally on your device
- **Multiple AI Models**

### 🎨 Modern Interface
- **Dark Mode Support**: Beautiful dark theme with actual black backgrounds
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Accessible**: WCAG compliant design with proper contrast ratios

### 💬 Conversation Management
- **Thread Organization**: Organize conversations by topics
- **Search & Filter**: Find past conversations quickly
- **Message History**: Complete conversation history with timestamps
- **Export/Import**: Backup and restore your conversations

### 🔒 Privacy & Security
- **Local Storage**: All data stored on your device
- **Encrypted API Keys**: AES-256 encryption for API credentials
- **No Tracking**: Zero analytics or user tracking
- **Complete Control**: Full ownership of your data

### ⚙️ Customization
- **Custom AI Name**: Personalize your AI counselor's name
- **Theme Selection**: Light, dark, or system theme
- **Preferences**: Customize auto-save, typing indicators, and more
- **Model Selection**: Choose your preferred AI model

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lovelogic.git
   cd lovelogic
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
2. **Customize AI Name**: Set your preferred AI counselor name in settings
3. **Choose Theme**: Select light, dark, or system theme
4. **Start Chatting**: Begin your first conversation!

## 🏗️ Project Structure

```
LoveLogic/
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

### AI Counseling System
LoveLogic uses OpenAI's GPT models to provide relationship counseling. The AI is specifically trained to:
- Listen empathetically to relationship concerns
- Provide constructive, non-judgmental advice
- Focus on healthy communication and mutual understanding
- Encourage self-reflection and personal growth

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
2. Choose from conversation starters or type your own message
3. The AI will respond with empathetic, relationship-focused advice

### Managing Conversations
- **Search**: Use the search bar to find specific conversations
- **Pin**: Pin important conversations for quick access
- **Archive**: Archive old conversations to keep your list organized
- **Delete**: Permanently delete conversations when needed

### Customization
- **AI Name**: Personalize your AI counselor's name in settings
- **Theme**: Switch between light, dark, or system themes
- **Preferences**: Configure auto-save, typing indicators, and more

## 🙏 Acknowledgments

- OpenAI for providing the AI models
- The React and TypeScript communities
- All contributors and users of LoveLogic

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: ananthuk0902@gmail.com
  
---

**Made with ❤️ for better relationships** 