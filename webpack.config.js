var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        "wheelpicker": "./src/WheelPicker.js"
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
        new ExtractTextPlugin("[name].min.css")
    ],
    postcss: function () {
        return [autoprefixer];
    }
};
