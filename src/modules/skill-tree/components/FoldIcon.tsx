import { RiExpandRightFill } from "react-icons/ri";
import { css } from "~styled-system/css";
import type { NodeData } from "../types/node-data";

export const FoldIcon = ({ isFolded }: Pick<NodeData, "isFolded">) => {
	if (!isFolded) return null;
	return (
		<div
			className={css({
				position: "absolute",
				transform: "translateY(-50%)",
				right: "-18px",
				top: "50%",
			})}
		>
			<RiExpandRightFill />
		</div>
	);
};
