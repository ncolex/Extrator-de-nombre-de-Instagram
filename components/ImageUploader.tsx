import React, { useState, useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onProcess: (files: File[]) => void;
  isLoading: boolean;
}

const MAX_FILES = 20;

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onProcess, isLoading }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // FIX: Added filtering to ensure only image files are selected, for consistency with drag-and-drop.
      // Also added explicit type to prevent potential type inference issues.
      const selectedFiles = Array.from(event.target.files)
        .filter((file: File) => file.type.startsWith('image/'))
        .slice(0, MAX_FILES);
      setFiles(selectedFiles);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      // FIX: Add explicit type annotation `(file: File)` to resolve error "Property 'type' does not exist on type 'unknown'".
      const selectedFiles = Array.from(event.dataTransfer.files)
        .filter((file: File) => file.type.startsWith('image/'))
        .slice(0, MAX_FILES);
      setFiles(selectedFiles);
    }
  }, []);

  const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragging(true);
    } else if (event.type === 'dragleave') {
      setIsDragging(false);
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleProcessClick = () => {
    onProcess(files);
  };
  
  const clearFiles = () => {
    setFiles([]);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl text-center transition-all duration-300">
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEvents}
        onDragOver={handleDragEvents}
        onDragLeave={handleDragEvents}
        className={`p-8 rounded-lg transition-colors duration-300 ${isDragging ? 'bg-slate-700' : 'bg-transparent'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p className="text-slate-400">
            Drag & drop images here, or{' '}
            <button
              onClick={handleBrowseClick}
              disabled={isLoading}
              className="font-semibold text-teal-400 hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 rounded"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-slate-500 mt-2">Up to {MAX_FILES} images (PNG, JPG, etc.)</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 text-left">Selected Files: {files.length}</h3>
          <div className="max-h-40 overflow-y-auto pr-2">
              <ul className="text-sm text-left space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                    <span className="truncate text-slate-400">{file.name}</span>
                    <span className="text-slate-500 text-xs flex-shrink-0 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleProcessClick}
              disabled={isLoading}
              className="w-full sm:w-auto flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : `Find Usernames`}
            </button>
            <button
              onClick={clearFiles}
              disabled={isLoading}
              className="w-full sm:w-auto flex-1 inline-flex justify-center items-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 disabled:opacity-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
