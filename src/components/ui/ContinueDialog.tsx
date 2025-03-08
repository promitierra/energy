import React, { useEffect, useRef } from 'react';

interface ContinueDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ContinueDialog: React.FC<ContinueDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = '¿Confirmar selección?',
  description = '¿Está seguro de que desea guardar esta selección y continuar?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Revisar'
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onConfirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    } else if (event.key === ' ' || event.key === 'Space') {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        event.preventDefault();
        if (target.textContent === confirmLabel) {
          onConfirm();
        } else if (target.textContent === cancelLabel) {
          onCancel();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <h2 
            id="dialog-title" 
            className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"
          >
            {title}
          </h2>
          
          <p 
            id="dialog-description"
            className="text-sm text-gray-500 dark:text-gray-400 mb-6"
          >
            {description}
          </p>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              ref={confirmButtonRef}
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinueDialog;