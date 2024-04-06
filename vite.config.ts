/// <reference types="vitest" />

import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [preact()],
	base: "/doodlemagic-skill-tree/",
	build: {
		outDir: "dist/doodlemagic-skill-tree",
	},
	test: {
		environment: "jsdom",
	},
});
