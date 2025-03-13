import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ValidationComparison } from './types';

interface ValidationSimulatorConnectorProps {
  validationData: ValidationComparison | null;
  onApplyToSimulator: (calibrationData: CalibrationData) => void;
}

interface CalibrationData {
  consumptionFactor: number;
  productionFactor: number;
  applyWeatherNormalization: boolean;
  confidenceThreshold: number;
}

/**
 * Component that connects validation data with the simulator
 * 
 * This component allows users to apply validation insights to improve
 * simulator predictions through calibration factors.
 */
const ValidationSimulatorConnector: React.FC<ValidationSimulatorConnectorProps> = ({
  validationData,
  onApplyToSimulator
}) => {
  // State for calibration settings
  const [calibrationData, setCalibrationData] = useState<CalibrationData>({
    consumptionFactor: 1.0,
    productionFactor: 1.0,
    applyWeatherNormalization: true,
    confidenceThreshold: 80
  });
  
  // State for calculated recommendations
  const [recommendations, setRecommendations] = useState<{
    consumptionFactor: number;
    productionFactor: number;
  } | null>(null);
  
  // State for loading
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Calculate recommended calibration factors based on validation data
  useEffect(() => {
    if (validationData) {
      setIsCalculating(true);
      
      // Simulate calculation delay
      setTimeout(() => {
        // Calculate consumption factor based on deviation
        const consumptionDeviation = validationData.metrics.totalConsumption.deviation;
        const consumptionActual = validationData.metrics.totalConsumption.actual;
        const consumptionPredicted = validationData.metrics.totalConsumption.predicted;
        
        // If actual > predicted, factor > 1 to increase predictions
        // If actual < predicted, factor < 1 to decrease predictions
        const recommendedConsumptionFactor = consumptionActual / consumptionPredicted;
        
        // Calculate production factor if available
        let recommendedProductionFactor = 1.0;
        if (validationData.metrics.totalProduction) {
          const productionActual = validationData.metrics.totalProduction.actual;
          const productionPredicted = validationData.metrics.totalProduction.predicted;
          recommendedProductionFactor = productionActual / productionPredicted;
        }
        
        // Set recommendations
        setRecommendations({
          consumptionFactor: parseFloat(recommendedConsumptionFactor.toFixed(2)),
          productionFactor: parseFloat(recommendedProductionFactor.toFixed(2))
        });
        
        setIsCalculating(false);
      }, 1000);
    }
  }, [validationData]);
  
  // Handle slider change
  const handleSliderChange = (name: keyof CalibrationData) => (_event: Event, newValue: number | number[]) => {
    setCalibrationData(prev => ({
      ...prev,
      [name]: newValue as number
    }));
  };
  
  // Handle switch change
  const handleSwitchChange = (name: keyof CalibrationData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCalibrationData(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  };
  
  // Handle apply recommendations
  const handleApplyRecommendations = () => {
    if (recommendations) {
      setCalibrationData(prev => ({
        ...prev,
        consumptionFactor: recommendations.consumptionFactor,
        productionFactor: recommendations.productionFactor
      }));
    }
  };
  
  // Handle apply to simulator
  const handleApplyToSimulator = () => {
    onApplyToSimulator(calibrationData);
  };
  
  // If no validation data, show message
  if (!validationData) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay datos de validación disponibles para conectar con el simulador.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Conectar Validación con Simulador
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Utilice los factores de calibración para mejorar la precisión del simulador basándose en los datos de validación.
          </Alert>
        </Grid>
        
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Resumen de Validación
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Desviación en Consumo:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {validationData.metrics.totalConsumption.deviation.toFixed(2)}%
                  </Typography>
                </Grid>
                
                {validationData.metrics.totalProduction && (
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Desviación en Producción:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {validationData.metrics.totalProduction.deviation.toFixed(2)}%
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Periodo de Validación:
                  </Typography>
                  <Typography variant="body1">
                    {new Date(validationData.period.start).toLocaleDateString()} - {new Date(validationData.period.end).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  Factores de Calibración Recomendados
                </Typography>
                
                {isCalculating ? (
                  <CircularProgress size={24} />
                ) : recommendations ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleApplyRecommendations}
                  >
                    Aplicar Recomendaciones
                  </Button>
                ) : null}
              </Box>
              
              {isCalculating ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : recommendations ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Factor de Consumo Recomendado:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {recommendations.consumptionFactor}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Factor de Producción Recomendado:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {recommendations.productionFactor}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se pudieron calcular recomendaciones con los datos disponibles.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Factor de Calibración de Consumo: {calibrationData.consumptionFactor}
          </Typography>
          <Slider
            value={calibrationData.consumptionFactor}
            onChange={handleSliderChange('consumptionFactor')}
            min={0.5}
            max={1.5}
            step={0.01}
            marks={[
              { value: 0.5, label: '0.5' },
              { value: 1.0, label: '1.0' },
              { value: 1.5, label: '1.5' }
            ]}
            valueLabelDisplay="auto"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Valores {'>'}1 aumentan las predicciones de consumo, valores {'<'}1 las disminuyen.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Factor de Calibración de Producción: {calibrationData.productionFactor}
          </Typography>
          <Slider
            value={calibrationData.productionFactor}
            onChange={handleSliderChange('productionFactor')}
            min={0.5}
            max={1.5}
            step={0.01}
            marks={[
              { value: 0.5, label: '0.5' },
              { value: 1.0, label: '1.0' },
              { value: 1.5, label: '1.5' }
            ]}
            valueLabelDisplay="auto"
            disabled={!validationData.metrics.totalProduction}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Valores {'>'}1 aumentan las predicciones de producción, valores {'<'}1 las disminuyen.
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={calibrationData.applyWeatherNormalization}
                onChange={handleSwitchChange('applyWeatherNormalization')}
              />
            }
            label="Aplicar normalización por condiciones climáticas"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 3 }}>
            Ajusta las predicciones según las condiciones climáticas para mejorar la precisión.
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Umbral de Confianza: {calibrationData.confidenceThreshold}%
          </Typography>
          <Slider
            value={calibrationData.confidenceThreshold}
            onChange={handleSliderChange('confidenceThreshold')}
            min={50}
            max={95}
            step={5}
            marks={[
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 95, label: '95%' }
            ]}
            valueLabelDisplay="auto"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Solo se aplicarán calibraciones a predicciones con confianza superior al umbral establecido.
          </Typography>
        </Grid>
        
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyToSimulator}
            size="large"
          >
            Aplicar al Simulador
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ValidationSimulatorConnector;