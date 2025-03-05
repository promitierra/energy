import React from 'react';
import EnergiaComparativa from './graficos-comparativos';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Comparativo de Energía</h1>
      <EnergiaComparativa />
    </div>
  );
};

export default Dashboard;
