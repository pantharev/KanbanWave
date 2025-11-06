'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { changelog } from '@/data/changelog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <Sparkles size={24} className="text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">What's New</h2>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  type="button"
                  onClick={onClose}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 space-y-6">
                {/* Privacy Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="font-bold text-green-900 mb-1">Your Data Stays Yours</h3>
                      <p className="text-sm text-green-800 leading-relaxed">
                        All your tasks and boards are stored <strong>locally in your browser</strong>.
                        Nothing is sent to any server unless you explicitly export or use AI features.
                        No sign-up, no tracking, complete privacy.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {changelog.map((entry, index) => (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    {/* Version Header */}
                    <div className="flex items-baseline gap-3">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-sm rounded-full">
                        v{entry.version}
                      </span>
                      <span className="text-sm text-gray-500">{entry.date}</span>
                    </div>

                    {/* Changes List */}
                    <ul className="space-y-2 ml-4">
                      {entry.changes.map((change, changeIndex) => (
                        <motion.li
                          key={changeIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + changeIndex * 0.05 }}
                          className="flex items-start gap-3 text-gray-700"
                        >
                          <span className="text-indigo-500 mt-1">•</span>
                          <span className="flex-1 leading-relaxed">{change}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Divider */}
                    {index < changelog.length - 1 && (
                      <div className="mt-6 border-b border-gray-200" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Built with{' '}
                  <span className="text-red-500">❤️</span>
                  {' '}for vibe coding
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
