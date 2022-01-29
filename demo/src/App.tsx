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
            <a href={"https://github.com/costas-basdekis/Shadows2.js"}>GitHub Repo</a>
          </div>

          <div id={"settings"}>
          </div>

          <canvas id={"myCanvas"} width={"1024"} height={"1024"}/>
        </>
    );
  }
}
