import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert, Slider, Grid } from '@mui/material';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { processBill, OcrExtractionResult } from './ocrUtils';

/**
 * OCR Analyzer Component for processing electricity bills
 * 
 * This component allows users to upload images of electricity bills
 * and extracts relevant information using OCR technology.
 */
const OcrAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<OcrExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [imageQuality, setImageQuality] = useState<'good' | 'medium' | 'poor' | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setError(null);
      setResults(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        // Reset crop and rotation when new image is loaded
        setCrop(undefined);
        setCompletedCrop(null);
        setRotation(0);
        
        // Simulate image quality assessment
        // In a real implementation, this would analyze the image properties
        const qualityCheck = Math.random();
        if (qualityCheck > 0.7) setImageQuality('good');
        else if (qualityCheck > 0.4) setImageQuality('medium');
        else setImageQuality('poor');
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget;
  };
  
  const handleRotationChange = (_event: Event, newValue: number | number[]) => {
    setRotation(newValue as number);
  };

  const getCroppedImg = async (): Promise<File | null> => {
    if (!completedCrop || !imageRef.current) return null;
    
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width/2, -canvas.height/2);
    }
    
    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    if (rotation !== 0) {
      ctx.restore();
    }
    
    return new Promise((resolve) => {
      canvas.toBlob(blob => {
        if (!blob) {
          resolve(null);
          return;
        }
        const croppedFile = new File([blob], file?.name || 'cropped-image.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(croppedFile);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor seleccione un archivo primero');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get the cropped image if available, otherwise use the original file
      const imageToProcess = await getCroppedImg() || file;
      
      // Process the image using our OCR utility
      const extractionResult = await processBill(imageToProcess, {
        lang: 'spa',
        imagePreprocessing: true
      });
      
      setResults(extractionResult);
      
      // Show warning if confidence is low
      if (extractionResult.confidence.overall < 0.5) {
        setError('Advertencia: Baja confianza en los resultados. Verifique los datos extraídos.');
      }
    } catch (err) {
      setError('Error al procesar la factura. Por favor, inténtelo de nuevo.');
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Análisis OCR de Facturas
      </Typography>
      
      <Typography variant="body1" paragraph>
        Suba una imagen de su factura eléctrica para extraer automáticamente los datos relevantes.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        <label htmlFor="raised-button-file">
          <Button 
            variant="contained" 
            component="span"
            disabled={isProcessing}
          >
            Seleccionar Factura
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Archivo seleccionado: {file.name}
          </Typography>
        )}
      </Box>

      {imagePreview && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Vista previa y ajustes
          </Typography>
          
          {imageQuality && (
            <Alert 
              severity={imageQuality === 'good' ? 'success' : imageQuality === 'medium' ? 'info' : 'warning'}
              sx={{ mb: 2 }}
            >
              Calidad de imagen: {imageQuality === 'good' ? 'Buena' : imageQuality === 'medium' ? 'Media' : 'Baja'}
              {imageQuality === 'poor' && ' - Los resultados pueden no ser precisos'}
            </Alert>
          )}
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>Rotación</Typography>
            <Slider
              value={rotation}
              onChange={handleRotationChange}
              min={-180}
              max={180}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value: number) => `${value}°`}
              sx={{ maxWidth: 300 }}
            />
          </Box>
          
          <Box sx={{ maxWidth: '100%', overflow: 'auto' }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined}
            >
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                onLoad={handleImageLoad}
                style={{ 
                  maxWidth: '100%', 
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }} 
              />
            </ReactCrop>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Puede recortar la imagen seleccionando el área deseada
          </Typography>
        </Box>
      )}

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleUpload}
        disabled={!file || isProcessing}
        sx={{ mr: 2 }}
      >
        {isProcessing ? 'Procesando...' : 'Procesar Factura'}
      </Button>

      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Analizando factura...</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {results && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Resultados del Análisis</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Compañía:</strong> {results.companyName}</Typography>
              <Typography><strong>Periodo de facturación:</strong> {results.billingPeriod}</Typography>
              <Typography><strong>Importe total:</strong> {results.totalAmount}</Typography>
              <Typography><strong>Consumo:</strong> {results.consumption}</Typography>
              <Typography><strong>Tarifa:</strong> {results.rate}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Confianza de detección</Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">Global: {(results.confidence.overall * 100).toFixed(1)}%</Typography>
                <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      width: `${results.confidence.overall * 100}%`, 
                      bgcolor: results.confidence.overall > 0.7 ? 'success.main' : results.confidence.overall > 0.5 ? 'warning.main' : 'error.main',
                      height: '100%'
                    }} 
                  />
                </Box>
              </Box>
              
              {Object.entries(results.confidence.fields).map(([field, confidence]) => (
                <Box key={field} sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {field}: {(confidence * 100).toFixed(1)}%
                  </Typography>
                  <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 6, overflow: 'hidden' }}>
                    <Box 
                      sx={{ 
                        width: `${confidence * 100}%`, 
                        bgcolor: confidence > 0.7 ? 'success.main' : confidence > 0.5 ? 'warning.main' : 'error.main',
                        height: '100%'
                      }} 
                    />
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Texto extraído</Typography>
            <Box 
              sx={{ 
                p: 1, 
                bgcolor: 'grey.100', 
                borderRadius: 1, 
                maxHeight: 200, 
                overflow: 'auto',
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            >
              {results.rawText}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default OcrAnalyzer;