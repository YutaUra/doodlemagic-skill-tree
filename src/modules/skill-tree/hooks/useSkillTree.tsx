import { graphlib, layout } from "@dagrejs/dagre";
import { Dialog } from "@headlessui/react";
import type { VNode } from "preact";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
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
import { css } from "~styled-system/css";
import { Magics } from "../modules/skill/magic";
import { type NodeData, defaultNodeData } from "../types/node-data";

const createNodeId = {
	magic: (magicId: string) => magicId,
	skill: (magicId: string, skillId: string) => `${magicId}_${skillId}`,
	magicRef: (magicId: string, refId: string) => `${magicId}_ref_${refId}`,
	skillRef: (magicId: string, refId: string, skillId: string) =>
		`${magicId}_ref_${refId}_${skillId}`,
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
			data: {
				label: magic.name,
				type: "magic",
				magic: { description: magic.description },
				...defaultNodeData,
			},
			type: "magic",
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
		});
		for (const [skillId, skill] of Object.entries(magic.skills) as Entries<
			typeof magic.skills
		>) {
			nodes.push({
				id: createNodeId.skill(magicId, skillId),
				data: {
					label: skill.name,
					type: "skill",
					magic: { name: magic.name },
					skill: { description: skill.description },
					...defaultNodeData,
				},
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
							const magicRef = createNodeId.magicRef(magicId, need.ref);
							if (!nodes.find((v) => v.id === magicRef)) {
								nodes.push({
									id: magicRef,
									data: {
										label: Magics[need.ref].name,
										type: "magic-ref",
										magic: { name: Magics[need.ref].name },
										...defaultNodeData,
									},
									type: "magic-ref",
									sourcePosition: Position.Right,
									targetPosition: Position.Left,
								});
								edges.push({
									source: createNodeId.magic(magicId),
									target: magicRef,
									id: `${magicId} → ${need.ref}`,
								});
							}
							edges.push({
								source: magicRef,
								target: createNodeId.skill(magicId, skillId),
								id: `${need.ref} → ${magicId}:${skillId}`,
							});
							break;
						}
						case "magic-skill": {
							const skillRef = createNodeId.skillRef(
								magicId,
								need.ref.magic,
								need.ref.skill,
							);
							if (!nodes.find((v) => v.id === skillRef)) {
								const magicRef = createNodeId.magicRef(magicId, need.ref.magic);
								if (!nodes.find((v) => v.id === magicRef)) {
									nodes.push({
										id: magicRef,
										data: {
											label: Magics[need.ref.magic].name,
											type: "magic-ref",
											magic: { name: Magics[need.ref.magic].name },
											...defaultNodeData,
										},
										type: "magic-ref",
										sourcePosition: Position.Right,
										targetPosition: Position.Left,
									});
									edges.push({
										source: createNodeId.magic(magicId),
										target: magicRef,
										id: `${magicId} → ${need.ref}`,
									});
								}

								nodes.push({
									id: skillRef,
									data: {
										label: Magics[need.ref.magic].skills[need.ref.skill].name,
										type: "skill-ref",
										magic: { name: Magics[need.ref.magic].name },
										skill: {
											name: Magics[need.ref.magic].skills[need.ref.skill].name,
										},
										...defaultNodeData,
									},
									type: "skill-ref",
									sourcePosition: Position.Right,
									targetPosition: Position.Left,
								});
								edges.push({
									source: magicRef,
									target: skillRef,
									id: `ref:${need.ref.magic} → ${need.ref.skill}`,
								});
							}
							edges.push({
								source: skillRef,
								target: createNodeId.skill(magicId, skillId),
								id: `ref:${need.ref.magic}:${need.ref.skill} → ${magicId}:${skillId}`,
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

export const useSkillTree = (): {
	reactflowProps: ReactFlowProps;
	dialog: VNode;
} => {
	const [operators, operatorsMutation] = useUndo<Operator[]>([]);
	const [selectedNodeId, setSelectedNodeId] = useState<null | string>(null);

	const options = [...INITIAL_OPERATORS, ...operators.present].reduce(
		(prev, operator) => operator(prev),
		INITIAL_OPTIONS,
	);

	const { nodes, edges } = applyOptions(options);

	const doubleClickRef = useRef<null | NodeJS.Timeout>(null);

	const onNodeDoubleClick = useCallback<NodeMouseHandler>(
		(_, node) => {
			if (doubleClickRef.current) {
				clearTimeout(doubleClickRef.current);
				doubleClickRef.current = null;
			}
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

	const onNodeClick = useCallback<NodeMouseHandler>(
		(_, node) => {
			if (doubleClickRef.current) clearTimeout(doubleClickRef.current);

			doubleClickRef.current = setTimeout(() => {
				setSelectedNodeId(node.id);
			}, 300);
		},
		[options, operators.present, operatorsMutation.set],
	);

	useHotkeys("meta+z", () => {
		operatorsMutation.undo();
	});

	useHotkeys("meta+shift+z", () => {
		operatorsMutation.redo();
	});

	const dialog = useMemo(() => {
		const selectedNode = nodes.find((v) => v.id === selectedNodeId);
		return (
			<Dialog
				open={typeof selectedNode !== "undefined"}
				onClose={() => setSelectedNodeId(null)}
				className={css({ position: "relative", zIndex: 50 })}
			>
				<div
					className={css({
						position: "fixed",
						inset: 0,
						width: "100vw",
						display: "flex",
						flexDir: "column",
						justifyContent: "center",
						padding: "4",
						backgroundColor: "rgba(0, 0, 0, 0.3)",
					})}
				>
					<Dialog.Panel
						className={css({
							backgroundColor: "white",
							paddingY: "4",
							rounded: "md",
							w: "full",
							maxW: "lg",
							mx: "auto",
						})}
					>
						{selectedNode && (
							<>
								<Dialog.Title
									className={css({
										paddingX: "2",
										textAlign: "center",
										fontSize: "lg",
										letterSpacing: "wider",
										marginBottom: "1",
									})}
								>
									{selectedNode.data.type === "magic"
										? `魔法: ${selectedNode.data.label}`
										: selectedNode.data.type === "magic-ref"
											? `魔法: ${selectedNode.data.label}`
											: selectedNode.data.type === "skill"
												? `スキル: ${selectedNode.data.label}（${selectedNode.data.magic.name}）`
												: `スキル: ${selectedNode.data.label}（${selectedNode.data.magic.name}）`}
								</Dialog.Title>
								<Dialog.Description
									className={css({
										paddingX: "4",
										marginBottom: "8",
										marginTop: "8",
									})}
								>
									{selectedNode.data.type === "magic"
										? selectedNode.data.magic.description
										: selectedNode.data.type === "magic-ref"
											? null
											: selectedNode.data.type === "skill"
												? selectedNode.data.skill.description
												: null}
								</Dialog.Description>

								<div
									className={css({
										display: "flex",
										justifyContent: "flex-end",
										paddingX: "4",
									})}
								>
									<button type="button" onClick={() => setSelectedNodeId(null)}>
										Close
									</button>
								</div>
							</>
						)}
					</Dialog.Panel>
				</div>
			</Dialog>
		);
	}, [selectedNodeId, setSelectedNodeId]);

	return {
		reactflowProps: { nodes, edges, onNodeDoubleClick, onNodeClick },
		dialog,
	};
};
