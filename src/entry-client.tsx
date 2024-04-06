import { render } from "preact";
import { App } from "./App";

// biome-ignore lint/style/noNonNullAssertion: index.html has a <div id="app"> element
render(<App />, document.getElementById("app")!);
