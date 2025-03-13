import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
import { OcrExtractionResult } from './ocrUtils';
import { exportOcrResultsToExcel } from '../../utils/exportUtils';

interface OcrResultsViewerProps {
  results: OcrExtractionResult | null;
  onResultsUpdate: (updatedResults: OcrExtractionResult) => void;
}

/**
 * Component for viewing and correcting OCR extraction results
 */
const OcrResultsViewer: React.FC<OcrResultsViewerProps> = ({
  results,
  onResultsUpdate
}) => {
  // State for editable fields
  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    companyName: false,
    billingPeriod: false,
    totalAmount: false,
    consumption: false,
    rate: false
  });
  
  // State for edited values
  const [editedValues, setEditedValues] = useState<Partial<OcrExtractionResult>>({});
  
  // If no results, show message
  if (!results) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          No hay resultados de OCR disponibles para visualizar.
        </Typography>
      </Paper>
    );
  }
  
  // Get confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success.main';
    if (confidence >= 60) return 'warning.main';
    return 'error.main';
  };
  
  // Get confidence level icon
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircleIcon color="success" />;
    if (confidence >= 60) return <WarningIcon color="warning" />;
    return <WarningIcon color="error" />;
  };
  
  // Handle edit mode toggle
  const toggleEditMode = (field: string) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // Initialize edited value if not already set
    if (!editedValues[field as keyof OcrExtractionResult]) {
      setEditedValues(prev => ({
        ...prev,
        [field]: results[field as keyof OcrExtractionResult]
      }));
    }
  };
  
  // Handle value change
  const handleValueChange = (field: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle save changes
  const handleSaveChanges = (field: string) => {
    // Update results with edited value
    const updatedResults = {
      ...results,
      [field]: editedValues[field as keyof OcrExtractionResult] || results[field as keyof OcrExtractionResult]
    };
    
    // Call onResultsUpdate with updated results
    onResultsUpdate(updatedResults);
    
    // Exit edit mode
    toggleEditMode(field);
  };
  
  // Handle export to Excel
  const handleExportToExcel = () => {
    try {
      exportOcrResultsToExcel(results);
    } catch (error) {
      console.error('Error exporting OCR results to Excel:', error);
      // Could add a snackbar or alert here to notify the user
    }
  };
  
  // Render field with edit capability
  const renderEditableField = (field: keyof OcrExtractionResult, label: string) => {
    const value = results[field] as string;
    const confidence = results.confidence.fields[field] || results.confidence.overall;
    const isEditing = editMode[field];
    const editedValue = editedValues[field] as string;
    
    return (
      <Grid item xs={12} md={6}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={`Confianza: ${confidence}%`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    {getConfidenceIcon(confidence)}
                    <Typography variant="caption" color={getConfidenceColor(confidence)} sx={{ ml: 0.5 }}>
                      {confidence}%
                    </Typography>
                  </Box>
                </Tooltip>
                <IconButton size="small" onClick={() => toggleEditMode(field)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {isEditing ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={editedValue || value}
                  onChange={(e) => handleValueChange(field, e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={() => toggleEditMode(field)}
                    sx={{ mr: 1 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSaveChanges(field)}
                  >
                    Guardar
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1">{value}</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Resultados de Extracción OCR
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportToExcel}
        >
          Exportar a Excel
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Revise los datos extraídos y corrija cualquier error antes de continuar. Los campos con baja confianza pueden requerir corrección manual.
      </Alert>
      
      <Grid container spacing={2}>
        {renderEditableField('companyName', 'Compañía')}
        {renderEditableField('billingPeriod', 'Periodo de Facturación')}
        {renderEditableField('totalAmount', 'Importe Total')}
        {renderEditableField('consumption', 'Consumo')}
        {renderEditableField('rate', 'Tarifa')}
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Texto Extraído Original
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {results.rawText}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default OcrResultsViewer;