import type { VNode } from "preact";

const Provider = ({ children }: { children: VNode }) => {
	return <>{children}</>;
};

const Inner = () => {
	return <h1>Hello, world!</h1>;
};

export const App = () => (
	<Provider>
		<Inner />
	</Provider>
);
