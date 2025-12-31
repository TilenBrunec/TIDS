import React, { useState } from 'react';
import { Alternative, TreeNode } from '../../types';
import { getAllLeaves } from '../../utils/mautCalculations';
import './AlternativesTable.css';

interface Props {
  alternatives: Alternative[];
  rootNode: TreeNode;
  onUpdateAlternatives: (alternatives: Alternative[]) => void;
}

export const AlternativesTable: React.FC<Props> = ({
  alternatives,
  rootNode,
  onUpdateAlternatives,
}) => {
  const [newAltName, setNewAltName] = useState('');
  const leaves = getAllLeaves(rootNode);

  const addAlternative = () => {
    if (!newAltName.trim()) return;

    const newAlt: Alternative = {
      id: `alt-${Date.now()}`,
      name: newAltName,
      values: {},
    };

    leaves.forEach((leaf) => {
      newAlt.values[leaf.id] = 0.5;
    });

    onUpdateAlternatives([...alternatives, newAlt]);
    setNewAltName('');
  };

  const updateValue = (altId: string, leafId: string, value: number) => {
    const updated = alternatives.map((alt) => {
      if (alt.id === altId) {
        return {
          ...alt,
          values: { ...alt.values, [leafId]: value },
        };
      }
      return alt;
    });
    onUpdateAlternatives(updated);
  };

  const deleteAlternative = (altId: string) => {
    onUpdateAlternatives(alternatives.filter((alt) => alt.id !== altId));
  };

  if (leaves.length === 0) {
    return (
      <div className="alternatives-table">
        <h2>Alternative</h2>
        <p className="warning">Najprej dodaj liste v drevo!</p>
      </div>
    );
  }

  return (
    <div className="alternatives-table">
      <h2>Alternative</h2>

      <div className="add-alternative">
        <input
          type="text"
          value={newAltName}
          onChange={(e) => setNewAltName(e.target.value)}
          placeholder="Ime nove alternative"
          className="alt-name-input"
        />
        <button onClick={addAlternative} className="add-alt-btn">
          Dodaj Alternativo
        </button>
      </div>

      {alternatives.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Alternativa</th>
              {leaves.map((leaf) => (
                <th key={leaf.id}>{leaf.name}</th>
              ))}
              <th>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {alternatives.map((alt) => (
              <tr key={alt.id}>
                <td className="alt-name">{alt.name}</td>
                {leaves.map((leaf) => (
                  <td key={leaf.id}>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={alt.values[leaf.id] || 0}
                      onChange={(e) =>
                        updateValue(alt.id, leaf.id, parseFloat(e.target.value) || 0)
                      }
                      className="value-input"
                    />
                  </td>
                ))}
                <td>
                  <button
                    onClick={() => deleteAlternative(alt.id)}
                    className="delete-alt-btn"
                  >
                    Izbriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};