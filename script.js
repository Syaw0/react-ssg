import fs, { read, readdirSync, readFileSync, writeFileSync } from "fs";
import MiniCssExtract from "mini-css-extract-plugin";
import path from "path";
import { fileURLToPath } from "url";
import babel from "@babel/core";
import webpack from "webpack";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { execSync } from "child_process";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ssr = false;

try {
  fs.rmSync(__dirname + "/dist", { recursive: true });
} catch (err) {}

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

let createBaseRender = (url) => {
  return `
    import React from 'react';
    import ReactDOM from "react-dom/client";
    import Index from '${url}'
    const root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(<Index/>)

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
      <script async src="${script}"></script>
      <title>Document</title>
    </head>
    <body>
      <div id="root">${com}</div>
    </body>
  </html>
  `;
};
fs.cpSync(__dirname + "/src/", __dirname + "/dist/tmp/src", {
  recursive: true,
});

let entry = [];

let loop = Object.keys(routes);
for await (let r of loop) {
  if (routes[r] != "") {
    let indexUrl = routes[r];
    indexUrl = indexUrl.split("/");
    indexUrl[indexUrl.length - 1] = "indexHydrate.js";
    indexUrl = indexUrl.join("/");

    // transpile css only

    // const readCode = fs.readFileSync(routes[r], { encoding: "utf-8" });
    // const transpiledCode = babel.transformSync(readCode, {
    //   plugins: [
    //     [
    //       "babel-plugin-webpack-loaders",
    //       { config: "./css-transform-config.js" },
    //     ],
    //   ],
    // }).code;

    // console.log(transpiledCode);
    // console.log("hello");
    // console.log(routes[r]);
    // fs.writeFileSync(routes[r], transpiledCode);

    // console.log("done");
    // const component = await import(routes[r]);
    // console.log("here>");
    // const renderedHtml = ReactDOMServer.renderToString(component.default());
    // let htmlUrl = indexUrl
    //   .split("/")
    //   .filter((e) => e.search("index") == -1)
    //   .join("/");
    if (!ssr) {
      fs.writeFileSync(indexUrl, createBaseRender(routes[r]));
    } else {
      fs.writeFileSync(indexUrl, createBaseHydration(routes[r]));
    }

    if (r == "/") {
      entry.push({ name: "main", url: indexUrl });
      // com: renderedHtml
    } else {
      let name = r.split("/").join("_").trim();
      entry.push({ name, url: indexUrl });
    }
  }
}
let en = {};
let ht = [];
entry.forEach((t) => {
  en[t.name] = t.url;
  ht.push(
    new HtmlWebpackPlugin({
      filename: `${t.name}.html`,
      chunks: [t.name],
      templateContent: ({ htmlWebpackPlugin }) => `
    <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  `,
    })
  );
});

console.log(ht);

let pack = async (entry) => {
  return new Promise((res, rej) => {
    webpack(
      {
        entry: en,
        output: {
          filename: `[name].bundle.js`,
          path: __dirname + `/dist/final/`,
        },
        mode: "production",
        module: {
          rules: [
            {
              test: /.(js|jsx)$/,
              exclude: /node_modules/,
              loader: "babel-loader",
            },
            {
              test: /.css$/,
              use: [
                MiniCssExtract.loader,
                {
                  loader: "css-loader",
                  options: {
                    importLoaders: 1,
                    modules: {
                      mode: "local",
                      localIdentName: "[hash:base64:5]",
                    },
                  },
                },
              ],
              include: /\.module\.css$/,
            },
          ],
        },
        resolve: {
          extensions: [".jsx", ".js"],
        },
        plugins: [...ht, new MiniCssExtract()],
      },
      (err, stat) => {
        if (err | stat.hasErrors()) {
          rej("error");
          console.log(err, stat);
        } else {
          res("complete");
          console.log("okay");
        }
      }
    );
  });
};

const baseServer = `
import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static("dist/final"));

//next

app.listen(3000);
`;

const makeEndPoint = (url, path) => {
  return `\n
  app.get('${url}',(req,res)=>{
    const file = readFileSync("${path}", {
      encoding: "utf-8",
    });
  
    res.send(file);
  })
  \n
  //next
  `;
};

fs.mkdirSync(__dirname + "/dist/final");
fs.writeFileSync(__dirname + "/dist/server.js", baseServer);

entry.forEach((r) => {
  pack(r)
    .then((re) => {
      // let markup;
      // markup = createHtml(r.com, `./${r.name}.bundle.js`);
      // fs.writeFileSync(__dirname + `/dist/final/index-${r.name}.html`, markup);

      let server = fs.readFileSync(__dirname + "/dist/server.js", {
        encoding: "utf-8",
      });

      if (r.name == "main") {
        let x = makeEndPoint("/", __dirname + `/dist/final/${r.name}.html`);
        server = server.replace(
          "//next",
          makeEndPoint("/", __dirname + `/dist/final/${r.name}.html`)
        );
        fs.writeFileSync(__dirname + "/dist/server.js", server);
      } else {
        server = server.replace(
          "//next",
          makeEndPoint(
            r.name.split("_").join("/"),
            __dirname + `/dist/final/${r.name}.html`
          )
        );
        fs.writeFileSync(__dirname + "/dist/server.js", server);
      }
    })
    .catch((er) => {
      console.log(er);
    });
});
