import './App.css';
import { Demo } from "./demo";
import {Component} from "react";

export default class App extends Component {
  demo = null;

  componentDidMount() {
      if (document.getElementById("myCanvas").getContext("2d")) {
          this.demo = new Demo(
              document.getElementById("myCanvas"),
              document.getElementById("settings"),
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
