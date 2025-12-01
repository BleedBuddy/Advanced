// @ts-nocheck
import { PreflightResult, PreflightCheck } from '../types';

// This is a mock service. In a real application, this would be a backend service
// that uses a library like PyMuPDF to analyze the PDF file.

export const analyzePdf = async (file: File): Promise<PreflightResult> => {
  // Use pdf.js to get the actual page count and check for render permissions
  const fileReader = new FileReader();
  const analysisPromise = new Promise<{ pageCount: number }>((resolve, reject) => {
    fileReader.onload = async (event) => {
      try {
        const pdfData = new Uint8Array(event.target.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        // CRITICAL CHECK: Attempt to render the first page to a dummy canvas.
        // This will reliably trigger 'NoModificationAllowedError' for protected files.
        const page = await pdf.getPage(1);
        const dummyCanvas = document.createElement('canvas');
        const dummyContext = dummyCanvas.getContext('2d');
        const viewport = page.getViewport({ scale: 0.1 });
        await page.render({ canvasContext: dummyContext, viewport: viewport }).promise;
        
        resolve({ pageCount: pdf.numPages });
      } catch (e) {
        console.error("Failed to parse or render PDF for analysis:", e);
        if (e.name === 'NoModificationAllowedError') {
            reject('This PDF is protected and cannot be analyzed. Please upload a different file.');
        } else {
            reject('Failed to analyze the PDF. It may be corrupted or in an unsupported format.');
        }
      }
    };
    fileReader.onerror = (err) => reject('Failed to read the file.');
    fileReader.readAsArrayBuffer(file);
  });

  const { pageCount } = await analysisPromise;

  // Analysis checks based on findings
  const checks: PreflightCheck[] = [
    {
      id: 'bleed',
      name: 'Bleed Insufficient', // We assume the uploaded file always needs bleed correction
      status: 'fail',
      details: 'File will be processed to add a standard 0.125" bleed margin and crop marks.'
    }
  ];
  
  const result: PreflightResult = {
    fileName: file.name,
    pageCount: pageCount,
    previewUrl: URL.createObjectURL(file),
    dimensions: {
      inches: '8.5" x 11"', // Note: This is still mocked for simplicity
      metric: '215.9mm x 279.4mm'
    },
    checks,
  };

  // Simulate network delay for analysis
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return result;
};