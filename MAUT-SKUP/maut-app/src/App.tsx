import React, { useState } from 'react';
import { TreeNode as TreeNodeType, Alternative, CalculationResult } from './types';
import { TreeNode } from './components/TreeBuilder/TreeNode';
import { AlternativesTable } from './components/AlternativesInput/AlternativesTable';
import { ResultsTable } from './components/Results/ResultsTable';
import { ResultsChart } from './components/Results/ResultsChart';
import { SaveLoadButtons } from './components/FileOperations/SaveLoadButtons';
import { calculateResults, validateWeights } from './utils/mautCalculations';
import './App.css';

function App() {
  const [rootNode, setRootNode] = useState<TreeNodeType>({
    id: 'root',
    name: 'Cilj',
    weight: 1.0,
    utilityFunction: 'linear',
    children: [],
    isLeaf: false,
  });

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const updateNodeRecursive = (
    node: TreeNodeType,
    nodeId: string,
    updates: Partial<TreeNodeType>
  ): TreeNodeType => {
    if (node.id === nodeId) {
      return { ...node, ...updates };
    }

    return {
      ...node,
      children: node.children.map((child) =>
        updateNodeRecursive(child, nodeId, updates)
      ),
    };
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<TreeNodeType>) => {
    setRootNode((prev) => updateNodeRecursive(prev, nodeId, updates));
    setErrorMessage('');
  };

  const deleteNodeRecursive = (
    node: TreeNodeType,
    nodeId: string
  ): TreeNodeType | null => {
    if (node.id === nodeId) {
      return null;
    }

    return {
      ...node,
      children: node.children
        .map((child) => deleteNodeRecursive(child, nodeId))
        .filter((child): child is TreeNodeType => child !== null),
    };
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'root') {
      alert('Ne moreš izbrisati korenskega vozlišča!');
      return;
    }

    const updated = deleteNodeRecursive(rootNode, nodeId);
    if (updated) {
      setRootNode(updated);
    }
    setErrorMessage('');
  };

  const handleAddChild = (parentId: string) => {
    const newChild: TreeNodeType = {
      id: `node-${Date.now()}`,
      name: 'Novo vozlišče',
      weight: 0.5,
      utilityFunction: 'linear',
      children: [],
      isLeaf: true,
    };

    const addChildRecursive = (node: TreeNodeType): TreeNodeType => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, newChild],
        };
      }

      return {
        ...node,
        children: node.children.map(addChildRecursive),
      };
    };

    setRootNode(addChildRecursive(rootNode));
    setErrorMessage('');
  };

  const handleCalculate = () => {
    if (!validateWeights(rootNode)) {
      setErrorMessage('Napaka: Uteži otrok vsakega vozlišča morajo sešteti na 1.0!');
      return;
    }

    if (alternatives.length === 0) {
      setErrorMessage('Dodaj vsaj eno alternativo!');
return;
}
try {
  const calculatedResults = calculateResults(rootNode, alternatives);
  setResults(calculatedResults);
  setErrorMessage('');
} catch (error) {
  setErrorMessage('Napaka pri izračunu: ' + error);
}
};
const handleLoad = (data: { tree: TreeNodeType; alternatives: Alternative[] }) => {
setRootNode(data.tree);
setAlternatives(data.alternatives);
setResults([]);
setErrorMessage('');
};
return (
<div className="app">
<header className="app-header">
<h1>🎯 MAUT Aplikacija za Večkriterijsko Odločanje</h1>
<p>Multi-Attribute Utility Theory - Interaktivni Kalkulator</p>
</header>
  <SaveLoadButtons
    data={{ tree: rootNode, alternatives }}
    onLoad={handleLoad}
  />

  <section className="tree-section">
    <h2>📊 Gradnja Hierarhičnega Drevesa</h2>
    <div className="tree-container">
      <TreeNode
        node={rootNode}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onAddChild={handleAddChild}
      />
    </div>
  </section>

  <section className="alternatives-section">
    <AlternativesTable
      alternatives={alternatives}
      rootNode={rootNode}
      onUpdateAlternatives={setAlternatives}
    />
  </section>

  <section className="calculate-section">
    <button onClick={handleCalculate} className="calculate-btn">
      🧮 Izračunaj Rezultate
    </button>
    {errorMessage && <div className="error-message">{errorMessage}</div>}
  </section>

  {results.length > 0 && (
    <section className="results-section">
      <ResultsTable results={results} />
      <ResultsChart results={results} />
    </section>
  )}
</div>
);
}
export default App;