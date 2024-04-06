import { render } from "preact";
import { App } from "./App";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: index.html has a <div id="app"> element
render(<App />, document.getElementById("app")!);
