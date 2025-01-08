// src/CustomNode.tsx
import React, { memo, MouseEvent } from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface CustomNodeData {
  name: string;
  title?: string;
  expanded?: boolean;
  hasChildren?: boolean;
  toggleChildren?: (evt: MouseEvent) => void;
}

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  const width = 240;
  const height = 60;

  // 子ノードを持つ場合のみボタンを描画
  // 折りたたみ中: ▼, 展開中: ▲
  const showToggleButton = data.hasChildren;
  const toggleLabel = data.expanded ? "▲" : "▼";

  return (
    <div
      style={{
        width,
        height,
        border: "1px solid black",
        background: "white",
        textAlign: "center",
        position: "relative",
        fontSize: "12px",
        fontFamily: "sans-serif",
      }}
    >
      {/* 上下2行で表示 */}
      <div
        style={{
          borderBottom: "1px solid black",
          height: "50%",
          lineHeight: `${height / 2 - 2}px`,
        }}
      >
        {data?.name}
      </div>
      <div style={{ height: "50%", lineHeight: `${height / 2 - 2}px` }}>
        {data?.title}
      </div>

      {/* 親ノードから子ノードへ出力するためのハンドル */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ left: "50%", transform: "translateX(-50%)" }}
        id="bottom"
      />

      {/* 子ノードから受け取るハンドル */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ left: "50%", transform: "translateX(-50%)" }}
        id="top"
      />

      {/* 中央下部に円形ボタンを置く(子どもがいる場合のみ) */}
      {showToggleButton && (
        <button
          onClick={data.toggleChildren} // 親コンポーネントから渡されたトグル関数を呼ぶ
          style={{
            position: "absolute",
            bottom: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "1px solid black",
            background: "white",
            cursor: "pointer",
            lineHeight: "22px",
            fontSize: "14px",
            textAlign: "center",
            padding: 0,
          }}
        >
          {toggleLabel}
        </button>
      )}
    </div>
  );
};

export default memo(CustomNode);
