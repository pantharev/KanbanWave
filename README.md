# Vibe Code Manager

A beautiful, privacy-first Kanban board project management app built with Next.js, React, and Tailwind CSS. Manage your tasks with drag-and-drop functionality, AI-powered prompt generation, and complete data privacy.

## Features

### Core Functionality
- **Beautiful Kanban Board**: Modern, responsive design with smooth animations
- **Drag & Drop**: Effortlessly move cards between columns with @dnd-kit
- **Custom Columns**: Create, organize, and delete columns to fit your workflow
- **Card Management**: Create, edit, delete, and view detailed task information
- **Complete Privacy**: All data stored locally in your browser (localStorage) - no servers, no tracking, no sign-up required

### AI-Powered Features
- **AI Prompt Generation**: Convert task cards into actionable prompts for Claude Code
- **User-Provided API Keys**: Bring your own OpenAI API key for complete control
- **Secure**: API keys stored locally in your browser only

### Data Management
- **Export to JSON**: Save your board state as a backup file
- **Import from JSON**: Restore your board with drag-and-drop file upload
- **No Database Required**: Works entirely offline after initial load
- **Cross-Device**: Export from one device and import to another

### User Experience
- **Click to View**: Click any card to see full task details in a beautiful modal
- **Hover to Edit**: Pencil icon appears on card hover for quick editing (Trello-style)
- **Smooth Animations**: Powered by Framer Motion for delightful interactions
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **What's New**: Built-in changelog to track updates and improvements

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI**: OpenAI API (user-provided key)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibe-code-manager.git
cd vibe-code-manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Usage Guide

### Managing Tasks
1. **Create a Card**: Click "New Action" or the "+" button on any column
2. **View Details**: Click on any card to see full task information
3. **Edit a Card**: Hover over a card and click the pencil icon
4. **Move Cards**: Drag and drop cards between columns
5. **Delete Cards**: Open card details and click the delete button

### AI Prompt Generation
1. Go to **Settings** and add your OpenAI API key
2. Hover over any card and click the sparkle icon
3. AI will generate a Claude Code-ready prompt from your task
4. The generated prompt appears in the edit modal

### Backup & Restore
1. **Export**: Click "Save/Export" → "Export as JSON"
2. **Import**: Click "Save/Export" → drag and drop your JSON file or click to browse

### Custom Columns
1. Click the "+" button at the end of the board
2. Enter column name and choose a color
3. Start adding cards to your new column

## Privacy & Security

**Your Data Stays Yours**
- All tasks, columns, and board state are stored in your browser's localStorage
- Nothing is sent to any server unless you:
  - Use the AI prompt generation feature (sends task info to OpenAI)
  - Manually export your board
- No user accounts, no tracking, no analytics
- Your OpenAI API key (if provided) is stored only in your browser
- Works completely offline after initial page load

## Project Structure

```
vibe-code-manager/
├── app/
│   ├── api/generate-prompt/    # AI prompt generation endpoint
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page
├── components/
│   ├── AddCardModal.tsx        # Card creation/edit modal
│   ├── AddColumnButton.tsx     # Add column button
│   ├── Card.tsx                # Individual card component
│   ├── CardDetailsModal.tsx    # Card details view
│   ├── ChangelogModal.tsx      # Version history modal
│   ├── Column.tsx              # Column component with drag-drop
│   ├── ExportImportModal.tsx   # Backup/restore modal
│   ├── KanbanBoard.tsx         # Main board component
│   └── SettingsModal.tsx       # Settings (API key management)
├── data/
│   └── changelog.ts            # Version history data
├── hooks/
│   └── useLocalStorage.ts      # localStorage hook
├── types/
│   └── kanban.ts               # TypeScript interfaces
└── README.md
```

## Keyboard Shortcuts

- **Click Card**: View details
- **Drag Card**: Move between columns
- **Hover Card**: Show edit button
- **Double Click Column**: (Coming soon)

## Roadmap

### Cloud Integration
- [ ] Export to Google Drive
- [ ] Export to OneDrive
- [ ] Export to Dropbox
- [ ] Auto-sync with cloud services (optional)

### Calendar Integration
- [ ] Google Calendar sync
- [ ] Microsoft Outlook integration
- [ ] Due dates with calendar view
- [ ] Task reminders and notifications

### Visual Customization
- [ ] Custom board backgrounds
- [ ] Upload custom background images
- [ ] Board themes and color schemes
- [ ] Custom card colors and styles
- [ ] Improved overall look and feel
- [ ] Dark mode

### Task Management
- [ ] Task priorities and labels
- [ ] Subtasks and checklists
- [ ] Task filtering and search
- [ ] Tags and categories
- [ ] Task templates

### Collaboration (Optional)
- [ ] Share boards with team members
- [ ] Real-time collaboration
- [ ] Comments and mentions
- [ ] Activity feed

### Other Features
- [ ] Multiple board support
- [ ] Board templates
- [ ] Keyboard shortcuts
- [ ] Task time tracking
- [ ] Reports and analytics

## Contributing

Contributions are welcome! This is an open-source project.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- Inspired by Trello and modern project management tools
- Icons by [Lucide](https://lucide.dev/)

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/yourusername/vibe-code-manager/issues) page
2. Open a new issue if your problem isn't already listed
3. Provide as much detail as possible

---

**Made with ❤️ for vibe coding**

*Privacy-first • No tracking • No sign-up • Your data stays yours*
