'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ComplianceReport } from '@/lib/tc-analyzer';
import { NicheId } from '@/lib/niches';
import { useWallet } from '@/contexts/WalletContext';

interface FileUploadProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: ComplianceReport) => void;
  onAnalysisError: () => void;
  isAnalyzing: boolean;
  selectedNiche: NicheId;
}

export default function FileUpload({
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  isAnalyzing,
  selectedNiche
}: FileUploadProps) {
  const { account, isConnected } = useWallet();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a TXT, PDF, or MD file.');
      } else {
        setError('File upload failed. Please try again.');
      }
    }
  });

  const handleAnalyze = async () => {
    if (!uploadedFile || !account || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setError(null);
    onAnalysisStart();

    try {
      // Extract text from file
      let documentText = '';
      const fileName = uploadedFile.name.toLowerCase();

      if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        documentText = await uploadedFile.text();
      } else if (fileName.endsWith('.pdf')) {
        // For PDF, use the API route for extraction
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to extract text from PDF');
        }
        
        const data = await response.json();
        documentText = data.text;
      } else {
        throw new Error('Unsupported file type');
      }

      if (!documentText || documentText.trim().length < 100) {
        throw new Error('Document too short or empty. Please provide a document with at least 100 characters.');
      }

      // Clean up the text
      documentText = documentText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      console.log(`Processing document: ${uploadedFile.name} (${documentText.length} characters)`);
      console.log(`Using wallet: ${account}`);

      // Send to API for analysis with wallet address
      const response = await fetch('/api/analyze-with-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account,
          documentText,
          fileName: uploadedFile.name,
          nicheId: selectedNiche,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      console.log('Analysis completed successfully');

      onAnalysisComplete(result);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(errorMessage);
      onAnalysisError();
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
        {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploadedFile ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploadedFile ? (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type || 'Unknown type'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">
              {isDragActive ? '📥' : '📁'}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop your file here' : 'Upload your document'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop or click to select • TXT, PDF, MD files up to 10MB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                💡 <strong>Best results:</strong> Use text-based PDFs or .txt/.md files for optimal analysis
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {uploadedFile && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${isAnalyzing
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing with 0G AI...</span>
            </div>
          ) : (
            'Analyze Document'
          )}
        </button>
      )}

      {/* File Type Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong>Supported formats:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li><strong>TXT:</strong> Plain text documents</li>
          <li><strong>PDF:</strong> Portable Document Format (text will be extracted)</li>
          <li><strong>MD:</strong> Markdown documents</li>
        </ul>
      </div>
    </div>
  );
}
