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
 * Songs XML Import komponenta
 * Gumb za import pesmi iz XML files v bazo
 */
const SongsXmlImport: React.FC<SongsXmlImportProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <div className="import-header">
        <h3>📁 XML Songs Import</h3>
        <p className="import-subtitle">
          Importiraj pesmi iz XML datotek v MongoDB bazo
        </p>
      </div>

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
            Importiraj XML Pesmi
          </>
        )}
      </button>

      {/* Stats */}
      {importStats && (
        <div className="import-stats success">
          <h4>✅ Import Uspešen!</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Skupaj pesmi:</span>
              <span className="stat-value">{importStats.totalSongs}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Novih:</span>
              <span className="stat-value">{importStats.inserted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posodobljenih:</span>
              <span className="stat-value">{importStats.updated}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trajanje:</span>
              <span className="stat-value">{importStats.duration}</span>
            </div>
          </div>

          {/* By Region */}
          <div className="region-stats">
            <h5>Po regijah:</h5>
            <div className="region-grid">
              {Object.entries(importStats.byRegion).map(([region, count]) => (
                <div key={region} className="region-item">
                  <span className="region-name">{region}:</span>
                  <span className="region-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="stats-genres">
            Žanrov: {importStats.byGenre}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="import-stats error">
          <h4>❌ Napaka</h4>
          <p>{error}</p>
          <p className="error-hint">
            Preveri če so XML files v backend/data directory
          </p>
        </div>
      )}

      {/* Info */}
      <div className="import-info">
        <p>
          💡 <strong>Info:</strong> XML files morajo biti v{' '}
          <code>backend/data/</code> directory.
        </p>
        <p>
          Pesmi bodo shranjene v MongoDB collection <code>songs</code>.
        </p>
      </div>
    </div>
  );
};

export default SongsXmlImport;