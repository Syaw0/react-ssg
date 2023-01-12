// import path from "path";
// import HtmlWebpackPlugin from "html-webpack-plugin";
// import MiniCssExtract from "mini-css-extract-plugin";

// import { fileURLToPath } from "url";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// export default {
//   entry: {
//     main: "/home/siavash/Project/react-ssg/src/pages/index.tsx",
//     _contacts: "/home/siavash/Project/react-ssg/src/pages/contacts/index.tsx",
//     _contacts_id:
//       "/home/siavash/Project/react-ssg/src/pages/contacts/id/index.tsx",
//   },
//   output: {
//     path: path.resolve(__dirname, "dist"),
//     filename: "[name]-myBundle.js",
//   },
//   devtool: "inline-source-map",
//   devServer: {
//     static: "./dist",
//   },

//   module: {
//     rules: [
//       { test: /.(js|jsx)$/, exclude: /node_modules/, loader: "babel-loader" },
//       { test: /.(ts|tsx)$/, exclude: /node_modules/, loader: "ts-loader" },
//       {
//         test: /.css$/,
//         use: [
//           MiniCssExtract.loader,
//           {
//             loader: "css-loader",
//             options: {
//               importLoaders: 1,
//               modules: {
//                 mode: "local",
//                 localIdentName: "[hash:base64:10]",
//               },
//             },
//           },
//         ],
//         include: /\.module\.css$/,
//       },

//       {
//         test: /.css$/,
//         use: ["style-loader", MiniCssExtract.loader, "css-loader"],
//         exclude: /\.module\.css$/,
//       },
//     ],
//   },

//   resolve: {
//     extensions: [".tsx", ".jsx", ".ts", ".js"],
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//       filename: "./main.html",
//       chunks: ["main"],
//     }),
//     new HtmlWebpackPlugin({
//       filename: "./_contacts.html",
//       chunks: ["_contacts"],
//     }),
//     new HtmlWebpackPlugin({
//       filename: "./_contacts_id.html",
//       chunks: ["_contacts_id"],
//     }),
//     new MiniCssExtract(),
//   ],
// };
