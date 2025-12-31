import React from 'react';
import { CalculationResult } from '../../types';
import './ResultsTable.css';

interface Props {
  results: CalculationResult[];
}

export const ResultsTable: React.FC<Props> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  const sortedResults = [...results].sort((a, b) => b.totalValue - a.totalValue);
  const winner = sortedResults[0];

  return (
    <div className="results-table">
      <h2>Rezultati MAUT Analize</h2>
      <table>
        <thead>
          <tr>
            <th>Rang</th>
            <th>Alternativa</th>
            <th>Končna Vrednost</th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result, index) => (
            <tr
              key={result.alternativeId}
              className={result.alternativeId === winner.alternativeId ? 'winner' : ''}
            >
              <td>{index + 1}</td>
              <td>
                {result.alternativeName}
                {result.alternativeId === winner.alternativeId && (
                  <span className="winner-badge">🏆 Zmagovalec</span>
                )}
              </td>
              <td>{result.totalValue.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};