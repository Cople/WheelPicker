const gulp = require('gulp');
const webpack = require("webpack");
const ws = require('webpack-stream');
const autoprefixer = require("autoprefixer");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const pkg = require("./package.json");

gulp.task('build:wheel-picker', (cb) => {
	const dest = './dist/';
	console.log(cb)
	const banner = `	WheelPicker v${pkg.version}
	${pkg.homepage}
	Licensed under the ${pkg.license} License`;
	return gulp.src(['./src/WheelPicker.js'])
		.pipe(ws({
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
				new webpack.optimize.UglifyJsPlugin({ minimize: true }),
				new ExtractTextPlugin("[name].min.css"),
				new webpack.BannerPlugin(banner, { entryOnly: true })
			],
			postcss: function () {
				return [autoprefixer];
			}
		}, webpack))
		.on('error', (e) => {
			cb(e);
		})
		.pipe(gulp.dest(dest));
});

gulp.task('build:wheel', (cb) => {
	const dest = './dist/';
	const banner = `	Wheel v${pkg.version}
	${pkg.homepage}
	Licensed under the ${pkg.license} License`;
	return gulp.src(['./src/Wheel.js'])
		.pipe(ws({
			entry: {
				wheel: "./src/Wheel.js"
			},
			output: {
				path: __dirname + "/dist",
				filename: "[name].min.js",
				library: "Wheel",
				libraryTarget: "umd"
			},
			module: {
				loaders: [{
					test: /\.scss$/,
					loader: ExtractTextPlugin.extract(["css", "sass-loader!postcss-loader"])
				}]
			},
			plugins: [
				new webpack.optimize.UglifyJsPlugin({ minimize: true }),
				new ExtractTextPlugin("[name].min.css"),
				new webpack.BannerPlugin(banner, { entryOnly: true })
			],
			postcss: function () {
				return [autoprefixer];
			}
		}, webpack))
		.on('error', (e) => {
			cb(e);
		})
		.pipe(gulp.dest(dest));
});

gulp.task('watch:wheel-picker', async (cb) => {
	await sleep(10000);
	const dest = './dist/';
	console.log(cb)
	const banner = `	WheelPicker v${pkg.version}
	${pkg.homepage}
	Licensed under the ${pkg.license} License`;
	return gulp.src(['./src/WheelPicker.js'])
		.pipe(ws({
			watch: true,
			watchOptions: {
				aggregateTimeout: 300,
				poll: 1000,
				ignored: /node_modules/
			},
			mode: 'none',
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
		}, webpack))
		.on('error', (e) => {
			cb(e);
		})
		.pipe(gulp.dest(dest));
});

gulp.task('watch:wheel', async (cb) => {
	await sleep(10000);
	const dest = './dist/';
	const banner = `	Wheel v${pkg.version}
	${pkg.homepage}
	Licensed under the ${pkg.license} License`;
	return gulp.src(['./src/Wheel.js'])
		.pipe(ws({
			watch: true,
			watchOptions: {
				aggregateTimeout: 300,
				poll: 1000,
				ignored: /node_modules/
			},
			mode: 'none',
			entry: {
				wheel: "./src/Wheel.js"
			},
			output: {
				path: __dirname + "/dist",
				filename: "[name].min.js",
				library: "Wheel",
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
		}, webpack))
		.on('error', (e) => {
			cb(e);
		})
		.pipe(gulp.dest(dest));
});

function sleep(timeout) {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	})
}

gulp.task('watch', gulp.parallel('watch:wheel', 'watch:wheel-picker'));

gulp.task('default', gulp.parallel('build:wheel', 'build:wheel-picker'));
