var webpack = require("webpack");
var autoprefixer = require("autoprefixer");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var pkg = require("./package.json");
var banner = `WheelPicker v${pkg.version}
${pkg.homepage}
Licensed under the ${pkg.license} License`;

module.exports = {
    entry: {
        wheelpicker: "./src/WheelPicker.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].min.js",
        library: "WheelPicker",
        libraryTarget: "umd"
    },
    module: {
        loaders: [{
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(["css", "sass-loader!postcss-loader"])
        }]
    },
    plugins: [
        new ExtractTextPlugin("[name].min.css"),
        new webpack.BannerPlugin(banner, { entryOnly: true })
    ],
    postcss: function () {
        return [autoprefixer];
    }
};
