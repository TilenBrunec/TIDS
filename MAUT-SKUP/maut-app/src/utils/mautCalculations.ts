import { TreeNode, Alternative, CalculationResult } from '../types';

export const utilityFunctions = {
  linear: (x: number): number => x,
  exponential: (x: number): number => Math.pow(x, 2),
  logarithmic: (x: number): number => Math.log10(1 + 9 * x),
};

export function calculateNodeValue(
  node: TreeNode,
  alternative: Alternative,
  allLeaves: TreeNode[]
): number {
  if (node.isLeaf) {
    const rawValue = alternative.values[node.id] || 0;
    const utilityFn = utilityFunctions[node.utilityFunction];
    return utilityFn(rawValue);
  }

  let totalValue = 0;
  for (const child of node.children) {
    const childValue = calculateNodeValue(child, alternative, allLeaves);
    totalValue += childValue * child.weight;
  }

  return totalValue;
}

export function calculateResults(
  rootNode: TreeNode,
  alternatives: Alternative[]
): CalculationResult[] {
  const leaves = getAllLeaves(rootNode);

  return alternatives.map((alt) => {
    const totalValue = calculateNodeValue(rootNode, alt, leaves);

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      totalValue: totalValue,
      breakdown: {},
    };
  });
}

export function getAllLeaves(node: TreeNode): TreeNode[] {
  if (node.isLeaf) {
    return [node];
  }

  let leaves: TreeNode[] = [];
  for (const child of node.children) {
    leaves = leaves.concat(getAllLeaves(child));
  }
  return leaves;
}

export function validateWeights(node: TreeNode): boolean {
  if (node.isLeaf) return true;

  const sum = node.children.reduce((acc, child) => acc + child.weight, 0);
  const isValid = Math.abs(sum - 1.0) < 0.001;

  if (!isValid) return false;

  return node.children.every((child) => validateWeights(child));
}