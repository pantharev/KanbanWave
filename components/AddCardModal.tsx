'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/kanban';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, XCircle } from 'lucide-react';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  initialTask?: Task;
  columnTitle?: string;
}

const templateTypes = [
  { value: 'general', label: 'General' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'artistic-creative', label: 'Artistic/Creative' },
  { value: 'coding', label: 'Coding' },
  { value: 'business', label: 'Business' },
  { value: 'law', label: 'Law' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'finance', label: 'Finance' },
  { value: 'personal', label: 'Personal Productivity' },
];

export function AddCardModal({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  columnTitle,
}: AddCardModalProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateType, setTemplateType] = useState('general');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedTitle, setEnhancedTitle] = useState('');
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);

  // Update form fields when initialTask changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTask?.title || '');
      setDescription(initialTask?.description || '');
      setTemplateType('general');
      setShowEnhancedPreview(false);
      setEnhancedTitle('');
      setEnhancedDescription('');
    }
  }, [isOpen, initialTask]);

  const handleEnhance = async () => {
    if (!title.trim()) return;

    setIsEnhancing(true);
    try {
      // Get API key from localStorage
      const apiKey = localStorage.getItem('openai_api_key');

      const response = await fetch('/api/enhance-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          templateType,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance card');
      }

      const data = await response.json();
      setEnhancedTitle(data.title);
      setEnhancedDescription(data.description);
      setShowEnhancedPreview(true);
    } catch (error) {
      console.error('Error enhancing card:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance card');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhancement = async () => {
    // Update form fields
    setTitle(enhancedTitle);
    setDescription(enhancedDescription);
    setShowEnhancedPreview(false);

    // Auto-save the changes if editing an existing task
    if (initialTask) {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      onSubmit(enhancedTitle, enhancedDescription);
      setTitle('');
      setDescription('');
      setIsSubmitting(false);
      onClose();
    }
  };

  const handleRejectEnhancement = () => {
    setShowEnhancedPreview(false);
    setEnhancedTitle('');
    setEnhancedDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSubmit(title, description);
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
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
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {initialTask ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Organize your workflow</p>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
                >
                  <X size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              {/* Column Info */}
              {columnTitle && !initialTask && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-500 mb-4"
                >
                  Adding to <span className="font-semibold">{columnTitle}</span>
                </motion.p>
              )}

              {/* Title Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Description Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-4"
              >
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about this task (optional)..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* AI Enhancement Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-orange-500" />
                  <h3 className="text-sm font-semibold text-gray-800">AI Enhancement</h3>
                </div>

                {/* Template Dropdown */}
                <div className="mb-3">
                  <label htmlFor="template" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Template Type
                  </label>
                  <select
                    id="template"
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    disabled={isEnhancing || isSubmitting}
                  >
                    {templateTypes.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enhance Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleEnhance}
                  disabled={!title.trim() || isEnhancing || isSubmitting}
                  className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  {isEnhancing ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Enhance with AI
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Enhanced Preview */}
              <AnimatePresence>
                {showEnhancedPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-green-600" />
                        AI Enhanced Result
                      </h3>

                      {/* Enhanced Title */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Enhanced Title:</p>
                        <p className="text-sm font-semibold text-gray-800 bg-white p-2 rounded border border-green-200">
                          {enhancedTitle}
                        </p>
                      </div>

                      {/* Enhanced Description */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Enhanced Description:</p>
                        <p className="text-sm text-gray-800 bg-white p-2 rounded border border-green-200 whitespace-pre-wrap">
                          {enhancedDescription}
                        </p>
                      </div>

                      {/* Accept/Reject Buttons */}
                      <div className="flex gap-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleAcceptEnhancement}
                          className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                        >
                          <Check size={16} />
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleRejectEnhancement}
                          className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold disabled:opacity-50 border border-gray-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                >
                  {isSubmitting ? 'Creating...' : initialTask ? 'Update Task' : 'Create Task'}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
