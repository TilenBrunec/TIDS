import React, { useRef } from 'react';
import { saveToFile, loadFromFile, exportChartAsImage, SaveData } from '../../utils/fileOperations';
import './SaveLoadButtons.css';

interface Props {
  data: SaveData;
  onLoad: (data: SaveData) => void;
}

export const SaveLoadButtons: React.FC<Props> = ({ data, onLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    try {
      saveToFile(data);
      alert('Model uspešno shranjen!');
    } catch (error) {
      alert('Napaka pri shranjevanju: ' + error);
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loadedData = await loadFromFile(file);
      onLoad(loadedData);
      alert('Model uspešno naložen!');
    } catch (error) {
      alert('Napaka pri nalaganju: ' + error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportChart = async () => {
    try {
      await exportChartAsImage('results-chart');
      alert('Graf uspešno izvožen!');
    } catch (error) {
      alert('Napaka pri izvozu grafa: ' + error);
    }
  };

  return (
    <div className="file-operations">
      <button onClick={handleSave} className="save-btn">
        💾 Shrani Model
      </button>
      <button onClick={handleLoadClick} className="load-btn">
        📂 Naloži Model
      </button>
      <button onClick={handleExportChart} className="export-btn">
        📊 Izvozi Graf
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};