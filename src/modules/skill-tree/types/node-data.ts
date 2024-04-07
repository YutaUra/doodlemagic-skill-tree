export type NodeData = {
	label: string;
	isFolded: boolean;
	hasChildren: boolean;
} & (
	| {
			type: "magic";
			magic: {
				description: string;
			};
	  }
	| {
			type: "skill";
			magic: {
				name: string;
			};
			skill: {
				description: string | undefined;
			};
	  }
	| {
			type: "magic-ref";
			magic: {
				name: string;
			};
	  }
	| {
			type: "skill-ref";
			magic: {
				name: string;
			};
			skill: {
				name: string;
			};
	  }
);

export const defaultNodeData = {
	isFolded: false,
	hasChildren: false,
} as const satisfies Partial<NodeData>;
