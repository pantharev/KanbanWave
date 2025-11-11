'use client';

import { Task } from '@/types/kanban';
import { motion } from 'framer-motion';
import { Flag, Calendar, Paperclip, MessageCircle, Edit2, Sparkles, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CardProps {
  task: Task;
  isDragging?: boolean;
  onEdit: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onGeneratePrompt?: (task: Task) => Promise<void>;
}

export function Card({ task, isDragging = false, onEdit, onViewDetails, onGeneratePrompt }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGeneratePrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onGeneratePrompt || isGeneratingPrompt) return;

    setIsGeneratingPrompt(true);
    try {
      await onGeneratePrompt(task);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Priority color mapping
  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-orange-500',
    low: 'text-blue-500',
  };

  // Avatar background colors
  const avatarColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
  ];

  const getAvatarColor = (name?: string) => {
    if (!name) return avatarColors[0];
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    return `${month} ${day}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(task)}
      className={`
        group relative p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border
        cursor-pointer transition-all duration-300 active:scale-95
        ${
          isDragging
            ? 'opacity-60 shadow-2xl rotate-3 border-indigo-300 scale-105'
            : 'border-gray-200 hover:shadow-xl hover:border-indigo-200 sm:hover:-translate-y-1 hover:scale-102'
        }
      `}
    >
      {/* Priority Flag & Edit Button */}
      <div className="flex items-start justify-between mb-2.5">
        {task.priority && (
          <Flag
            size={14}
            className={`${priorityColors[task.priority]} fill-current`}
          />
        )}
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(task);
            }}
            className="ml-auto p-2 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 pointer-events-auto bg-gray-50"
            title="Edit card"
            type="button"
          >
            <Edit2 size={16} className="text-indigo-600" />
          </motion.button>
        )}
      </div>

      {/* Card Title */}
      <h3 className="font-semibold text-gray-900 mb-1.5 break-words text-sm leading-snug">
        {task.title}
      </h3>

      {/* Card Description/Category */}
      {task.description && (
        <p className="text-gray-600 text-xs mb-3.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Metadata Row */}
      {isMounted && (
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 pt-2.5 border-t border-gray-100">
          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" />
            <span>{formatDate(task.updatedAt)}</span>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip size={12} className="text-gray-400" />
              <span>{task.attachments}</span>
            </div>
          )}

          {/* Comments */}
          {task.comments && task.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle size={12} className="text-gray-400" />
              <span>{task.comments}</span>
            </div>
          )}

          {/* Avatar */}
          {task.assignee && (
            <div
              className={`w-5 h-5 rounded-full ${getAvatarColor(task.assignee)} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
            >
              {task.assignee.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* AI Button */}
          {onGeneratePrompt && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePrompt}
              disabled={isGeneratingPrompt}
              className="ml-auto p-2 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md bg-yellow-50"
              title="Generate AI prompt"
            >
              {isGeneratingPrompt ? (
                <Loader size={16} className="text-orange-500 animate-spin" />
              ) : (
                <Sparkles size={16} className="text-orange-500" />
              )}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
