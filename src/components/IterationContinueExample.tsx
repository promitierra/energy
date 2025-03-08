import React, { useState } from 'react';
import ContinueDialog from './ui/ContinueDialog';

/**
 * Componente de ejemplo que demuestra cómo implementar un diálogo de confirmación
 * para continuar con una iteración.
 */
const IterationContinueExample: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);

  // Función que se ejecuta cuando el usuario confirma continuar
  const handleContinue = () => {
    console.log('Continuando con la iteración...');
    setShowDialog(false);
    // Aquí irían las acciones para continuar con la siguiente iteración
  };

  // Función que se ejecuta cuando el usuario cancela
  const handleCancel = () => {
    console.log('Iteración cancelada');
    setShowDialog(false);
    // Aquí irían las acciones para cancelar la iteración
  };

  return (
    <div className="p-4">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setShowDialog(true)}
      >
        Iniciar siguiente iteración
      </button>

      {showDialog && (
        <ContinueDialog
          isOpen={showDialog}
          onClose={handleCancel}
          onConfirm={handleContinue}
          title="Confirmación de iteración"
          description="¿Desea continuar con la iteración?"
          confirmLabel="Continuar"
          cancelLabel="Cancelar"
        />
      )}
    </div>
  );
};

export default IterationContinueExample;