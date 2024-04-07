import dagre from "dagre";
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	type Node,
	type Edge,
	Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Entries } from "type-fest";
import { cx } from "~styled-system/css";
import { RefNode } from "./components/RefNode";
import { Magics } from "./modules/skill/magic";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;
dagreGraph.setGraph({ rankdir: "LR" });
const nodes: Omit<Node, "position">[] = [];
const edges: Edge[] = [];

const addNode = (
	node: Omit<Node, "position" | "targetPosition" | "sourcePosition">,
) => {
	nodes.push({
		...node,
		targetPosition: Position.Left,
		sourcePosition: Position.Right,
	});
	dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
};
const addEdge = (edge: Edge) => {
	edges.push(edge);
	dagreGraph.setEdge(edge.source, edge.target);
};
for (const [magicId, magic] of Object.entries(Magics) as Entries<
	typeof Magics
>) {
	addNode({ id: magicId, data: { label: magic.name } });
	for (const [skillId, skill] of Object.entries(magic.skills) as Entries<
		typeof magic.skills
	>) {
		addNode({ id: `${magicId}_${skillId}`, data: { label: skill.name } });
		if (!("needs" in skill)) {
			addEdge({
				source: magicId,
				target: `${magicId}_${skillId}`,
				id: `${magicId} → ${skillId}`,
			});
		} else {
			for (const need of skill.needs) {
				switch (need.type) {
					case "skill": {
						addEdge({
							source: `${magicId}_${need.ref}`,
							target: `${magicId}_${skillId}`,
							id: `${magicId}: ${need.ref} → ${skillId}`,
						});
						break;
					}
					case "magic": {
						const copyRef = `${magicId}_ref_${need.ref}`;
						if (!nodes.find((v) => v.id === copyRef)) {
							addNode({
								id: copyRef,
								data: { label: Magics[need.ref].name },
								type: "ref",
							});
							addEdge({
								source: magicId,
								target: copyRef,
								id: `${magicId} → ${need.ref}`,
							});
						}
						addEdge({
							source: copyRef,
							target: `${magicId}_${skillId}`,
							id: `${need.ref} → ${magicId}:${skillId}`,
						});
						break;
					}
					case "magic-skill": {
						addEdge({
							source: `${need.ref.magic}_${need.ref.skill}`,
							target: `${magicId}_${skillId}`,
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

dagre.layout(dagreGraph);

const initialNodes = nodes.map<Node>((v) => {
	const nodeWithPosition = dagreGraph.node(v.id);
	return {
		...v,
		position: {
			x: nodeWithPosition.x - nodeWidth / 2,
			y: nodeWithPosition.y - nodeHeight / 2,
		},
	};
});
const initialEdges = edges;

const nodeTypes = {
	ref: RefNode,
};

export type SkillTreeProps = {
	className?: string;
};

export const SkillTree = ({ className }: SkillTreeProps) => {
	return (
		<div className={cx(className)}>
			<ReactFlow
				nodes={initialNodes}
				edges={initialEdges}
				nodeTypes={nodeTypes}
			>
				<Controls />
				<MiniMap />
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			</ReactFlow>
		</div>
	);
};
