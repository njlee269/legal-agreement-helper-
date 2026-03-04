'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PdfDropzone({
  onUpload,
}: {
  onUpload: (id: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.pdf')) return;

      setFileName(file.name);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.id) {
          onUpload(data.id);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer',
        isDragging
          ? 'border-black bg-gray-50 scale-[1.01]'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
      )}
    >
      <input
        type="file"
        accept=".pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
          <p className="text-sm text-gray-600">
            업로드 중... <span className="font-medium">{fileName}</span>
          </p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-3">
          <FileText className="h-10 w-10 text-black" />
          <p className="text-sm font-medium text-black">{fileName}</p>
          <p className="text-xs text-gray-500">업로드 완료</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              PDF 파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-gray-500 mt-1">
              계약서 PDF 파일만 지원됩니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
