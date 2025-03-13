import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ValidationComparison } from './types';

interface TrendsVisualizationProps {
  comparisonData: ValidationComparison | null;
  historicalData?: ValidationComparison[];
}

/**
 * Component for visualizing temporal trends in validation data
 */
const TrendsVisualization: React.FC<TrendsVisualizationProps> = ({
  comparisonData,
  historicalData = []
}) => {
  // State for visualization settings
  const [metric, setMetric] = useState<string>('consumption');
  const [timeframe, setTimeframe] = useState<string>('daily');
  const [chartType, setChartType] = useState<string>('line');
  
  // Prepare data for visualization
  const trendsData = React.useMemo(() => {
    if (!comparisonData?.hourlyComparison) return [];
    
    // Filter and format data based on selected metric and timeframe
    return comparisonData.hourlyComparison.map(hour => {
      const formattedData: any = {
        timestamp: new Date(hour.timestamp).toLocaleString(),
      };
      
      // Add consumption data
      if (metric === 'consumption' || metric === 'all') {
        formattedData.consumoPrevisto = hour.consumption.predicted;
        formattedData.consumoReal = hour.consumption.actual;
        formattedData.desviaciónConsumo = Math.abs(hour.consumption.predicted - hour.consumption.actual);
      }
      
      // Add production data if available
      if ((metric === 'production' || metric === 'all') && hour.production) {
        formattedData.producciónPrevista = hour.production.predicted;
        formattedData.producciónReal = hour.production.actual;
        formattedData.desviaciónProducción = Math.abs(hour.production.predicted - hour.production.actual);
      }
      
      return formattedData;
    });
  }, [comparisonData, metric]);
  
  // Prepare historical trend data
  const historicalTrendsData = React.useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.map(data => {
      const midDate = new Date(
        (new Date(data.period.start).getTime() + new Date(data.period.end).getTime()) / 2
      );
      
      const formattedData: any = {
        fecha: midDate.toLocaleDateString(),
      };
      
      // Add consumption deviation
      if (metric === 'consumption' || metric === 'all') {
        formattedData.desviaciónConsumo = data.metrics.totalConsumption.deviation;
      }
      
      // Add production deviation if available
      if ((metric === 'production' || metric === 'all') && data.metrics.totalProduction) {
        formattedData.desviaciónProducción = data.metrics.totalProduction.deviation;
      }
      
      // Add self-consumption deviation if available
      if ((metric === 'selfConsumption' || metric === 'all') && data.metrics.selfConsumption) {
        formattedData.desviaciónAutoconsumo = data.metrics.selfConsumption.deviation;
      }
      
      return formattedData;
    });
  }, [historicalData, metric]);
  
  // Handle metric change
  const handleMetricChange = (event: SelectChangeEvent) => {
    setMetric(event.target.value);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value);
  };
  
  // If no data, show message
  if (!comparisonData) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay datos de validación disponibles para visualizar tendencias.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Visualización de Tendencias Temporales
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="metric-select-label">Métrica</InputLabel>
            <Select
              labelId="metric-select-label"
              id="metric-select"
              value={metric}
              label="Métrica"
              onChange={handleMetricChange}
            >
              <MenuItem value="consumption">Consumo</MenuItem>
              <MenuItem value="production">Producción</MenuItem>
              <MenuItem value="selfConsumption">Autoconsumo</MenuItem>
              <MenuItem value="all">Todas las métricas</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="timeframe-select-label">Marco Temporal</InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={timeframe}
              label="Marco Temporal"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="hourly">Por Hora</MenuItem>
              <MenuItem value="daily">Diario</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensual</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="chart-type-select-label">Tipo de Gráfico</InputLabel>
            <Select
              labelId="chart-type-select-label"
              id="chart-type-select"
              value={chartType}
              label="Tipo de Gráfico"
              onChange={handleChartTypeChange}
            >
              <MenuItem value="line">Línea</MenuItem>
              <MenuItem value="area">Área</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Comparación Predicción vs. Realidad
        </Typography>
        
        <Card variant="outlined" sx={{ height: 400, p: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={trendsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metric === 'consumption' || metric === 'all' ? (
                  <>
                    <Line type="monotone" dataKey="consumoPrevisto" stroke="#8884d8" name="Consumo Previsto" />
                    <Line type="monotone" dataKey="consumoReal" stroke="#82ca9d" name="Consumo Real" />
                  </>
                ) : null}
                {metric === 'production' || metric === 'all' ? (
                  <>
                    <Line type="monotone" dataKey="producciónPrevista" stroke="#ff7300" name="Producción Prevista" />
                    <Line type="monotone" dataKey="producciónReal" stroke="#0088fe" name="Producción Real" />
                  </>
                ) : null}
              </LineChart>
            ) : (
              <AreaChart
                data={trendsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metric === 'consumption' || metric === 'all' ? (
                  <>
                    <Area type="monotone" dataKey="consumoPrevisto" stackId="1" stroke="#8884d8" fill="#8884d8" name="Consumo Previsto" />
                    <Area type="monotone" dataKey="consumoReal" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Consumo Real" />
                  </>
                ) : null}
                {metric === 'production' || metric === 'all' ? (
                  <>
                    <Area type="monotone" dataKey="producciónPrevista" stackId="3" stroke="#ff7300" fill="#ff7300" name="Producción Prevista" />
                    <Area type="monotone" dataKey="producciónReal" stackId="4" stroke="#0088fe" fill="#0088fe" name="Producción Real" />
                  </>
                ) : null}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Card>
      </Box>
      
      {historicalData.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tendencia Histórica de Desviaciones
          </Typography>
          
          <Card variant="outlined" sx={{ height: 400, p: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalTrendsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metric === 'consumption' || metric === 'all' ? (
                  <Line type="monotone" dataKey="desviaciónConsumo" stroke="#8884d8" name="Desviación Consumo (%)" />
                ) : null}
                {metric === 'production' || metric === 'all' ? (
                  <Line type="monotone" dataKey="desviaciónProducción" stroke="#ff7300" name="Desviación Producción (%)" />
                ) : null}
                {metric === 'selfConsumption' || metric === 'all' ? (
                  <Line type="monotone" dataKey="desviaciónAutoconsumo" stroke="#0088fe" name="Desviación Autoconsumo (%)" />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      )}
    </Paper>
  );
};

export default TrendsVisualization;