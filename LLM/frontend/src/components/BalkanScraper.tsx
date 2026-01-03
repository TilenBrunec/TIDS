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
 * Balkan Top 100 Scraper komponenta - Collapsible verzija
 * Gumb za scraping in shranjevanje v bazo
 */
const BalkanScraper: React.FC<BalkanScraperProps> = ({ onScrapeComplete }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStats, setScrapeStats] = useState<ScrapeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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
      {/* Header - Clickable za collapse */}
      <div 
        className="scraper-header-collapsible"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-title">
          <h3>🏆 Scrape Balkan Top 100</h3>
          <span className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {!isExpanded && scrapeStats && (
          <p className="header-summary">
            ✅ {scrapeStats.totalScraped} pesmi
          </p>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="scraper-content">
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

          {/* Stats - Kompaktno */}
          {scrapeStats && (
            <div className="scrape-stats-compact success">
              <div className="stats-row">
                <div className="stat-compact">
                  <span className="stat-label-compact">Scrape-ano:</span>
                  <span className="stat-value-compact">{scrapeStats.totalScraped}</span>
                </div>
                <div className="stat-compact">
                  <span className="stat-label-compact">Novih:</span>
                  <span className="stat-value-compact">{scrapeStats.inserted}</span>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-compact">
                  <span className="stat-label-compact">Posodobljenih:</span>
                  <span className="stat-value-compact">{scrapeStats.updated}</span>
                </div>
                <div className="stat-compact">
                  <span className="stat-label-compact">Čas:</span>
                  <span className="stat-value-compact">{scrapeStats.duration}</span>
                </div>
              </div>
              <p className="stats-week-compact">
                {scrapeStats.chartWeek}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="scrape-stats-compact error">
              <p className="error-message">❌ {error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalkanScraper;