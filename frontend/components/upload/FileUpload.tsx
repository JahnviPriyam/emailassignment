"use client";

import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from '../ui/Badge';

export interface FileUploadProps {
  onEmailsExtracted: (emails: string[]) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onEmailsExtracted, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rawEmails, setRawEmails] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractEmailsFromText = (text: string): string[] => {
    // Regex for matching standard email formats
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    // Deduplicate and clean
    const uniqueEmails = Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
    return uniqueEmails;
  };

  const processFile = useCallback((file: File) => {
    setParseError(null);
    setEmailCount(null);
    setRawEmails([]);
    setFileName(file.name);
    
    const sizeKb = (file.size / 1024).toFixed(1);
    setFileSize(`${sizeKb} KB`);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'csv' && fileExtension !== 'txt') {
      setParseError('Unsupported file type. Please upload a .csv or .txt file.');
      onEmailsExtracted([]);
      return;
    }

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          // Convert all CSV cells into a single string to extract any email addresses in any column
          const allText = JSON.stringify(results.data);
          const validEmails = extractEmailsFromText(allText);

          if (validEmails.length === 0) {
            setParseError('No valid email addresses found in the uploaded CSV file.');
            onEmailsExtracted([]);
          } else {
            setEmailCount(validEmails.length);
            setRawEmails(validEmails);
            onEmailsExtracted(validEmails);
          }
        },
        error: (err) => {
          setParseError(`CSV Parsing error: ${err.message}`);
          onEmailsExtracted([]);
        },
      });
    } else {
      // Text file processing
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        const validEmails = extractEmailsFromText(text);

        if (validEmails.length === 0) {
          setParseError('No valid email addresses found in the uploaded text file.');
          onEmailsExtracted([]);
        } else {
          setEmailCount(validEmails.length);
          setRawEmails(validEmails);
          onEmailsExtracted(validEmails);
        }
      };
      reader.onerror = () => {
        setParseError('Failed to read file.');
        onEmailsExtracted([]);
      };
      reader.readAsText(file);
    }
  }, [onEmailsExtracted]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleClear = () => {
    setFileName(null);
    setFileSize(null);
    setEmailCount(null);
    setParseError(null);
    setRawEmails([]);
    setShowPreview(false);
    onEmailsExtracted([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800 select-none flex items-center justify-between">
        <span>Recipient List (CSV or TXT)</span>
        {emailCount !== null && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-pastel-blue-dark hover:underline font-bold"
          >
            {showPreview ? 'Hide Preview' : 'View Extracted Emails'}
          </button>
        )}
      </label>

      {!fileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none text-center bg-white/70",
            isDragging
              ? "border-pastel-pink bg-pastel-pink-bg scale-[1.01]"
              : error || parseError
              ? "border-rose-400 bg-rose-50/30"
              : "border-slate-200 hover:border-pastel-blue hover:bg-pastel-blue-light/20"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-pastel-blue-light text-slate-800 flex items-center justify-center mb-3 shadow-soft-sm">
            <UploadCloud className="w-6 h-6 text-pastel-blue-dark" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports CSV and TXT files with email addresses in any column</p>
        </div>
      ) : (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-soft-sm flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-pastel-pink-bg text-pastel-pink-dark flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{fileName}</p>
                <p className="text-xs text-slate-400">{fileSize}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {emailCount !== null && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pastel-pink-bg to-pastel-blue-light/50 border border-pastel-pink/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pastel-pink-dark shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {emailCount} valid email address{emailCount === 1 ? '' : 'es'} detected
                </span>
              </div>
              <Badge status="scheduled" size="sm">Ready to Schedule</Badge>
            </div>
          )}

          {parseError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>
      )}

      {showPreview && rawEmails.length > 0 && (
        <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs max-h-40 overflow-y-auto font-mono space-y-1">
          <p className="text-slate-400 font-sans font-semibold mb-1 border-b border-slate-800 pb-1">
            Preview of detected recipients ({rawEmails.length}):
          </p>
          {rawEmails.slice(0, 50).map((email, i) => (
            <div key={i} className="truncate">
              {i + 1}. {email}
            </div>
          ))}
          {rawEmails.length > 50 && (
            <div className="text-pastel-pink font-sans font-bold pt-1">
              + {rawEmails.length - 50} more emails...
            </div>
          )}
        </div>
      )}

      {(error || parseError) && (
        <span className="text-xs font-medium text-rose-500">{error || parseError}</span>
      )}
    </div>
  );
};
