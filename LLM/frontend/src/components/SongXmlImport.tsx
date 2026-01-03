import React, { useState } from 'react';
import './SongXmlImport.css';

interface ImportStats {
  totalSongs: number;
  inserted: number;
  updated: number;
  byRegion: Record<string, number>;
  byGenre: number;
  duration: string;
}

interface SongsXmlImportProps {
  onImportComplete?: () => void;
}

/**
 * Songs XML Import komponenta - Collapsible verzija
 * Gumb za import pesmi iz XML files v bazo
 */
const SongsXmlImport: React.FC<SongsXmlImportProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Import pesmi iz XML
   */
  const handleImport = async () => {
    if (isImporting) return;

    setIsImporting(true);
    setError(null);
    setImportStats(null);

    try {
      console.log('🎵 Začenjam XML import...');

      const response = await fetch('http://localhost:3001/api/songs-xml/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Napaka pri XML importu');
      }

      const data = await response.json();
      setImportStats(data.stats);

      console.log('✅ XML import uspešen:', data.stats);

      // Callback
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      console.error('❌ XML import napaka:', err);
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="songs-xml-import">
      {/* Header - Clickable za collapse */}
      <div 
        className="import-header-collapsible"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-title">
          <h3>📁 XML Songs</h3>
          <span className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {!isExpanded && importStats && (
          <p className="header-summary">
            ✅ {importStats.totalSongs} pesmi
          </p>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="import-content">
          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="import-button"
          >
            {isImporting ? (
              <>
                <span className="spinner-small"></span>
                Importing...
              </>
            ) : (
              <>
                <span className="import-icon">📂</span>
                Importiraj Pesmi
              </>
            )}
          </button>

          {/* Stats - Kompaktno */}
          {importStats && (
            <div className="import-stats-compact success">
              <div className="stats-row">
                <div className="stat-compact">
                  <span className="stat-label-compact">Skupaj:</span>
                  <span className="stat-value-compact">{importStats.totalSongs}</span>
                </div>
                <div className="stat-compact">
                  <span className="stat-label-compact">Novih:</span>
                  <span className="stat-value-compact">{importStats.inserted}</span>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-compact">
                  <span className="stat-label-compact">Posodobljenih:</span>
                  <span className="stat-value-compact">{importStats.updated}</span>
                </div>
                <div className="stat-compact">
                  <span className="stat-label-compact">Čas:</span>
                  <span className="stat-value-compact">{importStats.duration}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="import-stats-compact error">
              <p className="error-message">❌ {error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SongsXmlImport;