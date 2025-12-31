import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CalculationResult } from '../../types';
import './ResultsChart.css';

interface Props {
  results: CalculationResult[];
}

export const ResultsChart: React.FC<Props> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  const chartData = results.map((result) => ({
    name: result.alternativeName,
    vrednost: result.totalValue,
  }));

  return (
    <div className="results-chart" id="results-chart">
      <h2>Graf Primerjave Alternativ</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="vrednost" fill="#3498db" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};