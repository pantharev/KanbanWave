'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface AddColumnButtonProps {
  onAddColumn: (title: string, color: string) => void;
}

const COLORS = ['blue', 'purple', 'pink', 'green', 'yellow'];

const colorDisplay: Record<string, string> = {
  blue: 'bg-blue-100 border-blue-300',
  purple: 'bg-purple-100 border-purple-300',
  pink: 'bg-pink-100 border-pink-300',
  green: 'bg-green-100 border-green-300',
  yellow: 'bg-yellow-100 border-yellow-300',
};

export function AddColumnButton({ onAddColumn }: AddColumnButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onAddColumn(title, selectedColor);
    setTitle('');
    setSelectedColor('blue');
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Add Column Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="min-w-[300px] max-w-[400px] h-12 rounded-lg border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-semibold text-gray-700"
      >
        <Plus size={20} />
        Add Column
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.form
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-xl p-6"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add Column</h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* Title Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <label htmlFor="columnTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                    Column Title *
                  </label>
                  <input
                    id="columnTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter column title..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                    disabled={isSubmitting}
                  />
                </motion.div>

                {/* Color Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-6"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Column Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          h-10 rounded-lg border-2 transition-all
                          ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}
                          ${colorDisplay[color]}
                        `}
                        title={color}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Add Column'}
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
