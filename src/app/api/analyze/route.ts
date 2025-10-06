import { NextRequest, NextResponse } from 'next/server';
import { TCInsightAgent } from '@/lib/tc-analyzer';
import { PDFDocument } from 'pdf-lib';
const pdf = require('pdf-parse');

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

    // Extract text from file based on type
    let documentText = '';
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.pdf')) {
        // Handle PDF files with hybrid approach
        const arrayBuffer = await file.arrayBuffer();
        let extractedText = '';
        
        try {
          // First, try pdf-parse for comprehensive text extraction
          const pdfData = await pdf(Buffer.from(arrayBuffer));
          extractedText = pdfData.text;
          console.log(`PDF text extracted via pdf-parse: ${extractedText.length} characters`);
        } catch (pdfParseError) {
          console.log('pdf-parse failed, falling back to pdf-lib:', pdfParseError);
          
          // Fallback to pdf-lib for basic document analysis
          try {
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            
            // Try to extract form fields
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            
            fields.forEach(field => {
              try {
                if (field.constructor.name === 'PDFTextField') {
                  const textField = field as any;
                  if (textField.getText) {
                    extractedText += textField.getText() + ' ';
                  }
                }
              } catch (fieldError) {
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

The analysis will proceed with available content, but results may be limited. For comprehensive legal document analysis, text-based formats are recommended.`;
            }
            
            console.log(`PDF processed via pdf-lib: ${extractedText.length} characters`);
          } catch (pdfLibError) {
            console.error('Both pdf-parse and pdf-lib failed:', pdfLibError);
            throw new Error('Unable to process PDF file. Please ensure the file is not corrupted or try converting to text format.');
          }
        }
        
        documentText = extractedText;
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        // Handle text files
        documentText = await file.text();
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload TXT, PDF, or MD files.' },
          { status: 400 }
        );
      }
    } catch (extractionError) {
      console.error('File extraction error:', extractionError);
      return NextResponse.json(
        { error: 'Failed to extract text from file. Please ensure the file is not corrupted and try again.' },
        { status: 400 }
      );
    }

    // Validate extracted text
    if (!documentText || documentText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Document too short or empty. Please provide a document with at least 100 characters.' },
        { status: 400 }
      );
    }

    // Clean up the text
    documentText = documentText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    console.log(`Processing document: ${file.name} (${documentText.length} characters)`);

    // Initialize the T&C Insight Agent
    const agent = new TCInsightAgent();
    
    try {
      await agent.initialize();
      console.log('Agent initialized successfully');
    } catch (initError) {
      console.error('Agent initialization error:', initError);
      return NextResponse.json(
        { error: 'Failed to initialize AI analysis service. Please check your 0G network configuration and try again.' },
        { status: 500 }
      );
    }

    // Analyze the document
    try {
      const analysisResult = await agent.analyzeDocument(documentText, file.name);
      console.log('Analysis completed successfully');
      
      // Check remaining balance
      const balance = await agent.checkBalance();
      console.log(`Remaining balance: ${balance} OG`);

      return NextResponse.json(analysisResult);
    } catch (analysisError) {
      console.error('Document analysis error:', analysisError);
      return NextResponse.json(
        { error: 'Analysis failed. This could be due to network issues, insufficient balance, or 0G network connectivity. Please try again.' },
        { status: 500 }
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

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
