import express from "express";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static("dist"));
app.get("/", (req, res) => {

  const file = readFileSync(__dirname + "/../dist/index.html", {
    encoding: "utf8",
  });

  res.send(file);
});

app.listen(3000);
