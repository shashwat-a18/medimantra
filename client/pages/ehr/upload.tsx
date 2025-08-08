import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  ocrText?: string;
  category?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DocumentUpload() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated, loading, router]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUploadedDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a supported file type`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('category', 'medical'); // Default category

        const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            }
          }
        });

        // Remove uploaded file from selected files
        setSelectedFiles(prev => prev.filter(f => f.name !== file.name));
        
        // Reset progress for this file
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });

      } catch (err: any) {
        setError(`Failed to upload ${file.name}: ${err.response?.data?.error || err.message}`);
      }
    }

    setUploading(false);
    
    // Refresh documents list
    await fetchDocuments();
  };

  const deleteDocument = async (documentId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      setError(`Failed to delete document: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Document Upload</h1>
        <p className="text-slate-300 mt-2">
          Upload and manage your medical documents securely
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Medical Documents</h2>
            
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-500 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </h3>
              <p className="text-gray-400 mb-4">
                or click to browse files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
                disabled={uploading}
              >
                Choose Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Selected Files</h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {file.type === 'application/pdf' ? '📄' : '🖼️'}
                        </span>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadProgress[file.name] && (
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            ></div>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={uploading}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={uploadFiles}
                  disabled={uploading || selectedFiles.length === 0}
                  className="btn-primary w-full mt-4"
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* File Type Info */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Supported File Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <span className="text-gray-300">PDF Documents</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🖼️</span>
                  <span className="text-gray-300">Images (JPG, PNG)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <span className="text-gray-300">Lab Reports</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Maximum file size: 10MB per file</p>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
            
            {uploadedDocuments.length > 0 ? (
              <div className="space-y-4">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {doc.fileType === 'application/pdf' ? '📄' : '🖼️'}
                        </span>
                        <div>
                          <h3 className="font-medium">{doc.fileName}</h3>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(doc.fileSize)} • {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                          {doc.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                              {doc.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                        <button 
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {doc.ocrText && (
                      <div className="mt-3 p-3 bg-slate-800/30 rounded">
                        <h4 className="text-sm font-medium mb-1">Extracted Text:</h4>
                        <p className="text-sm text-gray-300 truncate">{doc.ocrText.substring(0, 200)}...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload your first medical document to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Creator Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Created by{' '}
            <a href="https://www.linkedin.com/in/shashwat-awasthi18/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              Shashwat Awasthi
            </a>
            {' • '}
            <a href="https://github.com/shashwat-a18" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              GitHub
            </a>
          </p>
        </div>
    </DashboardLayout>
  );
}
