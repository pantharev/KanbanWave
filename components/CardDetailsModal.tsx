'use client';

import { Task } from '@/types/kanban';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Flag, Calendar, Paperclip, MessageCircle } from 'lucide-react';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  task: Task | null;
}

export function CardDetailsModal({ isOpen, onClose, onEdit, task }: CardDetailsModalProps) {
  if (!task) return null;

  const priorityColors: Record<string, string> = {
    high: 'text-red-500',
    medium: 'text-orange-500',
    low: 'text-blue-500',
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    onEdit(task);
    onClose();
  };

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
              className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gray-50/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {task.priority && (
                      <Flag
                        size={16}
                        className={`${priorityColors[task.priority]} fill-current`}
                      />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created {formatDate(task.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit card"
                  >
                    <Edit2 size={20} className="text-gray-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-6">
                  {task.priority && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Priority</h3>
                      <div className="flex items-center gap-2">
                        <Flag
                          size={14}
                          className={`${priorityColors[task.priority]} fill-current`}
                        />
                        <span className="text-gray-600 capitalize">{task.priority}</span>
                      </div>
                    </div>
                  )}

                  {task.assignee && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Assigned To</h3>
                      <span className="text-gray-600">{task.assignee}</span>
                    </div>
                  )}

                  {task.attachments && task.attachments > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h3>
                      <div className="flex items-center gap-2">
                        <Paperclip size={14} className="text-gray-400" />
                        <span className="text-gray-600">{task.attachments}</span>
                      </div>
                    </div>
                  )}

                  {task.comments && task.comments > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Comments</h3>
                      <div className="flex items-center gap-2">
                        <MessageCircle size={14} className="text-gray-400" />
                        <span className="text-gray-600">{task.comments}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Created:</span>
                    <span>{formatDate(task.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Last updated:</span>
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Edit Card
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
