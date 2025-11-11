'use client';

import { Task, Column as ColumnType } from '@/types/kanban';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Plus, MoreHorizontal, Circle } from 'lucide-react';
import { useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteColumn: (columnId: string) => void;
  onViewDetails?: (task: Task) => void;
  onGeneratePrompt?: (task: Task) => Promise<void>;
  draggedTaskId?: string;
  isModalOpen?: boolean;
}

export function Column({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteColumn: _onDeleteColumn,
  onViewDetails,
  onGeneratePrompt,
  draggedTaskId,
  isModalOpen = false,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    disabled: isModalOpen,
  });
  const [isHovered, setIsHovered] = useState(false);

  // Icon color mapping based on column color
  const iconColors: Record<string, string> = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    default: 'text-gray-500',
  };

  const iconColor = iconColors[column.color] || iconColors.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex-1 min-w-[300px] max-w-[380px] flex flex-col bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50"
    >
      {/* Minimal Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200/50">
        {/* Column Icon/Indicator */}
        <Circle size={10} className={`${iconColor} fill-current drop-shadow-sm`} />

        {/* Column Title */}
        <h2 className="font-bold text-sm text-gray-800 truncate">
          {column.icon} {column.title}
        </h2>

        {/* Task Count Badge */}
        <span className="text-xs font-semibold text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200 px-2 py-1 rounded-full">
          {tasks.length}
        </span>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddTask(column.id)}
            className="p-1.5 hover:bg-indigo-100 rounded-lg transition-all duration-200"
            title="Add card"
          >
            <Plus size={16} className="text-indigo-600" />
          </motion.button>

          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {}}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-all duration-200"
              title="Column options"
            >
              <MoreHorizontal size={16} className="text-gray-600" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Tasks Container */}
      <SortableContext
        items={column.taskIds}
        strategy={verticalListSortingStrategy}
      >
        <motion.div
          ref={setNodeRef}
          layout
          className="flex-1 p-3 space-y-3 overflow-y-auto"
          style={{ minHeight: '240px' }}
        >
          {tasks.map((task) => (
            <SortableCard
              key={task.id}
              task={task}
              isDragging={draggedTaskId === task.id}
              onEdit={onEditTask}
              onViewDetails={onViewDetails}
              onGeneratePrompt={onGeneratePrompt}
              isModalOpen={isModalOpen}
            />
          ))}

          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-32 text-gray-400"
            >
              <p className="text-xs text-center">Drop cards here</p>
            </motion.div>
          )}
        </motion.div>
      </SortableContext>
    </motion.div>
  );
}

interface SortableCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onGeneratePrompt?: (task: Task) => Promise<void>;
  isModalOpen?: boolean;
}

function SortableCard({
  task,
  isDragging = false,
  onEdit,
  onViewDetails,
  onGeneratePrompt,
  isModalOpen = false,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
    disabled: isModalOpen,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(isModalOpen ? {} : listeners)}>
      <Card
        task={task}
        isDragging={isDragging || isSortableDragging}
        onEdit={onEdit}
        onViewDetails={onViewDetails}
        onGeneratePrompt={onGeneratePrompt}
      />
    </div>
  );
}
