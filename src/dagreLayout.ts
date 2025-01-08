// src/dagreLayout.ts
import dagre from "dagre";
import { Node, Edge } from "reactflow";

const nodeWidth = 240; // CustomNodeで幅240pxに合わせる
const nodeHeight = 60; // 高さ60px

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

interface LayoutOptions {
  rankdir?: "TB" | "LR" | "BT" | "RL";
  nodeSep?: number;
  edgeSep?: number;
  rankSep?: number;
}

export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  opts: LayoutOptions = {}
): Node[] {
  dagreGraph.setGraph({
    rankdir: opts.rankdir || "TB",
    nodesep: opts.nodeSep || 70,
    edgesep: opts.edgeSep || 20,
    ranksep: opts.rankSep || 100,
  });

  // ノードをDagreへ登録
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // エッジをDagreへ登録 (source→target)
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // レイアウト計算
  dagre.layout(dagreGraph);

  // 計算結果を反映 (Dagreは左上座標を返す -> ReactFlowは中心座標基準)
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });
}
