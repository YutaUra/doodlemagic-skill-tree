import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { cx } from "~styled-system/css";
import { MagicNode } from "./components/MagicNode";
import { MagicRefNode } from "./components/MagicRefNode";
import { SkillNode } from "./components/SkillNode";
import { SkillRefNode } from "./components/SkillRefNode";
import { useSkillTree } from "./hooks/useSkillTree";
import "./styles/Node.scss";

const nodeTypes = {
	magic: MagicNode,
	"magic-ref": MagicRefNode,
	skill: SkillNode,
	"skill-ref": SkillRefNode,
};

export type SkillTreeProps = {
	className?: string;
};

export const SkillTree = ({ className }: SkillTreeProps) => {
	const { reactflowProps, dialog } = useSkillTree();
	return (
		<div className={cx(className)}>
			<ReactFlow nodeTypes={nodeTypes} {...reactflowProps}>
				<Controls />
				<MiniMap />
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			</ReactFlow>

			{dialog}
		</div>
	);
};
