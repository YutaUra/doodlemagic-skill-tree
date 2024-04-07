import { Handle, type NodeProps, Position } from "reactflow";
import "./RefNode.scss";

export const RefNode = ({
	data: { label },
	isConnectable,
	targetPosition = Position.Top,
	sourcePosition = Position.Bottom,
}: NodeProps<{ label: string }>) => {
	return (
		<>
			<Handle
				type="target"
				position={targetPosition}
				isConnectable={isConnectable}
			/>
			{label}
			<Handle
				type="source"
				position={sourcePosition}
				isConnectable={isConnectable}
			/>
		</>
	);
};
