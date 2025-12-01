// @ts-nocheck
// This service has been re-architected to use a hybrid vector/raster approach.
// This preserves the original vector page content while generating a rasterized bleed area.
// This is a professional prepress standard that prevents critical content like text from being bitmapped.

const DPI = 300; // Render at 300 DPI for print quality
const BLEED_INCHES = 0.125;
const CROP_MARGIN_INCHES = 0.25; // Safe area for crop marks outside the bleed

/**
 * Creates a bleed area by mirroring the edges and corners of the original artwork.
 * This is the definitive, re-engineered implementation of the copy-mirror technique,
 * designed to be robust and geometrically correct, resolving all previous issues with
 * missing bleeds, seams, or gaps.
 * @param {HTMLCanvasElement} originalCanvas The high-resolution render of the original page.
 * @returns {HTMLCanvasElement} A new canvas containing the original content with mirrored bleed borders.
 */
const createMirroredBleedCanvas = (originalCanvas) => {
    console.log("Implementing definitive, geometrically sound copy-mirror bleed technique.");
    const originalWidthPx = originalCanvas.width;
    const originalHeightPx = originalCanvas.height;
    const bleedPx = Math.round(BLEED_INCHES * DPI);

    const bleedCanvas = document.createElement('canvas');
    bleedCanvas.width = originalWidthPx + 2 * bleedPx;
    bleedCanvas.height = originalHeightPx + 2 * bleedPx;
    const ctx = bleedCanvas.getContext('2d', { alpha: false }); // Use non-alpha for performance
    if (!ctx) throw new Error("Could not create canvas context for mirrored bleed.");

    // Disable smoothing for sharp, pixel-perfect results.
    ctx.imageSmoothingEnabled = false;

    // 1. Draw the original image in the center. This is the foundation.
    ctx.drawImage(originalCanvas, bleedPx, bleedPx);

    // 2. Mirror the four sides.
    // The technique is to flip the entire coordinate system, then draw the image
    // slice into a negative coordinate space, which makes it appear in the correct
    // positive space on the canvas. This is more robust than translate+scale.

    // Top Bleed
    ctx.save();
    ctx.scale(1, -1); // Flip vertically
    ctx.drawImage(originalCanvas, 0, 0, originalWidthPx, bleedPx, bleedPx, -bleedPx, originalWidthPx, bleedPx);
    ctx.restore();

    // Bottom Bleed
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(originalCanvas, 0, originalHeightPx - bleedPx, originalWidthPx, bleedPx, bleedPx, -(originalHeightPx + 2 * bleedPx), originalWidthPx, bleedPx);
    ctx.restore();

    // Left Bleed
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(originalCanvas, 0, 0, bleedPx, originalHeightPx, -bleedPx, bleedPx, bleedPx, originalHeightPx);
    ctx.restore();
    
    // Right Bleed
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(originalCanvas, originalWidthPx - bleedPx, 0, bleedPx, originalHeightPx, -(originalWidthPx + 2 * bleedPx), bleedPx, bleedPx, originalHeightPx);
    ctx.restore();

    // 3. Mirror the four corners to fill the gaps.
    // This requires flipping both axes.
    
    // Top-Left Corner
    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(originalCanvas, 0, 0, bleedPx, bleedPx, -bleedPx, -bleedPx, bleedPx, bleedPx);
    ctx.restore();

    // Top-Right Corner
    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(originalCanvas, originalWidthPx - bleedPx, 0, bleedPx, bleedPx, -(originalWidthPx + 2 * bleedPx), -bleedPx, bleedPx, bleedPx);
    ctx.restore();

    // Bottom-Left Corner
    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(originalCanvas, 0, originalHeightPx - bleedPx, bleedPx, bleedPx, -bleedPx, -(originalHeightPx + 2 * bleedPx), bleedPx, bleedPx);
    ctx.restore();

    // Bottom-Right Corner
    ctx.save();
    ctx.scale(-1, -1);
    ctx.drawImage(originalCanvas, originalWidthPx - bleedPx, originalHeightPx - bleedPx, bleedPx, bleedPx, -(originalWidthPx + 2 * bleedPx), -(originalHeightPx + 2 * bleedPx), bleedPx, bleedPx);
    ctx.restore();
    
    return bleedCanvas;
};


/**
 * Converts a portion of a canvas to a PNG byte array.
 */
const canvasToPngBytes = (canvas, x, y, width, height) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    return Uint8Array.from(atob(tempCanvas.toDataURL('image/png').split(',')[1]), c => c.charCodeAt(0));
};


export const generateBleed = async (file: File): Promise<string> => {
    console.log("Initiating vector-preserving bleed generation for:", file.name);
    
    const { PDFDocument, cmyk } = window.PDFLib;
    const arrayBuffer = await file.arrayBuffer();

    try {
        // Load the document into both pdf.js (for rendering) and pdf-lib (for manipulation)
        const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const sourcePdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdfDoc = await PDFDocument.create();

        const pageCount = pdfjsDoc.numPages;

        for (let i = 0; i < pageCount; i++) {
            console.log(`Processing page ${i + 1} of ${pageCount}...`);
            const page = await pdfjsDoc.getPage(i + 1);
            const sourceLibPage = sourcePdfDoc.getPage(i);

            // 1. Correctly determine final page dimensions by respecting the CropBox and rotation.
            const viewport = page.getViewport({ scale: 1 });
            const finalTrimWidthPt = viewport.width;
            const finalTrimHeightPt = viewport.height;
            console.log(`Detected Trim Box (W x H): ${finalTrimWidthPt / 72}" x ${finalTrimHeightPt / 72}"`);

            // 2. Render the original page to a canvas at high resolution for bleed generation
            const renderViewport = page.getViewport({ scale: DPI / 72 });
            const originalCanvas = document.createElement('canvas');
            const context = originalCanvas.getContext('2d');
            if (!context) throw new Error("Failed to get 2D context for original canvas");
            context.imageSmoothingEnabled = false;
            originalCanvas.width = renderViewport.width;
            originalCanvas.height = renderViewport.height;
            
            // Fill with white background to handle PDFs with transparency
            context.fillStyle = 'white';
            context.fillRect(0, 0, originalCanvas.width, originalCanvas.height);
            
            await page.render({ canvasContext: context, viewport: renderViewport }).promise;

            // 3. Create a canvas with mirrored bleed from the original render.
            const bleedCanvas = createMirroredBleedCanvas(originalCanvas);

            // 4. Set up dimensions for the new page in Points (72 DPI)
            const bleedPt = BLEED_INCHES * 72;
            const cropMarginPt = CROP_MARGIN_INCHES * 72;
            
            const newPageWidthPt = finalTrimWidthPt + 2 * (bleedPt + cropMarginPt);
            const newPageHeightPt = finalTrimHeightPt + 2 * (bleedPt + cropMarginPt);

            const newPage = newPdfDoc.addPage([newPageWidthPt, newPageHeightPt]);
            
            // 5. Extract ONLY the bleed areas as images and embed them onto the new page
            const bleedPx = Math.round(BLEED_INCHES * DPI);
            const originalWidthPx = originalCanvas.width;
            const originalHeightPx = originalCanvas.height;
            const fullBleedWidthPx = bleedCanvas.width;
            const fullBleedHeightPx = bleedCanvas.height;

            // Top
            const topBleedBytes = canvasToPngBytes(bleedCanvas, 0, 0, fullBleedWidthPx, bleedPx);
            const topImage = await newPdfDoc.embedPng(topBleedBytes);
            newPage.drawImage(topImage, { x: cropMarginPt, y: newPageHeightPt - cropMarginPt - bleedPt, width: newPageWidthPt - 2 * cropMarginPt, height: bleedPt });
            
            // Bottom
            const bottomBleedBytes = canvasToPngBytes(bleedCanvas, 0, fullBleedHeightPx - bleedPx, fullBleedWidthPx, bleedPx);
            const bottomImage = await newPdfDoc.embedPng(bottomBleedBytes);
            newPage.drawImage(bottomImage, { x: cropMarginPt, y: cropMarginPt, width: newPageWidthPt - 2 * cropMarginPt, height: bleedPt });

            // Left
            const leftBleedBytes = canvasToPngBytes(bleedCanvas, 0, bleedPx, bleedPx, originalHeightPx);
            const leftImage = await newPdfDoc.embedPng(leftBleedBytes);
            newPage.drawImage(leftImage, { x: cropMarginPt, y: cropMarginPt + bleedPt, width: bleedPt, height: finalTrimHeightPt });

            // Right
            const rightBleedBytes = canvasToPngBytes(bleedCanvas, fullBleedWidthPx - bleedPx, bleedPx, bleedPx, originalHeightPx);
            const rightImage = await newPdfDoc.embedPng(rightBleedBytes);
            newPage.drawImage(rightImage, { x: newPageWidthPt - cropMarginPt - bleedPt, y: cropMarginPt + bleedPt, width: bleedPt, height: finalTrimHeightPt });


            // 6. CRITICAL STEP: Embed and draw the original page content, preserving its size and rotation.
            const [originalPageEmbedded] = await newPdfDoc.embedPdf(sourcePdfDoc, [i]);
            
            // VULNERABILITY: A mismatch between pdf.js's normalized rendering (which accounts for MediaBox offsets)
            // and pdf-lib's direct use of box coordinates could cause misalignment.
            // FIX: Calculate the TrimBox/CropBox position relative to the MediaBox origin. This ensures the
            // vector content is translated by the exact amount needed to align with the rendered bitmap,
            // resolving misalignment on any axis caused by a non-zero MediaBox origin.
            const trimBox = sourceLibPage.getTrimBox();
            const cropBox = sourceLibPage.getCropBox();
            const mediaBox = sourceLibPage.getMediaBox();
            const positioningBox = trimBox || cropBox;
            console.log(trimBox ? 'Using TrimBox for positioning.' : 'Using CropBox for positioning.');
            
            // Calculate the positioning box's offset from the media box's origin.
            const offsetX = positioningBox.x - mediaBox.x;
            const offsetY = positioningBox.y - mediaBox.y;
            
            // We want the positioning box's origin to land on our target trim area's origin.
            // The drawPage command positions the media box. So we translate it by the target amount,
            // minus the internal offset of the content.
            newPage.drawPage(originalPageEmbedded, {
                x: (cropMarginPt + bleedPt) - offsetX,
                y: (cropMarginPt + bleedPt) - offsetY,
            });


            // 7. Draw the locked-in crop marks based on the correctly detected trim size.
            const registrationBlack = cmyk(1, 1, 1, 1);
            const CROP_WEIGHT_PT = 0.5;
            const trimX1 = cropMarginPt + bleedPt;
            const trimY1 = cropMarginPt + bleedPt;
            const trimX2 = trimX1 + finalTrimWidthPt;
            const trimY2 = trimY1 + finalTrimHeightPt;
            const cropLength = cropMarginPt;

            // Top-left
            newPage.drawLine({ start: { x: 0, y: trimY2 }, end: { x: cropLength, y: trimY2 }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            newPage.drawLine({ start: { x: trimX1, y: newPageHeightPt }, end: { x: trimX1, y: newPageHeightPt - cropLength }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            // Top-right
            newPage.drawLine({ start: { x: newPageWidthPt - cropLength, y: trimY2 }, end: { x: newPageWidthPt, y: trimY2 }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            newPage.drawLine({ start: { x: trimX2, y: newPageHeightPt }, end: { x: trimX2, y: newPageHeightPt - cropLength }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            // Bottom-left
            newPage.drawLine({ start: { x: 0, y: trimY1 }, end: { x: cropLength, y: trimY1 }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            newPage.drawLine({ start: { x: trimX1, y: 0 }, end: { x: trimX1, y: cropLength }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            // Bottom-right
            newPage.drawLine({ start: { x: newPageWidthPt - cropLength, y: trimY1 }, end: { x: newPageWidthPt, y: trimY1 }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
            newPage.drawLine({ start: { x: trimX2, y: 0 }, end: { x: trimX2, y: cropLength }, thickness: CROP_WEIGHT_PT, color: registrationBlack });
        }

        const pdfBytes = await newPdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        console.log(`Processing complete for all ${pageCount} pages. Returning corrected PDF file URL.`);
        return blobUrl;

    } catch (error) {
        console.error('Error during bleed generation:', error);
        throw new Error('Failed to generate bleed. The file might be incompatible or the service may be temporarily unavailable.');
    }
};