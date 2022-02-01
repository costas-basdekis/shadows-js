import { Component } from "react";
import './App.css';
import { Demo } from "./demo";
import React from "react";

export default class App extends Component {
  demo: Demo | null = null;

  componentDidMount() {
      const canvasEl: HTMLCanvasElement | null = document.getElementById("myCanvas") as HTMLCanvasElement;
      if (!canvasEl) {
          return;
      }
      if (canvasEl.getContext("2d")) {
          this.demo = new Demo(
              canvasEl,
              document.getElementById("settings")!,
          );
      }
  }

  render() {
    return (
        <>
          <div>
            <a href={"https://github.com/costas-basdekis/shadows-js"}>GitHub Repo</a>
            {" "}
            <a href={"https://www.npmjs.com/package/shadows-js"}>NPM Package</a>
          </div>
          <p>
              This library calculates the visible area in a closed room from a central point.
              The calculations are exact, to the extent that floating point arithmetic allows.
          </p>
          <p>
              The inspiration comes from the soldiers' view field in the Commandos game series.
          </p>

          <div id={"settings"}>
          </div>

          <canvas id={"myCanvas"} width={"1024"} height={"1024"}/>
        </>
    );
  }
}
