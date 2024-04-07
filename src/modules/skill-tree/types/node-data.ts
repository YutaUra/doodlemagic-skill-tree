export type NodeData = {
	label: string;
	isFolded: boolean;
	hasChildren: boolean;
};

export const defaultNodeData = {
	isFolded: false,
	hasChildren: false,
} as const satisfies Partial<NodeData>;
