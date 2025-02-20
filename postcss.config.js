module.exports = {
	plugins: {
		'@tailwindcss/postcss': {},
		'postcss-preset-env': {
			browsers: 'defaults',
			autoprefixer: {
				flexbox: false,
			},
		},
	},
};
