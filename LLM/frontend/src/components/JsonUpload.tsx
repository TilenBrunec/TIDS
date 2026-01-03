import React, { useState, useRef } from 'react';
import './JsonUpload.css';

interface UploadStats {
  fileName: string;
  fileSize: string;
  totalSongs: number;
  inserted: number;
  updated: number;
  byGenre: Record<string, number>;
  byRegion: Record<string, number>;
  duration: string;
}

interface JsonUploadProps {
  onUploadComplete?: () => void;
}

/**
 * JSON File Upload komponenta - Collapsible
 * Uporabnik lahko uploada svoj JSON file
 */
const JsonUpload: React.FC<JsonUploadProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        setError('Samo JSON files (.json) so dovoljeni');
        setSelectedFile(null);
        return;
      }

      // Validate file size (10 MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File je prevelik (max 10 MB)');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError(null);
      setUploadStats(null);
      console.log('📎 File selected:', file.name);
    }
  };

  /**
   * Upload and import JSON file
   */
  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError(null);
    setUploadStats(null);

    try {
      console.log('📤 Uploading JSON file:', selectedFile.name);

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:3001/api/json-upload/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Napaka pri uploadu');
      }

      const data = await response.json();
      setUploadStats(data.stats);

      console.log('✅ Upload uspešen:', data.stats);

      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Callback
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      console.error('❌ Upload napaka:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Trigger file input click
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="json-upload">
      {/* Header - Clickable za collapse */}
      <div
        className="upload-header-collapsible"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-title">
          <h3>📁 Upload JSON</h3>
          <span className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {!isExpanded && uploadStats && (
          <p className="header-summary">✅ {uploadStats.totalSongs} pesmi</p>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="upload-content">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* File selection button */}
          <button
            onClick={handleButtonClick}
            className="select-file-button"
            disabled={isUploading}
          >
            <span className="select-icon">📎</span>
            {selectedFile ? selectedFile.name : 'Izberi JSON File'}
          </button>

          {/* Selected file info */}
          {selectedFile && (
            <div className="selected-file-info">
              <p className="file-name">📄 {selectedFile.name}</p>
              <p className="file-size">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Upload button */}
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="upload-button-json"
            >
              {isUploading ? (
                <>
                  <span className="spinner-small"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="upload-icon">📤</span>
                  Upload & Import
                </>
              )}
            </button>
          )}

          {/* Stats - Kompaktno */}
          {uploadStats && (
            <div className="upload-stats-compact success">
              <div className="stats-row">
                <div className="stat-compact">
                  <span className="stat-label-compact">Skupaj:</span>
                  <span className="stat-value-compact">
                    {uploadStats.totalSongs}
                  </span>
                </div>
                <div className="stat-compact">
                  <span className="stat-label-compact">Novih:</span>
                  <span className="stat-value-compact">
                    {uploadStats.inserted}
                  </span>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-compact">
                  <span className="stat-label-compact">Posodobljenih:</span>
                  <span className="stat-value-compact">
                    {uploadStats.updated}
                  </span>
                </div>
                <div className="stat-compact">
                  <span className="stat-label-compact">Čas:</span>
                  <span className="stat-value-compact">
                    {uploadStats.duration}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="upload-stats-compact error">
              <p className="error-message">❌ {error}</p>
            </div>
          )}

          {/* Format hint */}
          <div className="format-hint">
            <p className="hint-title">💡 JSON Format:</p>
            <code className="hint-code">
              [{'{'}
              <br />
              &nbsp;&nbsp;"title": "Song Name",
              <br />
              &nbsp;&nbsp;"artist": "Artist",
              <br />
              &nbsp;&nbsp;"genre": "Pop",
              <br />
              &nbsp;&nbsp;"region": "USA"
              <br />
              {'}'}]
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonUpload;