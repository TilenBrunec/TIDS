export interface TreeNode {
  id: string;
  name: string;
  weight: number;
  utilityFunction: 'linear' | 'exponential' | 'logarithmic';
  children: TreeNode[];
  isLeaf: boolean;
}

export interface Alternative {
  id: string;
  name: string;
  values: { [leafId: string]: number };
}

export interface CalculationResult {
  alternativeId: string;
  alternativeName: string;
  totalValue: number;
  breakdown: { [nodeId: string]: number };
}