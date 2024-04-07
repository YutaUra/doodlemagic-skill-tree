import type { VNode } from "preact";
import { css } from "~styled-system/css";

const Provider = ({ children }: { children: VNode }) => {
	return <>{children}</>;
};

const Inner = () => {
	return (
		<h1 className={css({ fontSize: "2xl", fontWeight: "bold" })}>
			Hello, world!
		</h1>
	);
};

export const App = () => (
	<Provider>
		<Inner />
	</Provider>
);
