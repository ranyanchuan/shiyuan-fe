/**
 * 整个应用的入口，包含路由，数据管理加载
 */

import  "babel-polyfill"
import React  from "react";
import { render,Router,Route } from "mirrorx";
import AppContainer from './container'
import "./app.less";



render(<Router><Route><AppContainer/></Route></Router>, document.querySelector("#app"));
