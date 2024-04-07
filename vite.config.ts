/// <reference types="vitest" />

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [preact(), tsconfigPaths()],
	base: "/doodlemagic-skill-tree/",
	build: {
		outDir: "dist/doodlemagic-skill-tree",
	},
	test: {
		environment: "jsdom",
	},
});
