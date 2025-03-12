import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
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
  BarChart,
  Bar
} from 'recharts';
import { InstallationData, ValidationSettings, ValidationComparison } from './types';
import { compareWithPredictions, generateSampleInstallationData } from './validationUtils';

/**
 * Component for validating predictions with real installation data
 */
const ValidationComponent: React.FC = () => {
  // State for installation data
  const [installationData, setInstallationData] = useState<InstallationData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // State for validation settings
  const [settings, setSettings] = useState<ValidationSettings>({
    comparisonPeriod: 'daily',
    metrics: ['consumption', 'production', 'selfConsumption'],
    normalizeWeather: true,
    excludeOutliers: true
  });
  
  // State for comparison results
  const [comparisonResult, setComparisonResult] = useState<ValidationComparison | null>(null);
  
  // Handle file upload for real data
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setIsLoadingData(true);
      setDataError(null);
      
      // Read the file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Parse the JSON data
          const data = JSON.parse(e.target?.result as string);
          setInstallationData(data);
        } catch (error) {
          console.error('Error parsing installation data:', error);
          setDataError('El archivo no contiene datos válidos. Asegúrese de que es un archivo JSON con el formato correcto.');
        } finally {
          setIsLoadingData(false);
        }
      };
      
      reader.onerror = () => {
        setDataError('Error al leer el archivo.');
        setIsLoadingData(false);
      };
      
      reader.readAsText(file);
    }
  };
  
  // Load sample data for demonstration
  const handleLoadSampleData = () => {
    setIsLoadingData(true);
    setDataError(null);
    
    // Simulate loading delay
    setTimeout(() => {
      try {
        const sampleData = generateSampleInstallationData();
        setInstallationData(sampleData);
      } catch (error) {
        console.error('Error generating sample data:', error);
        setDataError('Error al generar datos de muestra.');
      } finally {
        setIsLoadingData(false);
      }
    }, 1000);
  };
  
  // Handle settings change
  const handleSettingChange = (setting: keyof ValidationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Run validation comparison
  const handleRunValidation = () => {
    if (!installationData) return;
    
    // In a real implementation, this would fetch predictions from the main system
    // For now, we'll generate mock predictions based on the actual data
    const timestamps = installationData.readings
      .filter(r => r.period.toLowerCase() === settings.comparisonPeriod.toLowerCase())
      .map(r => r.timestamp);
    
    const mockPredictions = {
      consumption: installationData.readings
        .filter(r => r.period.toLowerCase() === settings.comparisonPeriod.toLowerCase())
        .map(r => r.consumption * (0.8 + Math.random() * 0.4)), // 80-120% of actual
      production: installationData.readings
        .filter(r => r.period.toLowerCase() === settings.comparisonPeriod.toLowerCase())
        .filter(r => r.production !== undefined)
        .map(r => (r.production || 0) * (0.8 + Math.random() * 0.4)), // 80-120% of actual
      timestamps
    };
    
    // Run comparison
    const result = compareWithPredictions(installationData, mockPredictions, settings);
    setComparisonResult(result);
  };
  
  // Format data for charts
  const getChartData = () => {
    if (!comparisonResult || !comparisonResult.hourlyComparison) return [];
    
    return comparisonResult.hourlyComparison.map(item => {
      const date = new Date(item.timestamp);
      return {
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        consumptionActual: item.consumption.actual,
        consumptionPredicted: item.consumption.predicted,
        productionActual: item.production?.actual,
        productionPredicted: item.production?.predicted
      };
    });
  };
  
  // Get deviation chart data
  const getDeviationChartData = () => {
    if (!comparisonResult) return [];
    
    const metrics = [];
    
    if (comparisonResult.metrics.totalConsumption) {
      metrics.push({
        name: 'Consumo',
        deviation: comparisonResult.metrics.totalConsumption.deviation
      });
    }
    
    if (comparisonResult.metrics.totalProduction) {
      metrics.push({
        name: 'Producción',
        deviation: comparisonResult.metrics.totalProduction.deviation
      });
    }
    
    if (comparisonResult.metrics.selfConsumption) {
      metrics.push({
        name: 'Autoconsumo',
        deviation: comparisonResult.metrics.selfConsumption.deviation
      });
    }
    
    if (comparisonResult.metrics.costSavings) {
      metrics.push({
        name: 'Ahorro',
        deviation: comparisonResult.metrics.costSavings.deviation
      });
    }
    
    return metrics;
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Validación con Datos Reales
      </Typography>
      
      <Typography variant="body1" paragraph>
        Compare las predicciones del sistema con datos reales de instalaciones para validar la precisión.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Data Input Section */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Datos de Instalación</Typography>
            
            {!installationData ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".json"
                    style={{ display: 'none' }}
                    id="installation-data-file"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isLoadingData}
                  />
                  <label htmlFor="installation-data-file">
                    <Button
                      variant="outlined"
                      component="span"
                      disabled={isLoadingData}
                      sx={{ mr: 2 }}
                    >
                      Cargar Datos Reales
                    </Button>
                  </label>
                  
                  <Button
                    variant="contained"
                    onClick={handleLoadSampleData}
                    disabled={isLoadingData}
                  >
                    Usar Datos de Muestra
                  </Button>
                </Box>
                
                {isLoadingData && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    <Typography>Cargando datos...</Typography>
                  </Box>
                )}
                
                {dataError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {dataError}
                  </Alert>
                )}
              </Box>
            ) : (
              <Box>
                <Typography><strong>ID:</strong> {installationData.installationId}</Typography>
                <Typography><strong>Nombre:</strong> {installationData.installationName}</Typography>
                <Typography><strong>Tipo:</strong> {installationData.installationType}</Typography>
                <Typography><strong>Ubicación:</strong> {installationData.location.city}, {installationData.location.region}</Typography>
                <Typography><strong>Capacidad:</strong> {installationData.installedCapacity} kW</Typography>
                <Typography><strong>Fecha de instalación:</strong> {installationData.installationDate}</Typography>
                <Typography><strong>Lecturas disponibles:</strong> {installationData.readings.length}</Typography>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setInstallationData(null)}
                  sx={{ mt: 2 }}
                >
                  Cambiar Datos
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Settings Section */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Configuración de Validación</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Periodo de Comparación</InputLabel>
              <Select
                value={settings.comparisonPeriod}
                label="Periodo de Comparación"
                onChange={(e) => handleSettingChange('comparisonPeriod', e.target.value)}
                disabled={!installationData}
              >
                <MenuItem value="hourly">Por Hora</MenuItem>
                <MenuItem value="daily">Diario</MenuItem>
                <MenuItem value="monthly">Mensual</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.normalizeWeather}
                  onChange={(e) => handleSettingChange('normalizeWeather', e.target.checked)}
                  disabled={!installationData}
                />
              }
              label="Normalizar por condiciones climáticas"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.excludeOutliers}
                  onChange={(e) => handleSettingChange('excludeOutliers', e.target.checked)}
                  disabled={!installationData}
                />
              }
              label="Excluir valores atípicos"
            />
            
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!installationData}
              onClick={handleRunValidation}
            >
              Ejecutar Validación
            </Button>
          </Paper>
        </Grid>
        
        {/* Results Section */}
        {comparisonResult && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Resultados de la Validación</Typography>
              
              <Grid container spacing={2}>
                {/* Summary */}
                <Grid item xs={12}>
                  <Alert 
                    severity={
                      comparisonResult.metrics.totalConsumption.deviation < 10 ? 'success' : 
                      comparisonResult.metrics.totalConsumption.deviation < 20 ? 'info' : 
                      comparisonResult.metrics.totalConsumption.deviation < 30 ? 'warning' : 'error'
                    }
                    sx={{ mb: 2 }}
                  >
                    Desviación media: {(
                      Object.values(comparisonResult.metrics)
                        .filter(m => typeof m === 'object' && 'deviation' in m)
                        .reduce((sum, m: any) => sum + m.deviation, 0) / 
                      Object.values(comparisonResult.metrics)
                        .filter(m => typeof m === 'object' && 'deviation' in m).length
                    ).toFixed(2)}%
                  </Alert>
                </Grid>
                
                {/* Metrics */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Métricas Principales</Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    {comparisonResult.metrics.totalConsumption && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Consumo Total</Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2">Predicción: {comparisonResult.metrics.totalConsumption.predicted.toFixed(2)} kWh</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Real: {comparisonResult.metrics.totalConsumption.actual.toFixed(2)} kWh</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color={
                              comparisonResult.metrics.totalConsumption.deviation < 10 ? 'success.main' : 
                              comparisonResult.metrics.totalConsumption.deviation < 20 ? 'info.main' : 
                              comparisonResult.metrics.totalConsumption.deviation < 30 ? 'warning.main' : 'error.main'
                            }>
                              Desviación: {comparisonResult.metrics.totalConsumption.deviation.toFixed(2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {comparisonResult.metrics.totalProduction && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Producción Total</Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2">Predicción: {comparisonResult.metrics.totalProduction.predicted.toFixed(2)} kWh</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Real: {comparisonResult.metrics.totalProduction.actual.toFixed(2)} kWh</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color={
                              comparisonResult.metrics.totalProduction.deviation < 10 ? 'success.main' : 
                              comparisonResult.metrics.totalProduction.deviation < 20 ? 'info.main' : 
                              comparisonResult.metrics.totalProduction.deviation < 30 ? 'warning.main' : 'error.main'
                            }>
                              Desviación: {comparisonResult.metrics.totalProduction.deviation.toFixed(2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {comparisonResult.metrics.selfConsumption && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Autoconsumo</Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2">Predicción: {comparisonResult.metrics.selfConsumption.predicted.toFixed(2)} kWh</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Real: {comparisonResult.metrics.selfConsumption.actual.toFixed(2)} kWh</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color={
                              comparisonResult.metrics.selfConsumption.deviation < 10 ? 'success.main' : 
                              comparisonResult.metrics.selfConsumption.deviation < 20 ? 'info.main' : 
                              comparisonResult.metrics.selfConsumption.deviation < 30 ? 'warning.main' : 'error.main'
                            }>
                              Desviación: {comparisonResult.metrics.selfConsumption.deviation.toFixed(2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {comparisonResult.metrics.costSavings && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Ahorro Económico</Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2">Predicción: {comparisonResult.metrics.costSavings.predicted.toFixed(2)} €</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Real: {comparisonResult.metrics.costSavings.actual.toFixed(2)} €</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color={
                              comparisonResult.metrics.costSavings.deviation < 10 ? 'success.main' : 
                              comparisonResult.metrics.costSavings.deviation < 20 ? 'info.main' : 
                              comparisonResult.metrics.costSavings.deviation < 30 ? 'warning.main' : 'error.main'
                            }>
                              Desviación: {comparisonResult.metrics.costSavings.deviation.toFixed(2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                {/* Deviation Chart */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Desviación por Métrica</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getDeviationChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Desviación (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${(Number(value)).toFixed(2)}%`, 'Desviación']} />
                        <Bar
                          dataKey="deviation"
                          fill="#8884d8"
                          name="Desviación"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                {/* Time Series Chart */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Comparación Temporal</Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="consumptionActual"
                          stroke="#8884d8"
                          name="Consumo Real"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="consumptionPredicted"
                          stroke="#8884d8"
                          name="Consumo Predicho"
                          strokeDasharray="5 5"
                        />
                        {getChartData().some(d => d.productionActual !== undefined) && (
                          <Line
                            type="monotone"
                            dataKey="productionActual"
                            stroke="#82ca9d"
                            name="Producción Real"
                            strokeWidth={2}
                          />
                        )}
                        {getChartData().some(d => d.productionPredicted !== undefined) && (
                          <Line
                            type="monotone"
                            dataKey="productionPredicted"
                            stroke="#82ca9d"
                            name="Producción Predicha"
                            strokeDasharray="5 5"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ValidationComponent;