import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported by this endpoint' },
        { status: 400 }
      );
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';
      
      try {
        // Try pdf-parse first
        const pdfData = await pdfParse(Buffer.from(arrayBuffer));
        extractedText = pdfData.text;
        console.log(`PDF text extracted: ${extractedText.length} characters`);
      } catch (pdfParseError) {
        console.log('pdf-parse failed, falling back to pdf-lib:', pdfParseError);
        
        // Fallback to pdf-lib
        try {
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          
          // Try to extract form fields
          const form = pdfDoc.getForm();
          const fields = form.getFields();
          
          fields.forEach(field => {
            try {
              if (field.constructor.name === 'PDFTextField') {
                const textField = field as { getText?: () => string };
                if (textField.getText) {
                  extractedText += textField.getText() + ' ';
                }
              }
            } catch {
              // Skip problematic fields
            }
          });
          
          // If still no text, provide helpful guidance
          if (!extractedText.trim()) {
            extractedText = `PDF Document Analysis - ${file.name}

This PDF document contains ${pages.length} page(s) but appears to have limited extractable text content.

For optimal analysis with Specter AI, please consider:

1. **Text-based PDFs**: Ensure your PDF contains selectable text (not just images)
2. **Alternative formats**: Convert to .txt or .md format for best results
3. **Copy-paste method**: Extract text manually and save as a text file

Document Information:
- File: ${file.name}
- Pages: ${pages.length}
- Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
- Type: PDF document

The analysis will proceed with available content, but results may be limited.`;
          }
          
          console.log(`PDF processed via pdf-lib: ${extractedText.length} characters`);
        } catch (pdfLibError) {
          console.error('Both pdf-parse and pdf-lib failed:', pdfLibError);
          throw new Error('Unable to process PDF file. Please ensure the file is not corrupted or try converting to text format.');
        }
      }
      
      return NextResponse.json({ text: extractedText });
      
    } catch (extractionError) {
      console.error('File extraction error:', extractionError);
      return NextResponse.json(
        { error: 'Failed to extract text from file. Please ensure the file is not corrupted and try again.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
