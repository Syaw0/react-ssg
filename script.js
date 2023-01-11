import fs, { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import babel from "@babel/core";
import webpack from "webpack";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
//`tsc  --rootDir src/ --isolatedModules true --allowSyntheticDefaultImports true  --outDir  ./dist/tmp/src --moduleResolution node --jsx react --target esnext`,

fs.rmSync(__dirname + "/dist", { recursive: true });

execSync("tsc  --outDir  ./dist/tmp/src  ");

// execCmd("tsc  --outDir  ./dist/tmp/src  --target esnext")
//   .then((res) => {
//     console.log("success");
//   })
//   .catch((err) => {
//     console.log("err during tsc", err);
//   });

const getDir = (str) => {
  let splitted = str.split("/pages");
  let len = splitted.length;
  if (splitted[len - 1] == "") {
    return "/";
  } else {
    return splitted[len - 1];
  }
};

const routes = {};

let startDir = __dirname + "/dist/tmp/src/pages";
const readRoutes = (currentDir) => {
  let curDir = getDir(currentDir);
  let curDirItem = fs.readdirSync(currentDir);
  routes[curDir] = "";
  curDirItem.forEach((route) => {
    if (route.search("index") != -1) {
      routes[curDir] = currentDir + "/" + route;
    } else {
      //maybe its a dir!?
      // TODO check if its dir
      let nextDir = currentDir + "/" + route;
      readRoutes(nextDir);
    }
  });
};
readRoutes(startDir);

// TODO : 1. add these route to server: app.get(${route},...)

// TODO : 2. pack js file by path of every route (separated) this will new html also
// TODO : 2. Notice:* we must create a base of reactDom.hydrate for every route
// TODO : 2. and this item will be a entry for webpack

// TODO : 3. render to string main route and add it to the html

// * now just set server to respond with these routes

let createBaseHydration = (url) => {
  return `
    import React from 'react';
    import ReactDOM from "react-dom/client";
    import Index from '${url}'

    ReactDOM.hydrateRoot(document.getElementById('root'),<Index/>)

  `;
};

// TODO insert CSS?!
let createHtml = (com, script) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script async scr=${script}></script>
      <title>Document</title>
    </head>
    <body>
      <div id="root">${com}</div>
    </body>
  </html>
  `;
};

// try {
//   fs.mkdirSync(__dirname + "/dist/tmp/src");
// } catch (err) {}

// fs.cpSync(__dirname + "/src/pages", __dirname + "/dist/tmp/pages", {
//   recursive: true,
// });
let entry = [];



    let loop= Object.keys(routes)

    for await(let r  of loop){
      if (routes[r] != "") {
        let indexUrl = routes[r];
        indexUrl = indexUrl.split("/");
        indexUrl[indexUrl.length - 1] = "indexHydrate.js";
        indexUrl = indexUrl.join("/");
    
        const component = await (await import(routes[r]))
        const renderedHtml = ReactDOMServer.renderToString(component.default());
    
        // let htmlUrl = indexUrl
        //   .split("/")
        //   .filter((e) => e.search("index") == -1)
        //   .join("/");
        fs.writeFileSync(indexUrl, createBaseHydration(routes[r]));
    
        if (r == "/") {
          entry.push({ name: "main", url: indexUrl, com: renderedHtml });
        } else {
          let name = r.split("/").join("_").trim();
          entry.push({ name, url: indexUrl, com: renderedHtml });
        }
      }
    }




   
  





let pack = async(entry) => {
  return new Promise((res,rej)=>{
    webpack(
      {
        entry: entry.url,
        output: {
          filename: `${entry.name}.bundle.js`,
          path: __dirname + `/dist/final/${entry.name}/`,
        },
        mode: "production",
        module: {
          rules: [
            {
              test: /.(js|jsx)$/,
              exclude: /node_modules/,
              loader: "babel-loader",
            },
          ],
        },
        resolve: {
          extensions: [".jsx", ".js"],
        },
      },
      (err, stat) => {
        if (err | stat.hasErrors()) {
          rej('error')
          console.log(err, stat);
        } else {
          res('complete')
          console.log("okay");
        }
      }
    );
  })
  console.log('here')

};



entry.forEach((r)=>{
  pack(r).then(re=>{
    console.log(re)
      let markup;
  markup = createHtml(r.com, `./${r.name}.bundle.js`);
  fs.writeFileSync(__dirname + `/dist/final/${r.name}/index.html`, markup);
  }).catch(er=>{
    console.log(er)
  })
})

// const bundle = async () => {
//   console.log(entry)
//   await step1()
//   console.log(entry)
// }

// bundle()