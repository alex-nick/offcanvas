const path = require( 'path' );
const PugPlugin = require( 'pug-plugin' );

module.exports = {
	watchOptions: {
		ignored: new RegExp( '.*^((?!(/src/)).)*$' ),
	},
	output: {
		path: path.join( __dirname, 'build' ),
		filename: '[name].js',
		clean: true,
	},
	plugins: [
		new PugPlugin( {
			entry: {
				index: `./src/index.pug`,
			},
			js: {
				filename: 'js/[name].js',
			},
			css: {
				filename: 'css/[name].css',
			},
		} ),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [ 'css-loader', 'postcss-loader' ],
			},
			{
				test: /\.(ico|png|jp?g|webp|svg)$/,
				type: 'asset/resource',
				generator: {
					filename: 'img/[name].[ext]',
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[name].[ext]',
				},
			},
		],
	},
};
