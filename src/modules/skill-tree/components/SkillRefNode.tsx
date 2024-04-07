import { Handle, type NodeProps, Position } from "reactflow";
import type { NodeData } from "../types/node-data";
import { FoldIcon } from "./FoldIcon";

export const SkillRefNode = ({
	data: { label, hasChildren, isFolded },
	isConnectable,
	targetPosition = Position.Top,
	sourcePosition = Position.Bottom,
}: NodeProps<NodeData>) => {
	return (
		<>
			<Handle
				type="target"
				position={targetPosition}
				isConnectable={isConnectable}
			/>
			{label}

			{hasChildren && <FoldIcon isFolded={isFolded} />}
			<Handle
				type="source"
				position={sourcePosition}
				isConnectable={isConnectable}
			/>
		</>
	);
};
