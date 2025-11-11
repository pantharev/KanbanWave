'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  DragMoveEvent,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Plus, Filter, ArrowUpDown, LayoutGrid, Settings, Save } from 'lucide-react';

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

  // Ref for auto-scrolling during drag
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configure sensors for desktop and mobile
  // MouseSensor for desktop: requires 8px movement before drag
  // TouchSensor for mobile: requires 250ms press before drag (allows scrolling)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before drag activates - allows clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,      // Hold for 250ms before drag starts on mobile
        tolerance: 5,    // Allow 5px movement during hold
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

  // Auto-scroll during drag when near screen edges (mobile support)
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const { activatorEvent } = event;
    if (!activatorEvent) return;

    // Get the pointer/touch position - works for both mouse and touch events
    const clientX = (activatorEvent as any).clientX || 0;
    if (!clientX) return;

    const edgeThreshold = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 15; // pixels per frame

    // Clear existing interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    // Scroll right when near right edge
    if (clientX > window.innerWidth - edgeThreshold) {
      autoScrollIntervalRef.current = setInterval(() => {
        scrollContainer.scrollLeft += scrollSpeed;
      }, 16); // ~60fps
    }
    // Scroll left when near left edge
    else if (clientX < edgeThreshold) {
      autoScrollIntervalRef.current = setInterval(() => {
        scrollContainer.scrollLeft -= scrollSpeed;
      }, 16);
    }
  }, []);

  // Cleanup auto-scroll on drag end
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    // Prevent dragging when modals are open
    if (isAddCardModalOpen || isDetailsModalOpen) {
      return;
    }
    setDraggedTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTaskId('');

    // Clear auto-scroll interval
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

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
    <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} collisionDetection={closestCenter} sensors={sensors}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Top Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* Title and View Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                  <LayoutGrid size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">KanbanWave</h1>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">All data saved locally</span>
                <span className="sm:hidden">Saved locally</span>
              </div>
              <button
                onClick={() => setIsChangelogModalOpen(true)}
                className="sm:ml-auto text-xs sm:text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 backdrop-blur-sm font-medium self-start"
              >
                <span className="hidden sm:inline">What's New ✨</span>
                <span className="sm:hidden">New ✨</span>
              </button>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => {
                  setSelectedColumnId('todo');
                  setIsAddCardModalOpen(true);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-indigo-600 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl hover:bg-white/95 hover:shadow-lg transition-all duration-200"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </button>
              <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20">
                <Filter size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20">
                <ArrowUpDown size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              <button
                onClick={() => setIsExportImportModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 sm:ml-auto border border-white/20"
                title="Export/Import"
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Save/Export</span>
                <span className="sm:hidden">Save</span>
              </button>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                title="Settings"
              >
                <Settings size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden lg:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-180px)]">
          <div ref={scrollContainerRef} className="flex gap-3 sm:gap-4 overflow-x-auto pb-8 sm:pb-12 -mx-4 px-4 sm:mx-0 sm:px-0 h-full">
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

      {/* Drag Overlay - Enhanced for mobile visibility */}
      <DragOverlay>
        {draggedTaskId ? (
          <div className="transform scale-105 sm:scale-100 opacity-95 sm:opacity-90">
            <Card
              task={state.tasks[draggedTaskId] || { id: '', title: '', description: '', createdAt: new Date(), updatedAt: new Date() }}
              isDragging={true}
              onEdit={() => {}}
            />
          </div>
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
