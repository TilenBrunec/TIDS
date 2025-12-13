import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import './App.css';

const KepnerTregoeApp = () => {
  const [parameters, setParameters] = useState([
    { id: 1, name: 'Parameter 1', weight: 5 }
  ]);
  const [alternatives, setAlternatives] = useState([
    { id: 1, name: 'Alternativa 1', values: [5] }
  ]);
  const [selectedParam, setSelectedParam] = useState(null);
  const [showSensitivity, setShowSensitivity] = useState(false);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  const addParameter = () => {
    const newId = Math.max(0, ...parameters.map(p => p.id)) + 1;
    setParameters([...parameters, { id: newId, name: `Parameter ${newId}`, weight: 5 }]);
    setAlternatives(alternatives.map(alt => ({
      ...alt,
      values: [...alt.values, 5]
    })));
  };

  const removeParameter = (id) => {
    if (parameters.length <= 1) return;
    const index = parameters.findIndex(p => p.id === id);
    setParameters(parameters.filter(p => p.id !== id));
    setAlternatives(alternatives.map(alt => ({
      ...alt,
      values: alt.values.filter((_, i) => i !== index)
    })));
    if (selectedParam === id) setSelectedParam(null);
  };

  const updateParameter = (id, field, value) => {
    setParameters(parameters.map(p =>
      p.id === id ? { ...p, [field]: field === 'weight' ? Math.min(10, Math.max(0, Number(value) || 0)) : value } : p
    ));
  };

  const addAlternative = () => {
    const newId = Math.max(0, ...alternatives.map(a => a.id)) + 1;
    setAlternatives([...alternatives, {
      id: newId,
      name: `Alternativa ${newId}`,
      values: parameters.map(() => 5)
    }]);
  };

  const removeAlternative = (id) => {
    if (alternatives.length <= 1) return;
    setAlternatives(alternatives.filter(a => a.id !== id));
  };

  const updateAlternative = (id, field, value, index = null) => {
    setAlternatives(alternatives.map(alt => {
      if (alt.id !== id) return alt;
      if (field === 'name') return { ...alt, name: value };
      if (field === 'value') {
        const newValues = [...alt.values];
        newValues[index] = Math.min(10, Math.max(0, Number(value) || 0));
        return { ...alt, values: newValues };
      }
      return alt;
    }));
  };

  const calculateKTScore = (altValues, weights = parameters.map(p => p.weight)) => {
    return altValues.reduce((sum, val, i) => sum + (val * weights[i]), 0);
  };

  const results = useMemo(() => {
    return alternatives.map(alt => ({
      id: alt.id,
      name: alt.name,
      score: calculateKTScore(alt.values)
    })).sort((a, b) => b.score - a.score);
  }, [alternatives, parameters]);

  const winner = results[0];

  const comparisonData = alternatives.map(alt => ({
    name: alt.name,
    vrednost: calculateKTScore(alt.values)
  }));

  const pieData = parameters.map((p, index) => ({
    name: p.name,
    value: p.weight,
    color: COLORS[index % COLORS.length]
  }));

  const sensitivityData = useMemo(() => {
    if (!selectedParam) return [];
    
    const paramIndex = parameters.findIndex(p => p.id === selectedParam);
    if (paramIndex === -1) return [];

    const data = [];
    for (let weight = 0; weight <= 10; weight += 1) {
      const newWeights = [...parameters.map(p => p.weight)];
      newWeights[paramIndex] = weight;
      
      const point = { weight };
      alternatives.forEach(alt => {
        point[alt.name] = calculateKTScore(alt.values, newWeights);
      });
      data.push(point);
    }
    return data;
  }, [selectedParam, parameters, alternatives]);

  const selectedParamName = parameters.find(p => p.id === selectedParam)?.name || '';

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">📊 K-T Metoda</h1>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-dot"></span>
            Dashboard
          </div>
          <div className="nav-item">
            <span className="nav-dot orange"></span>
            Parametri
          </div>
          <div className="nav-item">
            <span className="nav-dot blue"></span>
            Alternative
          </div>
          <div className="nav-item">
            <span className="nav-dot green"></span>
            Rezultati
          </div>
        </nav>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <h1 className="page-title">Metoda Kepner-Tregoe</h1>
          <div className="user-info">
            <div className="user-avatar">KT</div>
          </div>
        </div>

        <div className="content-grid">
          {/* Parametri Card */}
          <div className="card card-full">
            <div className="card-header">
              <h2 className="card-title">Parametri</h2>
              <button onClick={addParameter} className="btn btn-primary">
                <Plus size={18} /> Dodaj parameter
              </button>
            </div>
            <div className="card-body">
              <div className="items-list">
                {parameters.map((param) => (
                  <div key={param.id} className="item-row">
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => updateParameter(param.id, 'name', e.target.value)}
                      className="input input-flex"
                      placeholder="Ime parametra"
                    />
                    <div className="input-group">
                      <label className="input-label">Utež:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={param.weight}
                        onChange={(e) => updateParameter(param.id, 'weight', e.target.value)}
                        className="input input-small"
                      />
                    </div>
                    <button
                      onClick={() => removeParameter(param.id)}
                      disabled={parameters.length <= 1}
                      className="btn btn-icon btn-danger"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Card */}
          <div className="card card-full">
            <div className="card-header">
              <h2 className="card-title">Alternative</h2>
              <button onClick={addAlternative} className="btn btn-success">
                <Plus size={18} /> Dodaj alternativo
              </button>
            </div>
            <div className="card-body">
              <div className="items-list">
                {alternatives.map((alt) => (
                  <div key={alt.id} className="alternative-item">
                    <div className="alternative-header">
                      <input
                        type="text"
                        value={alt.name}
                        onChange={(e) => updateAlternative(alt.id, 'name', e.target.value)}
                        className="input input-flex"
                        placeholder="Ime alternative"
                      />
                      <button
                        onClick={() => removeAlternative(alt.id)}
                        disabled={alternatives.length <= 1}
                        className="btn btn-icon btn-danger"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="values-grid">
                      {parameters.map((param, index) => (
                        <div key={param.id} className="value-input-group">
                          <label className="value-label">{param.name}</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={alt.values[index]}
                            onChange={(e) => updateAlternative(alt.id, 'value', e.target.value, index)}
                            className="input"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rezultati Card */}
          <div className="card card-gradient">
            <h2 className="card-title-white">Rezultati</h2>
            <div className="results-list">
              {results.map((result, index) => (
                <div key={result.id} className={`result-item ${index === 0 ? 'winner' : ''}`}>
                  <span>{index + 1}. {result.name}</span>
                  <span className="result-score">{result.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {winner && (
              <div className="winner-banner">
                <p className="winner-text">🏆 Zmagovalec: {winner.name} ({winner.score.toFixed(2)})</p>
              </div>
            )}
          </div>

          {/* Graf alternativ */}
          <div className="card">
            <h3 className="chart-title">Alternative</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip />
                  <Bar dataKey="vrednost" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart parametrov */}
          <div className="card">
            <h3 className="chart-title">Parametri</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analiza občutljivosti */}
          <div className="card card-full">
            <div className="card-header">
              <div className="card-header-icon">
                <TrendingUp size={24} />
                <h3 className="card-title">Analiza občutljivosti</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="select-group">
                <label className="input-label">Izberi parameter za analizo:</label>
                <select
                  value={selectedParam || ''}
                  onChange={(e) => {
                    setSelectedParam(Number(e.target.value) || null);
                    setShowSensitivity(true);
                  }}
                  className="select"
                >
                  <option value="">-- Izberi parameter --</option>
                  {parameters.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {showSensitivity && selectedParam && (
                <>
                  <h4 className="sensitivity-title">
                    Zahtevnejši del (primer za {selectedParamName})
                  </h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={sensitivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="weight" tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip />
                        <Legend />
                        {alternatives.map((alt, index) => (
                          <Line
                            key={alt.id}
                            type="monotone"
                            dataKey={alt.name}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KepnerTregoeApp;