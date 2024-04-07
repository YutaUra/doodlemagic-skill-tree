import { render } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
	it.skip("should render", () => {
		const { container } = render(<App />);

		expect(container.textContent).toMatch("Hello, world!");
	});
});
