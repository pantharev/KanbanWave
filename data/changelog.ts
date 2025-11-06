export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
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
