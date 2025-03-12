import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

type ReportData = {
  titulo: string;
  usuario: string;
  escenario: string;
  datosComparativos: Record<string, number>;
  recomendacion: string;
};

// Assign VFS using type assertion to avoid TypeScript errors
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export const generarReportePDF = (data: ReportData) => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: data.titulo, style: 'header' },
      { text: `Generado para: ${data.usuario}`, margin: [0, 10] },
      { text: 'Escenario actual:', style: 'subheader' },
      { text: data.escenario },
      { text: 'Comparativa de Costos:', style: 'subheader', margin: [0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['Opción', 'Costo 5 años', 'CO2 emitido'],
            ...Object.entries(data.datosComparativos).map(([key, value]) => [
              key,
              `$${value.toLocaleString()}`,
              `${(value * 0.85).toFixed(2)} kg` // Datos mockeados temporalmente
            ])
          ]
        }
      },
      { text: 'Recomendación:', style: 'subheader', margin: [0, 10] },
      { text: data.recomendacion },
      { 
        image: 'placeholderChart', 
        width: 400,
        margin: [0, 20] 
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center'
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 5]
      }
    },
    images: {
      placeholderChart: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
  };

  pdfMake.createPdf(docDefinition).open();
};