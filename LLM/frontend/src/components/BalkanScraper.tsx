import React, { useState } from 'react';
import './BalkanScraper.css';

interface ScrapeStats {
  totalScraped: number;
  inserted: number;
  updated: number;
  chartWeek: string;
  duration: string;
}

interface BalkanScraperProps {
  onScrapeComplete?: () => void;
}

/**
 * Balkan Top 100 Scraper komponenta
 * Gumb za scraping in shranjevanje v bazo
 */
const BalkanScraper: React.FC<BalkanScraperProps> = ({ onScrapeComplete }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStats, setScrapeStats] = useState<ScrapeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Scrape Balkan Top 100
   */
  const handleScrape = async () => {
    if (isScraping) return;

    setIsScraping(true);
    setError(null);
    setScrapeStats(null);

    try {
      console.log('🎵 Začenjam scraping Balkan Top 100...');

      const response = await fetch('http://localhost:3001/api/balkan/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Napaka pri scraping-u');
      }

      const data = await response.json();
      setScrapeStats(data.stats);

      console.log('✅ Scraping uspešen:', data.stats);

      // Callback
      if (onScrapeComplete) {
        onScrapeComplete();
      }
    } catch (err: any) {
      console.error('❌ Scraping napaka:', err);
      setError(err.message);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="balkan-scraper">
      <div className="scraper-header">
        <h3>🏆 Balkan Top 100</h3>
        <p className="scraper-subtitle">
          Pridobi trenutne top pesmi z balkantop100.com in shrani v bazo
        </p>
      </div>

      {/* Scrape button */}
      <button
        onClick={handleScrape}
        disabled={isScraping}
        className="scrape-button"
      >
        {isScraping ? (
          <>
            <span className="spinner-small"></span>
            Scraping...
          </>
        ) : (
          <>
            <span className="scrape-icon">🎭</span>
            Pridobi Pesmi
          </>
        )}
      </button>

      {/* Stats */}
      {scrapeStats && (
        <div className="scrape-stats success">
          <h4>✅ Scraping Uspešen!</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Scrape-ano:</span>
              <span className="stat-value">{scrapeStats.totalScraped}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Novih:</span>
              <span className="stat-value">{scrapeStats.inserted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posodobljenih:</span>
              <span className="stat-value">{scrapeStats.updated}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trajanje:</span>
              <span className="stat-value">{scrapeStats.duration}</span>
            </div>
          </div>
          <p className="stats-week">
            Chart teden: {scrapeStats.chartWeek}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="scrape-stats error">
          <h4>❌ Napaka</h4>
          <p>{error}</p>
          <p className="error-hint">
            Preveri če je backend zagnan in Playwright instaliran
          </p>
        </div>
      )}

      {/* Info */}
      <div className="scraper-info">
        <p>
          💡 <strong>Info:</strong> Scraping lahko traja 10-30 sekund, odvisno
          od hitrosti povezave.
        </p>
        <p>
          Pesmi bodo shranjene v MongoDB collection{' '}
          <code>balkantracks</code>.
        </p>
      </div>
    </div>
  );
};

export default BalkanScraper;