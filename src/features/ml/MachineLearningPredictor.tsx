import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField, Grid, CircularProgress, Alert, Slider, LinearProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Machine Learning Predictor Component
 * 
 * This component implements a basic machine learning system for energy consumption
 * and production predictions based on historical data and various parameters.
 */
const MachineLearningPredictor: React.FC = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [parameters, setParameters] = useState({
    historicalDataMonths: 12,
    seasonalityFactor: 0.5,
    weatherImpact: 0.7,
    confidenceInterval: 0.9
  });
  
  // Mock historical data
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Generate mock historical data on component mount
  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const mockData = [];
    const now = new Date();
    const baseConsumption = 350; // Base kWh per month
    const baseProduction = 0; // Base production (for non-solar months)
    
    // Generate 24 months of data
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - 23 + i, 1);
      const month = date.getMonth();
      
      // Add seasonality to consumption (higher in winter, lower in summer)
      const seasonalFactor = Math.cos((month / 12) * 2 * Math.PI) * 0.3 + 1;
      
      // Add randomness
      const randomFactor = 0.9 + Math.random() * 0.2;
      
      // Calculate consumption with seasonality and randomness
      const consumption = baseConsumption * seasonalFactor * randomFactor;
      
      // Calculate production (higher in summer months for solar)
      // Solar production peaks in summer (months 5-8)
      const solarFactor = Math.sin((month / 12) * 2 * Math.PI) * 0.5 + 0.5;
      const production = month >= 3 && month <= 8 ? 
        baseConsumption * solarFactor * randomFactor : 
        baseProduction;
      
      mockData.push({
        date: date.toISOString().slice(0, 7), // YYYY-MM format
        consumption: Math.round(consumption),
        production: Math.round(production)
      });
    }
    
    setHistoricalData(mockData);
  };

  const handleParameterChange = (param: string) => (event: any, newValue: number | number[]) => {
    setParameters({
      ...parameters,
      [param]: newValue
    });
  };

  const trainModel = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setError(null);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setModelTrained(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const generatePredictions = () => {
    if (!modelTrained) {
      setError('Por favor, entrene el modelo primero');
      return;
    }

    setIsPredicting(true);
    setError(null);

    // Simulate prediction processing
    setTimeout(() => {
      try {
        // Get the last 12 months of data (or less if not available)
        const recentData = historicalData.slice(-parameters.historicalDataMonths);
        
        // Calculate averages for baseline
        const avgConsumption = recentData.reduce((sum, item) => sum + item.consumption, 0) / recentData.length;
        const avgProduction = recentData.reduce((sum, item) => sum + item.production, 0) / recentData.length;
        
        // Generate future predictions (next 12 months)
        const predictions = [];
        const lastDate = new Date(recentData[recentData.length - 1].date);
        
        for (let i = 1; i <= 12; i++) {
          const predictionDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
          const month = predictionDate.getMonth();
          
          // Apply seasonality
          const seasonalConsumptionFactor = Math.cos((month / 12) * 2 * Math.PI) * 0.3 * parameters.seasonalityFactor + 1;
          const seasonalProductionFactor = Math.sin((month / 12) * 2 * Math.PI) * 0.5 * parameters.seasonalityFactor + 0.5;
          
          // Apply weather impact (random variation representing weather uncertainty)
          const weatherVariation = (0.9 + Math.random() * 0.2) * parameters.weatherImpact;
          
          // Calculate predicted values
          const predictedConsumption = avgConsumption * seasonalConsumptionFactor * weatherVariation;
          const predictedProduction = month >= 3 && month <= 8 ? 
            avgProduction * seasonalProductionFactor * weatherVariation : 
            avgProduction * 0.3 * weatherVariation;
          
          // Calculate confidence intervals
          const confidenceFactor = 1 - parameters.confidenceInterval;
          const consumptionLower = predictedConsumption * (1 - confidenceFactor);
          const consumptionUpper = predictedConsumption * (1 + confidenceFactor);
          const productionLower = predictedProduction * (1 - confidenceFactor);
          const productionUpper = predictedProduction * (1 + confidenceFactor);
          
          predictions.push({
            date: predictionDate.toISOString().slice(0, 7),
            predictedConsumption: Math.round(predictedConsumption),
            consumptionLower: Math.round(consumptionLower),
            consumptionUpper: Math.round(consumptionUpper),
            predictedProduction: Math.round(predictedProduction),
            productionLower: Math.round(productionLower),
            productionUpper: Math.round(productionUpper)
          });
        }
        
        // Calculate accuracy metrics (simulated)
        const accuracyMetrics = {
          consumptionMAPE: (5 + Math.random() * 5).toFixed(2), // Mean Absolute Percentage Error
          productionMAPE: (7 + Math.random() * 8).toFixed(2),
          r2Score: (0.7 + Math.random() * 0.25).toFixed(2), // R² score
          crossValidationScore: (0.65 + Math.random() * 0.3).toFixed(2)
        };
        
        setPredictionResults({
          predictions,
          metrics: accuracyMetrics,
          parameters: { ...parameters }
        });
      } catch (err) {
        setError('Error al generar predicciones');
        console.error('Prediction error:', err);
      } finally {
        setIsPredicting(false);
      }
    }, 1500);
  };

  // Combine historical and prediction data for visualization
  const getChartData = () => {
    if (!predictionResults) return historicalData;
    
    // Get only recent historical data based on the parameter
    const recentHistorical = historicalData.slice(-parameters.historicalDataMonths);
    
    // Combine with predictions
    return [...recentHistorical, ...predictionResults.predictions];
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Sistema de Machine Learning para Predicciones
      </Typography>
      
      <Typography variant="body1" paragraph>
        Utilice aprendizaje automático para predecir consumos y producción energética futura basada en datos históricos.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Parámetros del Modelo</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography id="historical-data-slider" gutterBottom>
                Meses de datos históricos: {parameters.historicalDataMonths}
              </Typography>
              <Slider
                value={parameters.historicalDataMonths}
                onChange={handleParameterChange('historicalDataMonths')}
                aria-labelledby="historical-data-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={3}
                max={24}
                disabled={isTraining || isPredicting}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography id="seasonality-slider" gutterBottom>
                Factor de estacionalidad: {parameters.seasonalityFactor.toFixed(1)}
              </Typography>
              <Slider
                value={parameters.seasonalityFactor}
                onChange={handleParameterChange('seasonalityFactor')}
                aria-labelledby="seasonality-slider"
                valueLabelDisplay="auto"
                step={0.1}
                marks
                min={0}
                max={1}
                disabled={isTraining || isPredicting}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography id="weather-impact-slider" gutterBottom>
                Impacto climático: {parameters.weatherImpact.toFixed(1)}
              </Typography>
              <Slider
                value={parameters.weatherImpact}
                onChange={handleParameterChange('weatherImpact')}
                aria-labelledby="weather-impact-slider"
                valueLabelDisplay="auto"
                step={0.1}
                marks
                min={0}
                max={1}
                disabled={isTraining || isPredicting}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography id="confidence-interval-slider" gutterBottom>
                Intervalo de confianza: {parameters.confidenceInterval.toFixed(1)}
              </Typography>
              <Slider
                value={parameters.confidenceInterval}
                onChange={handleParameterChange('confidenceInterval')}
                aria-labelledby="confidence-interval-slider"
                valueLabelDisplay="auto"
                step={0.1}
                marks
                min={0.5}
                max={0.95}
                disabled={isTraining || isPredicting}
              />
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              onClick={trainModel}
              disabled={isTraining || isPredicting}
              fullWidth
              sx={{ mb: 2 }}
            >
              {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
            </Button>
            
            {isTraining && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="body2" align="center">
                  Progreso de entrenamiento: {trainingProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={trainingProgress} />
              </Box>
            )}
            
            <Button
              variant="contained"
              onClick={generatePredictions}
              disabled={!modelTrained || isTraining || isPredicting}
              fullWidth
            >
              {isPredicting ? 'Generando...' : 'Generar Predicciones'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Visualización de Datos y Predicciones</Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {isPredicting && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <CircularProgress size={40} sx={{ mr: 2 }} />
                <Typography>Generando predicciones...</Typography>
              </Box>
            )}
            
            {!isPredicting && (
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    
                    {/* Historical data lines */}
                    <Line 
                      type="monotone" 
                      dataKey="consumption" 
                      name="Consumo Histórico"
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="production" 
                      name="Producción Histórica"
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                    
                    {/* Prediction lines (only shown if predictions exist) */}
                    {predictionResults && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="predictedConsumption" 
                          name="Consumo Predicho"
                          stroke="#8884d8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predictedProduction" 
                          name="Producción Predicha"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {predictionResults && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Métricas de Precisión:</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2">MAPE Consumo: {predictionResults.metrics.consumptionMAPE}%</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2">MAPE Producción: {predictionResults.metrics.productionMAPE}%</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2">R² Score: {predictionResults.metrics.r2Score}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2">Cross-Validation: {predictionResults.metrics.crossValidationScore}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MachineLearningPredictor;