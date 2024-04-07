import type { VNode } from "preact";
import { HotkeysProvider } from "react-hotkeys-hook";
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
			<HotkeysProvider>
				<SkillTree className={css({ flexGrow: 1 })} />
			</HotkeysProvider>
		</div>
	);
};

export const App = () => (
	<Provider>
		<Inner />
	</Provider>
);
