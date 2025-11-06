'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload } from 'lucide-react';
import { KanbanState } from '@/types/kanban';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: KanbanState;
  onImport: (state: KanbanState) => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  currentState,
  onImport,
}: ExportImportModalProps) {
  const [importError, setImportError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(currentState, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage('Board exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setImportError('Failed to export board');
    }
  };

  const processImportedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedState = JSON.parse(content);

        // Validate the imported state
        if (!importedState.tasks || !importedState.columns) {
          throw new Error('Invalid board data format');
        }

        // Convert date strings back to Date objects
        Object.keys(importedState.tasks).forEach((taskId) => {
          const task = importedState.tasks[taskId];
          task.createdAt = new Date(task.createdAt);
          task.updatedAt = new Date(task.updatedAt);
        });

        importedState.columns.forEach((column: any) => {
          column.createdAt = new Date(column.createdAt);
        });

        onImport(importedState);
        setSuccessMessage('Board imported successfully!');
        setImportError('');

        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Import error:', error);
        setImportError('Failed to import board. Please check the file format.');
        setSuccessMessage('');
      }
    };

    reader.readAsText(file);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processImportedFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        processImportedFile(file);
      } else {
        setImportError('Please drop a valid JSON file');
        setTimeout(() => setImportError(''), 3000);
      }
    }
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
              className="w-full max-w-md bg-white rounded-lg shadow-xl p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Download size={24} className="text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Export / Import</h2>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  type="button"
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-6">
                Save your board to a file or restore from a previous backup. All your tasks,
                columns, and progress will be preserved.
              </p>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800"
                >
                  ✓ {successMessage}
                </motion.div>
              )}

              {/* Error Message */}
              {importError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
                >
                  ✗ {importError}
                </motion.div>
              )}

              {/* Export Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Board</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Download size={20} className="text-indigo-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Export as JSON</p>
                    <p className="text-xs text-gray-500">Full backup (can be imported later)</p>
                  </div>
                </motion.button>
              </div>

              {/* Import Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Import Board</h3>
                <motion.div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg transition-colors text-left cursor-pointer ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-100'
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} className="text-indigo-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isDragging ? 'Drop JSON file here' : 'Import from JSON'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isDragging ? 'Release to upload' : 'Click or drag & drop your backup file'}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </motion.div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Importing will replace your current board
                </p>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
