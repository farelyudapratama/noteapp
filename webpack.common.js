const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const Swal = require('sweetalert2')

module.exports = {
  entry: path.join(__dirname, "src/app.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "index.html"),
      filename: "index.html",
    }),
  ],
};
