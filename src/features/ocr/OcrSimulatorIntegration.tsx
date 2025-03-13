import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert, Grid, Divider, Chip, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { OcrExtractionResult } from './ocrUtils';
import { FormValues } from '../../components/SimuladorPersonalizado';

interface OcrSimulatorIntegrationProps {
  ocrResults: OcrExtractionResult | null;
  onApplyToSimulator: (formValues: Partial<FormValues>) => void;
  isLoading?: boolean;
  onSaveCorrections?: (correctedResults: OcrExtractionResult) => void;
}

/**
 * Component that integrates OCR extracted data with the simulator
 * 
 * This component allows users to review OCR extracted data and apply it
 * to the simulator with options for correction before simulation.
 */
const OcrSimulatorIntegration: React.FC<OcrSimulatorIntegrationProps> = ({
  ocrResults,
  onApplyToSimulator,
  isLoading = false,
  onSaveCorrections
}) => {
  // State for editable values extracted from OCR
  const [editableValues, setEditableValues] = useState<Partial<FormValues>>({
    consumoMensual: '',
    precioElectricidad: '',
    horasSol: '5', // Default value for solar hours
    inversionInicial: '',
    eficienciaPaneles: '20', // Default efficiency
    vidaUtil: '25' // Default lifespan
  });
  
  // State for validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState<boolean>(false);
  
  // Format number for Colombian currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Update editable values when OCR results change
  useEffect(() => {
    if (ocrResults) {
      // Extract consumption and rate from OCR results
      const consumption = ocrResults.consumption.replace(/[^0-9.,]/g, '');
      
      // Convert rate to Colombian pesos if needed (assuming rate might be in euros)
      // For this example, we'll use a simple conversion or ensure it's in the right range
      let rate = ocrResults.rate.replace(/[^0-9.,]/g, '');
      const rateValue = parseFloat(rate.replace(',', '.')) || 0;
      
      // If rate seems to be in euros (too small for COP), convert it
      // Typical COP/kWh rates are in hundreds, not decimals
      if (rateValue > 0 && rateValue < 10) {
        // Convert from EUR to COP (approximate conversion)
        rate = Math.round(rateValue * 4500).toString();
      } else if (rateValue === 0) {
        // Default value if extraction failed
        rate = '500';
      }
      
      // Estimate initial investment based on consumption (simplified formula for Colombian market)
      const estimatedConsumption = parseFloat(consumption.replace(',', '.')) || 0;
      const estimatedInvestment = Math.round(estimatedConsumption * 5000).toString(); // Higher multiplier for Colombian market
      
      // Create updated values
      const updatedValues = {
        ...editableValues,
        consumoMensual: consumption,
        precioElectricidad: rate,
        inversionInicial: estimatedInvestment
      };
      
      // Update editable values
      setEditableValues(updatedValues);
      
      // Validate the extracted values
      validateValues(updatedValues);
    }
  }, [ocrResults]);
  
  // Validate the values
  const validateValues = (values: Partial<FormValues>) => {
    const newErrors: Record<string, string> = {};
    
    // Validate consumption
    if (values.consumoMensual) {
      const consumption = parseFloat(values.consumoMensual.replace(',', '.'));
      if (isNaN(consumption)) {
        newErrors.consumoMensual = 'El consumo debe ser un número';
      } else if (consumption < 0 || consumption > 5000) {
        newErrors.consumoMensual = 'El consumo debe estar entre 0 y 5000 kWh';
      }
    } else {
      newErrors.consumoMensual = 'El consumo es requerido';
    }
    
    // Validate electricity price
    if (values.precioElectricidad) {
      const price = parseFloat(values.precioElectricidad.replace(',', '.'));
      if (isNaN(price)) {
        newErrors.precioElectricidad = 'El precio debe ser un número';
      } else if (price < 300 || price > 1000) {
        newErrors.precioElectricidad = 'La tarifa debe estar entre 300 y 1000 COP/kWh';
      }
    } else {
      newErrors.precioElectricidad = 'El precio es requerido';
    }
    
    // Validate initial investment if provided
    if (values.inversionInicial) {
      const investment = parseFloat(values.inversionInicial.replace(',', '.'));
      if (isNaN(investment)) {
        newErrors.inversionInicial = 'La inversión debe ser un número';
      } else if (investment < 0) {
        newErrors.inversionInicial = 'La inversión no puede ser negativa';
      }
    }
    
    // Validate solar hours if provided
    if (values.horasSol) {
      const solarHours = parseFloat(values.horasSol.replace(',', '.'));
      if (isNaN(solarHours)) {
        newErrors.horasSol = 'Las horas de sol deben ser un número';
      } else if (solarHours <= 0 || solarHours > 12) {
        newErrors.horasSol = 'Las horas de sol deben estar entre 0 y 12';
      }
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedValues = { ...editableValues, [name]: value };
    setEditableValues(updatedValues);
    validateValues(updatedValues);
  };
  
  // Get confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success.main';
    if (confidence >= 60) return 'warning.main';
    return 'error.main';
  };
  
  // Get confidence level icon
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircleIcon color="success" fontSize="small" />;
    if (confidence >= 60) return <WarningIcon color="warning" fontSize="small" />;
    return <ErrorIcon color="error" fontSize="small" />;
  };
  
  // Handle apply to simulator
  const handleApplyToSimulator = () => {
    if (isValid) {
      onApplyToSimulator(editableValues);
      
      // If onSaveCorrections is provided, save the corrected OCR results
      if (onSaveCorrections && ocrResults) {
        const correctedResults: OcrExtractionResult = {
          ...ocrResults,
          consumption: editableValues.consumoMensual || ocrResults.consumption,
          rate: editableValues.precioElectricidad || ocrResults.rate
        };
        onSaveCorrections(correctedResults);
      }
    }
  };
  
  // If no OCR results, show message
  if (!ocrResults) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay datos OCR disponibles para aplicar al simulador.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Aplicar Datos de Factura al Simulador
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Procesando datos de la factura...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Revise y corrija los datos extraídos de su factura antes de aplicarlos al simulador.
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Consumo Mensual (kWh)
              </Typography>
              <Tooltip title={`Confianza: ${ocrResults.confidence.fields.consumption || 0}%`}>
                <Box sx={{ ml: 1 }}>
                  {getConfidenceIcon(ocrResults.confidence.fields.consumption || 0)}
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <input
                type="text"
                name="consumoMensual"
                value={editableValues.consumoMensual}
                onChange={handleInputChange}
                style={{
                  padding: '8px',
                  border: errors.consumoMensual ? '1px solid red' : '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </Box>
            {errors.consumoMensual && (
              <Typography variant="caption" color="error">
                {errors.consumoMensual}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Precio Electricidad (COP/kWh)
              </Typography>
              <Tooltip title={`Confianza: ${ocrResults.confidence.fields.rate || 0}%`}>
                <Box sx={{ ml: 1 }}>
                  {getConfidenceIcon(ocrResults.confidence.fields.rate || 0)}
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <input
                type="text"
                name="precioElectricidad"
                value={editableValues.precioElectricidad}
                onChange={handleInputChange}
                style={{
                  padding: '8px',
                  border: errors.precioElectricidad ? '1px solid red' : '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </Box>
            {errors.precioElectricidad && (
              <Typography variant="caption" color="error">
                {errors.precioElectricidad}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Inversión Inicial Estimada (COP)
              </Typography>
              <Tooltip title="Estimación basada en el consumo">
                <Box sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" color="info" />
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <input
                type="text"
                name="inversionInicial"
                value={editableValues.inversionInicial}
                onChange={handleInputChange}
                style={{
                  padding: '8px',
                  border: errors.inversionInicial ? '1px solid red' : '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </Box>
            {errors.inversionInicial && (
              <Typography variant="caption" color="error">
                {errors.inversionInicial}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Horas de Sol Diarias
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <input
                type="text"
                name="horasSol"
                value={editableValues.horasSol}
                onChange={handleInputChange}
                style={{
                  padding: '8px',
                  border: errors.horasSol ? '1px solid red' : '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </Box>
            {errors.horasSol && (
              <Typography variant="caption" color="error">
                {errors.horasSol}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Confianza general OCR: {ocrResults.confidence.overall}%
                {ocrResults.confidence.overall < 70 && (
                  <Tooltip title="Baja confianza en los resultados. Verifique los datos antes de continuar.">
                    <WarningIcon color="warning" fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                  </Tooltip>
                )}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyToSimulator}
                disabled={!isValid}
              >
                Aplicar al Simulador
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default OcrSimulatorIntegration;