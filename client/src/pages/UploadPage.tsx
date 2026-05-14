import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Cloud,
  HardDrive,
  Loader2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface UploadFile {
  file: File;
  id: string;
  status: 'queued' | 'uploading' | 'complete' | 'error';
  progress: number;
  isDuplicate?: boolean;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [googleDriveToken, setGoogleDriveToken] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState('Contract');

  const handleGoogleDriveConnect = async () => {
    try {
      const { data } = await api.get('/integrations/google-drive/auth-url');
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to connect to Google Drive');
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      const fetchTokens = async () => {
        try {
          const { data } = await api.post('/integrations/google-drive/tokens', { code });
          setGoogleDriveToken(data.access_token);
          window.history.replaceState({}, document.title, window.location.pathname);
          toast.success('Google Drive connected!');
        } catch (error) {
          toast.error('Failed to authenticate with Google Drive');
        }
      };
      fetchTokens();
    }
  }, []);

  const uploadFile = async (fileObj: UploadFile) => {
    const formData = new FormData();
    formData.append('file', fileObj.file);
    formData.append('document_type', documentType);

    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: 'uploading' } : f))
      );

      const response = await api.post('/contracts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setFiles((prev) =>
            prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f))
          );
        },
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, status: 'complete', isDuplicate: response.data.is_duplicate }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: 'error' } : f))
      );
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'queued' as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setIsSuccess(false);
  }, []);

  const startUploads = async () => {
    setIsUploading(true);
    const queuedFiles = files.filter((f) => f.status === 'queued');
    await Promise.all(queuedFiles.map((f) => uploadFile(f)));
    setIsUploading(false);
    setIsSuccess(true);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isSuccess && !isUploading) {
    const completed = files.filter((f) => f.status === 'complete').length;
    const duplicates = files.filter((f) => f.isDuplicate).length;

    return (
      <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center' }} className="animate-fade-in">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: 'rgba(52,211,153,0.1)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 0 40px rgba(52,211,153,0.15)',
          }}
        >
          <CheckCircle size={36} />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 10,
            letterSpacing: '-0.02em',
          }}
        >
          Upload Complete
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-tertiary)', marginBottom: 36, lineHeight: 1.6 }}>
          {completed} documents queued for AI processing.
          {duplicates > 0 && ` ${duplicates} duplicates skipped.`}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFiles([]);
              setIsSuccess(false);
            }}
          >
            <RefreshCw size={14} /> Upload More
          </button>
          <Link
            to={documentType === 'Contract' ? "/contracts" : "/matters"}
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Go to {documentType === 'Contract' ? "Repository" : "Matters"} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Upload size={14} style={{ color: 'var(--color-accent)' }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Ingest
          </span>
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}
        >
          Upload {documentType === 'Contract' ? 'Contracts' : 'Matter Documents'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginBottom: 20 }}>
          Drag and drop files or import from cloud storage. AI extracts key details automatically.
        </p>
        
        {/* Document Type Selector */}
        <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.03)', padding: 4, borderRadius: 10, border: '1px solid var(--color-border-subtle)' }}>
          <button 
            type="button"
            onClick={() => setDocumentType('Contract')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: documentType === 'Contract' ? 'var(--color-accent)' : 'transparent',
              color: documentType === 'Contract' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Contract
          </button>
          <button 
            type="button"
            onClick={() => setDocumentType('Matter Document')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: documentType === 'Matter Document' ? 'var(--color-accent)' : 'transparent',
              color: documentType === 'Matter Document' ? 'white' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Matter Document
          </button>
        </div>
      </div>

      {/* Upload area & integrations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            gridColumn: '1 / -1',
            padding: '52px 40px',
            borderRadius: 14,
            border: `2px dashed ${isDragActive ? 'var(--color-accent)' : 'var(--color-border-card)'}`,
            background: isDragActive ? 'rgba(129,140,248,0.04)' : 'rgba(16,20,28,0.4)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <input {...getInputProps()} />

          {/* Top decorative line */}
          {isDragActive && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
              }}
            />
          )}

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: isDragActive ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.03)',
              color: isDragActive ? 'white' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              transition: 'all 0.3s ease',
              transform: isDragActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
              boxShadow: isDragActive ? '0 12px 24px rgba(129,140,248,0.25)' : 'none',
            }}
          >
            <Upload size={24} />
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 6,
            }}
          >
            {isDragActive ? 'Drop files here' : `Drag & drop ${documentType === 'Contract' ? 'contract' : 'matter'} files`}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Supports PDF and DOCX — up to 50MB each
          </p>
          <button className="btn btn-accent" style={{ pointerEvents: 'none' }}>
            <Sparkles size={13} /> Browse Files
          </button>
        </div>

        {/* Google Drive */}
        <button
          className="glass-card"
          onClick={handleGoogleDriveConnect}
          style={{
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            background: googleDriveToken ? 'rgba(52,211,153,0.04)' : 'rgba(16,20,28,0.4)',
            borderColor: googleDriveToken ? 'rgba(52,211,153,0.15)' : 'var(--color-border-card)',
            textAlign: 'left',
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(66,133,244,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Cloud size={20} style={{ color: '#4285F4' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {googleDriveToken ? 'Google Drive Connected' : 'Google Drive'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {googleDriveToken ? 'Ready to browse files' : 'Import from connected Drive'}
            </div>
          </div>
        </button>

        {/* Dropbox */}
        <button
          className="glass-card"
          style={{
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'not-allowed',
            opacity: 0.5,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(0,126,229,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HardDrive size={20} style={{ color: '#007ee5' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Dropbox
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Coming Soon</div>
          </div>
        </button>
      </div>

      {/* File Queue */}
      {files.length > 0 && (
        <div className="glass-card animate-fade-in" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Queue
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {files.length} files
              </span>
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setFiles([])} disabled={isUploading} style={{ fontSize: 12.5 }}>
                Clear
              </button>
              <button
                className="btn btn-primary"
                onClick={startUploads}
                disabled={isUploading || !files.some((f) => f.status === 'queued')}
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {isUploading ? 'Processing...' : 'Process All'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {files.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.015)',
                  borderRadius: 10,
                  border: '1px solid var(--color-border-subtle)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Progress bar */}
                {f.status === 'uploading' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: 2,
                      width: `${f.progress}%`,
                      background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                      borderRadius: 2,
                      transition: 'width 0.3s',
                    }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: f.status === 'complete' ? 'rgba(52,211,153,0.08)' : f.status === 'error' ? 'rgba(248,113,113,0.08)' : 'rgba(129,140,248,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText
                      size={16}
                      style={{
                        color: f.status === 'complete' ? '#34d399' : f.status === 'error' ? '#f87171' : 'var(--color-accent)',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {f.file.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatSize(f.file.size)}</div>
                  </div>
                  {f.status === 'complete' && <CheckCircle size={16} style={{ color: '#34d399' }} />}
                  {f.status === 'error' && <AlertCircle size={16} style={{ color: '#f87171' }} />}
                  {f.status === 'uploading' && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-accent)' }} />}
                  {f.status === 'queued' && (
                    <button
                      onClick={() => removeFile(f.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        borderRadius: 6,
                      }}
                    >
                      <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
