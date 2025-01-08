// src/OrgChart.tsx
import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  BackgroundVariant,
  Node,
  Edge,
} from "reactflow";

import "reactflow/dist/style.css";

import { OrgNode } from "./types";
import CustomNode from "./CustomNode";
import { applyDagreLayout } from "./dagreLayout";

/*----------------------------------------------
 * 全ノードの展開状態を管理するために
 * nodeId -> expanded(bool)
 *--------------------------------------------*/
type ExpandedMap = Record<number, boolean>;

const OrgChart: React.FC = () => {
  const [rootData, setRootData] = useState<OrgNode | null>(null);

  // ノードごとの展開状態を管理
  const [expandedMap, setExpandedMap] = useState<ExpandedMap>({});

  // React Flow用 Node/Edge
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [error, setError] = useState<string | null>(null);

  // カスタムノードの登録
  const nodeTypes = {
    customNode: CustomNode,
  };

  // ---------------------------
  // JSONをフェッチ
  // ---------------------------
  useEffect(() => {
    fetch("/orgData.json")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      })
      .then((data: OrgNode) => {
        setRootData(data);

        // 初期状態として、全ノードを展開 or 折りたたみ?
        // 今回は rootだけ展開(true)、それ以外falseという例にしてみる
        const initialMap: ExpandedMap = {};
        // 再帰的に全idを登録
        const stack = [data];
        while (stack.length > 0) {
          const node = stack.pop()!;
          initialMap[node.id] = node.id === data.id; // ルートだけtrue, 他false
          node.children?.forEach((c) => stack.push(c));
        }
        setExpandedMap(initialMap);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // ---------------------------
  // toggleNode: あるノードの展開状態を反転し、Flowを再構築
  // ---------------------------
  const toggleNode = useCallback((nodeId: number) => {
    setExpandedMap((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  }, []);

  // ---------------------------
  // OrgNodeツリー -> Node[]/Edge[] を生成
  // (expanded=false のノードの子はスキップ)
  // ---------------------------
  // buildFlowData 内で toggleNode を使用しているので、
  // useCallback の依存配列に toggleNode を追加
  const buildFlowData = useCallback(
    (orgNode: OrgNode) => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      function traverse(node: OrgNode) {
        const isExpanded = expandedMap[node.id] ?? false;

        newNodes.push({
          id: String(node.id),
          data: {
            name: node.name,
            title: node.title,
            expanded: isExpanded,
            // undefined でも length を呼ばないように修正
            hasChildren: (node.children?.length ?? 0) > 0,
            toggleChildren: () => toggleNode(node.id),
          },
          type: "customNode",
          position: { x: 0, y: 0 },
        });

        if (node.children && isExpanded) {
          node.children.forEach((child) => {
            newEdges.push({
              id: `${node.id}-${child.id}`,
              source: String(node.id),
              target: String(child.id),
              sourceHandle: "bottom",
              targetHandle: "top",
              type: "smoothstep",
            });
            traverse(child);
          });
        }
      }

      traverse(orgNode);
      return { newNodes, newEdges };
    },
    [expandedMap, toggleNode] // ← toggleNode を追加
  );

  // ---------------------------
  // expandedMap or rootDataが変わるたびに
  // Node/Edgeを再構築 & Dagreレイアウト
  // ---------------------------
  useEffect(() => {
    if (!rootData) return;

    const { newNodes, newEdges } = buildFlowData(rootData);
    const layoutedNodes = applyDagreLayout(newNodes, newEdges, {
      rankdir: "TB",
      nodeSep: 70,
      edgeSep: 20,
      rankSep: 100,
    });
    setNodes(layoutedNodes);
    setEdges(newEdges);
  }, [rootData, expandedMap, buildFlowData]);

  // 初期表示でfitViewする
  const onInit = useCallback((instance: any) => {
    instance.fitView({ padding: 0.2 });
  }, []);

  if (error) {
    return <div style={{ color: "red" }}>エラー: {error}</div>;
  }
  if (!rootData || nodes.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: "100%", height: "800px", background: "#f4f4f4" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default OrgChart;
