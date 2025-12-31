import React from 'react';
import { TreeNode as TreeNodeType } from '../../types';
import './TreeNode.css';

interface Props {
  node: TreeNodeType;
  onUpdateNode: (nodeId: string, updates: Partial<TreeNodeType>) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
}

export const TreeNode: React.FC<Props> = ({
  node,
  onUpdateNode,
  onDeleteNode,
  onAddChild,
}) => {
  return (
    <div className="tree-node">
      <div className="node-content">
        <div className="node-header">
          <input
            type="text"
            value={node.name}
            onChange={(e) => onUpdateNode(node.id, { name: e.target.value })}
            className="node-name-input"
            placeholder="Ime vozlišča"
          />
          <button
            onClick={() => onDeleteNode(node.id)}
            className="delete-btn"
            title="Izbriši vozlišče"
          >
            ❌
          </button>
        </div>

        <div className="node-controls">
          <label>
            Utež:
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={node.weight}
              onChange={(e) =>
                onUpdateNode(node.id, { weight: parseFloat(e.target.value) || 0 })
              }
              className="weight-input"
            />
          </label>

          {node.isLeaf && (
            <label>
              Funkcija:
              <select
                value={node.utilityFunction}
                onChange={(e) =>
                  onUpdateNode(node.id, {
                    utilityFunction: e.target.value as any,
                  })
                }
                className="function-select"
              >
                <option value="linear">Linearna</option>
                <option value="exponential">Eksponentna</option>
                <option value="logarithmic">Logaritemska</option>
              </select>
            </label>
          )}

          <label>
            <input
              type="checkbox"
              checked={node.isLeaf}
              onChange={(e) =>
                onUpdateNode(node.id, { isLeaf: e.target.checked })
              }
            />
            List (brez otrok)
          </label>
        </div>

        {!node.isLeaf && (
          <button onClick={() => onAddChild(node.id)} className="add-child-btn">
            + Dodaj otroka
          </button>
        )}
      </div>

      {!node.isLeaf && node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onUpdateNode={onUpdateNode}
              onDeleteNode={onDeleteNode}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};