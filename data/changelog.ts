export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2025-01-16',
    changes: [
      '✨ NEW: AI Card Enhancer with 11 domain-specific templates',
      '📋 Templates: General, Marketing, Artistic/Creative, Coding, Business, Law, Medicine, Construction, Hospitality, Finance, Personal Productivity',
      '🎯 Each template provides specialized guidance for your task type',
      '🤖 AI generates direct, actionable task descriptions (not requests)',
      '👀 Preview enhanced content before applying',
      '✅ Accept or reject AI suggestions with one click',
      '⚡ Auto-save on accept for existing tasks (instant update)',
      '🎨 Beautiful gradient UI for AI enhancement section',
      '🔧 Fixed API key localStorage issue for better reliability',
      'Enhanced mobile drag-and-drop with touch support',
      'Improved scrollbar positioning for better UX',
      'Visual refinements and animations throughout the app',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-01-06',
    changes: [
      'Initial release of Vibe Code Manager',
      '🔒 Complete privacy - all data stays in YOUR browser (localStorage only)',
      'Beautiful Kanban board with drag-and-drop functionality',
      'Create custom columns and organize tasks',
      'Card details modal with full task information',
      'Edit cards with pencil icon on hover (Trello-style)',
      'AI prompt generation using OpenAI API (optional)',
      'User-provided API key support in Settings',
      'Export board to JSON for backup',
      'Import board from JSON with drag-and-drop support',
      'No sign-up, no tracking, no servers - just pure productivity',
      'Modern UI with Tailwind CSS and smooth animations',
      'Responsive design for all screen sizes',
    ],
  },
];
