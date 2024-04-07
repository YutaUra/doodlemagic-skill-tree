import { graphlib, layout } from "@dagrejs/dagre";
import { useCallback } from "preact/hooks";
import { useHotkeys } from "react-hotkeys-hook";
import {
	type Edge,
	type Node,
	type NodeMouseHandler,
	Position,
	type ReactFlowProps,
} from "reactflow";
import type { Entries } from "type-fest";
import useUndo from "use-undo";
import { Magics } from "../modules/skill/magic";
import { type NodeData, defaultNodeData } from "../types/node-data";

const createNodeId = {
	magic: (magicId: string) => magicId,
	skill: (magicId: string, skillId: string) => `${magicId}_${skillId}`,
	magicRef: (magicId: string, refId: string) => `${magicId}_ref_${refId}`,
};

type PartialNode = Pick<
	Node,
	"id" | "type" | "targetPosition" | "sourcePosition"
> & { data: NodeData };
type PartialEdge = Pick<Edge, "source" | "target" | "id">;

const initialize = (): {
	readonly nodes: readonly Readonly<PartialNode>[];
	readonly edges: readonly Readonly<PartialEdge>[];
} => {
	const nodes: PartialNode[] = [];
	const edges: PartialEdge[] = [];

	for (const [magicId, magic] of Object.entries(Magics) as Entries<
		typeof Magics
	>) {
		nodes.push({
			id: createNodeId.magic(magicId),
			data: { label: magic.name, ...defaultNodeData },
			type: "magic",
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
		});
		for (const [skillId, skill] of Object.entries(magic.skills) as Entries<
			typeof magic.skills
		>) {
			nodes.push({
				id: createNodeId.skill(magicId, skillId),
				data: { label: skill.name, ...defaultNodeData },
				type: "skill",
				sourcePosition: Position.Right,
				targetPosition: Position.Left,
			});
			if (!("needs" in skill)) {
				edges.push({
					source: createNodeId.magic(magicId),
					target: createNodeId.skill(magicId, skillId),
					id: `${magicId} → ${skillId}`,
				});
			} else {
				for (const need of skill.needs) {
					switch (need.type) {
						case "skill": {
							edges.push({
								source: createNodeId.skill(magicId, need.ref),
								target: createNodeId.skill(magicId, skillId),
								id: `${magicId}: ${need.ref} → ${skillId}`,
							});
							break;
						}
						case "magic": {
							const copyRef = createNodeId.magicRef(magicId, need.ref);
							if (!nodes.find((v) => v.id === copyRef)) {
								nodes.push({
									id: copyRef,
									data: { label: Magics[need.ref].name, ...defaultNodeData },
									type: "magic-ref",
									sourcePosition: Position.Right,
									targetPosition: Position.Left,
								});
								edges.push({
									source: createNodeId.magic(magicId),
									target: copyRef,
									id: `${magicId} → ${need.ref}`,
								});
							}
							edges.push({
								source: copyRef,
								target: createNodeId.skill(magicId, skillId),
								id: `${need.ref} → ${magicId}:${skillId}`,
							});
							break;
						}
						case "magic-skill": {
							edges.push({
								source: createNodeId.skill(need.ref.magic, need.ref.skill),
								target: createNodeId.skill(magicId, skillId),
								id: `${need.ref.magic}:${need.ref.skill} → ${magicId}:${skillId}`,
							});
							break;
						}
						default: {
							const _exhaustiveCheck: never = need;
							throw new Error(
								`Unknown need type: ${JSON.stringify(_exhaustiveCheck)}`,
							);
						}
					}
				}
			}
		}
	}

	return {
		nodes,
		edges,
	};
};

const { nodes: INITIAL_NODES, edges: INITIAL_EDGES } = initialize();

const nodeWidth = 172;
const nodeHeight = 36;

type Options = {
	readonly foldedNodes: readonly string[];
};

type Operator = (prev: Options) => Options;

const foldNode =
	(id: string): Operator =>
	(prev) => {
		return {
			...prev,
			foldedNodes: Array.from(new Set([...prev.foldedNodes, id])),
		};
	};

const unfoldNode =
	(id: string): Operator =>
	(prev) => {
		return {
			...prev,
			foldedNodes: prev.foldedNodes.filter((v) => v !== id),
		};
	};

const INITIAL_OPTIONS: Options = {
	foldedNodes: [],
};

const INITIAL_OPERATORS: readonly Operator[] = [
	...Object.keys(Magics).map((id) => foldNode(createNodeId.magic(id))),
];

const applyOptions = (options: Options) => {
	const dagreGraph = new graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	dagreGraph.setGraph({ rankdir: "LR" });

	for (const node of INITIAL_NODES) {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	}

	for (const edge of INITIAL_EDGES) {
		dagreGraph.setEdge(edge.source, edge.target);
	}

	for (const nodeId of options.foldedNodes) {
		for (const children of graphlib.alg.preorder(dagreGraph, nodeId)) {
			if (children === nodeId) continue;
			dagreGraph.removeNode(children);
		}
	}

	layout(dagreGraph);

	return {
		nodes: dagreGraph.nodes().map<Node<NodeData>>((nodeId) => {
			const v = INITIAL_NODES.find((v) => v.id === nodeId);
			if (!v) throw new Error(`Node not found: ${nodeId}`);
			const nodeWithPosition = dagreGraph.node(nodeId);
			return {
				...v,
				position: {
					x: nodeWithPosition.x - nodeWidth / 2,
					y: nodeWithPosition.y - nodeHeight / 2,
				},
				data: {
					...v.data,
					isFolded: options.foldedNodes.includes(nodeId),
					hasChildren: INITIAL_EDGES.some((v) => v.source === nodeId),
				},
			};
		}),
		edges: INITIAL_EDGES.slice(),
	};
};

export const useSkillTree = (): { reactflowProps: ReactFlowProps } => {
	const [operators, operatorsMutation] = useUndo<Operator[]>([]);

	const options = [...INITIAL_OPERATORS, ...operators.present].reduce(
		(prev, operator) => operator(prev),
		INITIAL_OPTIONS,
	);

	const { nodes, edges } = applyOptions(options);

	const onNodeDoubleClick = useCallback<NodeMouseHandler>(
		(_, node) => {
			const hasChild = INITIAL_EDGES.some((v) => v.source === node.id);
			if (!hasChild) return;

			if (options.foldedNodes.includes(node.id)) {
				operatorsMutation.set([...operators.present, unfoldNode(node.id)]);
			} else {
				operatorsMutation.set([...operators.present, foldNode(node.id)]);
			}
		},
		[options, operators.present, operatorsMutation.set],
	);

	useHotkeys("meta+z", () => {
		operatorsMutation.undo();
	});

	useHotkeys("meta+shift+z", () => {
		operatorsMutation.redo();
	});

	return {
		reactflowProps: { nodes, edges, onNodeDoubleClick },
	};
};
