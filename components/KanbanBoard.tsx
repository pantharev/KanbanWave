'use client';

import { useState, useCallback, useMemo } from 'react';
import { Task, Column, KanbanState } from '@/types/kanban';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Column as ColumnComponent } from './Column';
import { AddCardModal } from './AddCardModal';
import { CardDetailsModal } from './CardDetailsModal';
import { SettingsModal } from './SettingsModal';
import { ExportImportModal } from './ExportImportModal';
import { ChangelogModal } from './ChangelogModal';
import { AddColumnButton } from './AddColumnButton';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Plus, Filter, ArrowUpDown, LayoutGrid, ChevronDown, Settings, Save } from 'lucide-react';

const DEFAULT_COLUMNS: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    taskIds: [],
    color: 'blue',
    icon: '⏳',
    createdAt: new Date(),
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    taskIds: [],
    color: 'purple',
    icon: '🔄',
    createdAt: new Date(),
  },
  {
    id: 'completed',
    title: 'Completed',
    taskIds: [],
    color: 'green',
    icon: '✅',
    createdAt: new Date(),
  },
];

export function KanbanBoard() {
  const [state, setState, isLoaded] = useLocalStorage<KanbanState>('kanban-state', {
    tasks: {},
    columns: DEFAULT_COLUMNS,
  });

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string>('');

  // Configure sensors with activation constraint to prevent drag on click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before drag activates - allows clicks to work
      },
    })
  );

  // Initialize columns if they don't exist
  if (isLoaded && state.columns.length === 0) {
    setState((prev) => ({
      ...prev,
      columns: DEFAULT_COLUMNS,
    }));
  }

  const handleAddTask = useCallback(
    (columnId: string) => {
      setSelectedColumnId(columnId);
      setSelectedTask(undefined);
      setIsAddCardModalOpen(true);
    },
    []
  );

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsAddCardModalOpen(true);
  }, []);

  const handleViewDetails = useCallback((task: Task) => {
    setViewingTask(task);
    setIsDetailsModalOpen(true);
  }, []);

  const handleGeneratePrompt = useCallback(
    async (task: Task) => {
      try {
        // Get API key from localStorage
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
          alert('Please add your OpenAI API key in Settings before using AI features.');
          setIsSettingsModalOpen(true);
          return;
        }

        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            attachments: task.attachments,
            comments: task.comments,
            assignee: task.assignee,
            apiKey: apiKey,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to generate prompt:', error);
          alert(`Failed to generate prompt: ${error.error || 'Unknown error'}`);
          return;
        }

        const data = await response.json();
        const generatedPrompt = data.prompt;

        // Update the task with the generated prompt
        setState((prev) => {
          const updatedTask = {
            ...task,
            description: generatedPrompt,
            aiGeneratedPrompt: generatedPrompt,
            updatedAt: new Date(),
          };

          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [task.id]: updatedTask,
            },
          };
        });

        // Open the edit modal to show the generated prompt
        setSelectedTask(task);
        setIsAddCardModalOpen(true);
      } catch (error) {
        console.error('Error generating prompt:', error);
        alert('Error generating prompt. Please try again.');
      }
    },
    [setState]
  );

  const handleSaveTask = useCallback(
    (title: string, description: string) => {
      setState((prev) => {
        if (selectedTask) {
          // Edit existing task
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [selectedTask.id]: {
                ...selectedTask,
                title,
                description,
                updatedAt: new Date(),
              },
            },
          };
        } else {
          // Create new task
          const newTaskId = uuidv4();
          const newTask: Task = {
            id: newTaskId,
            title,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Add task and update column
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [newTaskId]: newTask,
            },
            columns: prev.columns.map((col) =>
              col.id === selectedColumnId
                ? { ...col, taskIds: [...col.taskIds, newTaskId] }
                : col
            ),
          };
        }
      });
    },
    [setState, selectedTask, selectedColumnId]
  );

  const handleAddColumn = useCallback(
    (title: string, color: string) => {
      setState((prev) => ({
        ...prev,
        columns: [
          ...prev.columns,
          {
            id: uuidv4(),
            title,
            taskIds: [],
            color,
            createdAt: new Date(),
          },
        ],
      }));
    },
    [setState]
  );

  const handleDeleteColumn = useCallback(
    (columnId: string) => {
      setState((prev) => {
        const newState = { ...prev };
        const column = newState.columns.find((col) => col.id === columnId);

        // Delete tasks in this column
        if (column) {
          column.taskIds.forEach((taskId) => {
            delete newState.tasks[taskId];
          });
        }

        // Remove column
        newState.columns = newState.columns.filter((col) => col.id !== columnId);
        return newState;
      });
    },
    [setState]
  );

  const handleImportBoard = useCallback(
    (importedState: KanbanState) => {
      setState(importedState);
    },
    [setState]
  );

  const handleDragStart = (event: DragStartEvent) => {
    // Prevent dragging when modals are open
    if (isAddCardModalOpen || isDetailsModalOpen) {
      return;
    }
    setDraggedTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTaskId('');

    // Prevent operations when modals are open
    if (isAddCardModalOpen || isDetailsModalOpen) {
      return;
    }

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    setState((prev) => {
      // Find which columns contain the task
      let sourceColumnIndex = -1;
      let destColumnIndex = -1;
      let sourceTaskIndex = -1;

      for (let i = 0; i < prev.columns.length; i++) {
        const taskIndex = prev.columns[i].taskIds.indexOf(activeId);
        if (taskIndex !== -1) {
          sourceColumnIndex = i;
          sourceTaskIndex = taskIndex;
        }
        if (prev.columns[i].id === overId) {
          destColumnIndex = i;
        }
      }

      if (sourceColumnIndex === -1) return prev;

      // If overId is a task, find its column
      if (destColumnIndex === -1) {
        for (let i = 0; i < prev.columns.length; i++) {
          if (prev.columns[i].taskIds.includes(overId)) {
            destColumnIndex = i;
            break;
          }
        }
      }

      if (destColumnIndex === -1) return prev;

      // Get the task ID being moved
      const movedTaskId = activeId;

      // Find position in destination
      const overTaskIndex = prev.columns[destColumnIndex].taskIds.indexOf(overId);
      const insertIndex =
        overTaskIndex === -1
          ? prev.columns[destColumnIndex].taskIds.length
          : overTaskIndex;

      // Create new columns array with updated taskIds
      const newColumns = prev.columns.map((col, index) => {
        if (index === sourceColumnIndex && index === destColumnIndex) {
          // Moving within same column
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(sourceTaskIndex, 1);
          newTaskIds.splice(insertIndex, 0, movedTaskId);
          return { ...col, taskIds: newTaskIds };
        } else if (index === sourceColumnIndex) {
          // Remove from source column
          return {
            ...col,
            taskIds: col.taskIds.filter((id) => id !== movedTaskId),
          };
        } else if (index === destColumnIndex) {
          // Add to destination column
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(insertIndex, 0, movedTaskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });

      return {
        ...prev,
        columns: newColumns,
      };
    });
  };

  // Calculate columns to display (must be called before early return to maintain Hook order)
  const columnsToDisplay = useMemo(() => {
    return state.columns.map((col) => ({
      ...col,
      tasks: col.taskIds.map((id) => state.tasks[id]).filter(Boolean),
    }));
  }, [state.columns, state.tasks]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners} sensors={sensors}>
      <div className="min-h-screen bg-white">
        {/* Top Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            {/* Title and View Selector */}
            <div className="flex items-center gap-3 mb-4">
              <LayoutGrid size={20} className="text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Actions</h1>
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded">
                <span>5 Views</span>
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => setIsChangelogModalOpen(true)}
                className="ml-auto text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium"
              >
                What's New
              </button>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedColumnId('todo');
                  setIsAddCardModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                New Action
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                <Filter size={14} />
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                <ArrowUpDown size={14} />
                Ordering
              </button>
              <button
                onClick={() => setIsExportImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors ml-auto"
                title="Export/Import"
              >
                <Save size={14} />
                Save/Export
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                title="Settings"
              >
                <Settings size={14} />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="p-6">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {columnsToDisplay.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={column.tasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteColumn={handleDeleteColumn}
                onViewDetails={handleViewDetails}
                onGeneratePrompt={handleGeneratePrompt}
                draggedTaskId={draggedTaskId}
                isModalOpen={isAddCardModalOpen || isDetailsModalOpen}
              />
            ))}

            {/* Add Column Button */}
            <div className="flex items-start pt-2">
              <AddColumnButton onAddColumn={handleAddColumn} />
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedTaskId ? (
          <Card
            task={state.tasks[draggedTaskId] || { id: '', title: '', description: '', createdAt: new Date(), updatedAt: new Date() }}
            isDragging={true}
            onEdit={() => {}}
          />
        ) : null}
      </DragOverlay>

      {/* Add/Edit Card Modal */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => {
          setIsAddCardModalOpen(false);
          setSelectedTask(undefined);
        }}
        onSubmit={handleSaveTask}
        initialTask={selectedTask}
        columnTitle={state.columns.find((col) => col.id === selectedColumnId)?.title}
      />

      {/* Card Details Modal */}
      <CardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingTask(null);
        }}
        onEdit={(task) => {
          setIsDetailsModalOpen(false);
          setSelectedTask(task);
          setIsAddCardModalOpen(true);
        }}
        task={viewingTask}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Export/Import Modal */}
      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        currentState={state}
        onImport={handleImportBoard}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogModalOpen}
        onClose={() => setIsChangelogModalOpen(false)}
      />
    </DndContext>
  );
}
