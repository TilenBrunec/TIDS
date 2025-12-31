import { TreeNode, Alternative } from '../types';
import { saveAs } from 'file-saver';

export interface SaveData {
  tree: TreeNode;
  alternatives: Alternative[];
}

export function saveToFile(data: SaveData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, 'maut-model.json');
}

export function loadFromFile(file: File): Promise<SaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Napaka pri branju datoteke'));
      }
    };

    reader.onerror = () => reject(new Error('Napaka pri branju datoteke'));
    reader.readAsText(file);
  });
}

export async function exportChartAsImage(chartId: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const element = document.getElementById(chartId);

  if (!element) {
    throw new Error('Element ni najden');
  }

  const canvas = await html2canvas(element);
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, 'maut-chart.png');
    }
  });
}