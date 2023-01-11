import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "myBundle.js",
  },
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
  },

  module: {
    rules: [
      { test: /.(js|jsx)$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /.(ts|tsx)$/, exclude: /node_modules/, loader: "ts-loader" },
    ],
  },

  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
  },
  plugins: [new HtmlWebpackPlugin({ template: "./index.html" })],
};
