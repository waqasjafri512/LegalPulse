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
  RefreshCw
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
          // Remove code from URL
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
        prev.map((f) => (f.id === fileObj.id ? { 
          ...f, 
          status: 'complete', 
          isDuplicate: response.data.is_duplicate 
        } : f))
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
    const completed = files.filter(f => f.status === 'complete').length;
    const duplicates = files.filter(f => f.isDuplicate).length;

    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ 
          width: 80, height: 80, borderRadius: '50%', background: 'var(--color-success-subtle)', 
          color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
        }}>
          <CheckCircle size={40} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Upload Complete
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          {completed} documents have been successfully queued for AI processing.
          {duplicates > 0 && ` ${duplicates} documents were identified as duplicates and skipped.`}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setFiles([]); setIsSuccess(false); }}>
            <RefreshCw size={16} /> Upload More
          </button>
          <Link to="/contracts" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Go to Repository <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Upload Contracts
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Drag and drop files or import from cloud storage. AI will automatically extract key terms.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div
          {...getRootProps()}
          style={{
            gridColumn: '1 / -1',
            padding: '48px 40px',
            borderRadius: 'var(--radius-lg)',
            border: `2px dashed ${isDragActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: isDragActive ? 'var(--color-accent-subtle)' : 'var(--color-bg-card)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'var(--color-bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Upload size={24} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            {isDragActive ? 'Drop files here' : 'Drag & drop contract files'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Supports PDF and DOCX — up to 50MB each
          </p>
          <button className="btn btn-primary" style={{ pointerEvents: 'none' }}>Browse Files</button>
        </div>

        <button 
          className="glass-card" 
          onClick={handleGoogleDriveConnect}
          style={{ 
            padding: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 14, 
            cursor: 'pointer',
            background: googleDriveToken ? 'var(--color-success-subtle)' : 'var(--color-bg-card)',
            borderColor: googleDriveToken ? 'var(--color-success)' : 'var(--color-border)',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(66,133,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cloud size={20} style={{ color: '#4285F4' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {googleDriveToken ? 'Google Drive Connected' : 'Google Drive'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              {googleDriveToken ? 'Ready to browse files' : 'Import from connected Drive'}
            </div>
          </div>
        </button>

        <button className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14, cursor: 'not-allowed', opacity: 0.7 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(0,126,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={20} style={{ color: '#007ee5' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Dropbox</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Coming Soon</div>
          </div>
        </button>
      </div>

      {files.length > 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Queue ({files.length} files)
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setFiles([])} disabled={isUploading}>Clear</button>
              <button className="btn btn-primary" onClick={startUploads} disabled={isUploading || !files.some(f => f.status === 'queued')}>
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploading ? 'Uploading...' : 'Process All'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {files.map((f) => (
              <div key={f.id} style={{ padding: 12, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={18} style={{ color: 'var(--color-accent)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{formatSize(f.file.size)}</div>
                  </div>
                  {f.status === 'complete' && <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />}
                  {f.status === 'error' && <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />}
                  {f.status === 'uploading' && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-accent)' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
