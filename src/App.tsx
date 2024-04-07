import type { VNode } from "preact";
import { css } from "~styled-system/css";
import { SkillTree } from "./modules/skill-tree/SkillTree";

const Provider = ({ children }: { children: VNode }) => {
	return <>{children}</>;
};

const Inner = () => {
	return (
		<div
			className={css({
				width: "100vw",
				height: "100vh",
				display: "flex",
				flexDir: "column",
			})}
		>
			<SkillTree className={css({ flexGrow: 1 })} />
		</div>
	);
};

export const App = () => (
	<Provider>
		<Inner />
	</Provider>
);
