var path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSass = new ExtractTextPlugin('style.css');

module.exports = {
	entry: {
		bundle: './src/index.js',
	},
  	output: {
	    path: path.join(__dirname, 'dist'),
	    filename: '[name].js',
	    // publicPath: 'js-tic-tac-toe/'
  	},
  	devtool: "source-map",
	module: {
		rules: [
		    {test: /\.(jpe?g|png|gif|svg)$/, loader: 'file-loader?name=assets/[name].[ext]'},
			{ 
				test: /\.js$/, 
				exclude: /node_modules/, 
				loader: 'babel-loader' 
			},
			{
	            test: /\.scss$/,
	            loader: extractSass.extract({
	                loader: [{
		                loader: "css-loader", options: {
		                    sourceMap: true
		                }
		            }, {
		                loader: "sass-loader", options: {
		                    sourceMap: true
		                }
		            }]
	            })
	        }
		]
	},
	plugins: [
        extractSass
    ]
};