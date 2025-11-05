'use client';

import { Task } from '@/types/kanban';
import { motion } from 'framer-motion';
import { Flag, Calendar, Paperclip, MessageCircle, MoreHorizontal, Sparkles, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CardProps {
  task: Task;
  isDragging?: boolean;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onGeneratePrompt?: (task: Task) => Promise<void>;
}

export function Card({ task, isDragging = false, onDelete, onEdit, onGeneratePrompt }: CardProps) {
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
      transition={{ duration: 0.15 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onDoubleClick={() => onEdit(task)}
      className={`
        group relative p-3 bg-white rounded-md border border-gray-200
        cursor-grab transition-all duration-150
        ${isDragging ? 'opacity-50 shadow-lg rotate-2' : 'hover:shadow-sm hover:border-gray-300'}
      `}
    >
      {/* Priority Flag & Menu */}
      <div className="flex items-start justify-between mb-2">
        {task.priority && (
          <Flag
            size={14}
            className={`${priorityColors[task.priority]} fill-current`}
          />
        )}
        {isHovered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="ml-auto p-1 hover:bg-gray-100 rounded"
          >
            <MoreHorizontal size={14} className="text-gray-400" />
          </motion.button>
        )}
      </div>

      {/* Card Title */}
      <h3 className="font-medium text-gray-900 mb-1 break-words text-sm leading-snug">
        {task.title}
      </h3>

      {/* Card Description/Category */}
      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Metadata Row */}
      {isMounted && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
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
              className={`w-5 h-5 rounded-full ${getAvatarColor(task.assignee)} flex items-center justify-center text-white text-[10px] font-medium`}
            >
              {task.assignee.substring(0, 2).toUpperCase()}
            </div>
          )}

          {/* AI Button */}
          {onGeneratePrompt && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePrompt}
              disabled={isGeneratingPrompt}
              className="ml-auto p-1.5 hover:bg-yellow-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate AI prompt"
            >
              {isGeneratingPrompt ? (
                <Loader size={14} className="text-yellow-500 animate-spin" />
              ) : (
                <Sparkles size={14} className="text-yellow-500" />
              )}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
