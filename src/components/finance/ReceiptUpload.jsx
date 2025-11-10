import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceiptUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image (JPG, PNG, GIF) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(response.file_url);
      
      if (onUploadComplete) {
        onUploadComplete(response.file_url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setUploadedUrl(null);
    setError(null);
  };

  return (
    <Card className="p-4 rounded-[16px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Receipt/Document</label>
          {uploadedUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearUpload}
              className="h-6 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!uploadedUrl ? (
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-[12px] cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="hidden"
                disabled={uploading}
              />
              
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-gray-700">Uploading...</p>
                  <p className="text-xs text-gray-500">Please wait</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Click to upload receipt
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF or PDF (max 5MB)
                  </p>
                </>
              )}
            </motion.label>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-green-50 border border-green-200 rounded-[12px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">Receipt uploaded</p>
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    <FileText className="w-3 h-3" />
                    View receipt
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-[10px]"
          >
            <p className="text-xs text-red-700">{error}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}