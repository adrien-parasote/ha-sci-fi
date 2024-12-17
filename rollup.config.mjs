import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
	input: 'temp/sci-fi.js',
	output: {
		file: 'sci-fi.min.js',
		name: 'version',
		format: 'iife'
	},
	onwarn(warning) {
		if (warning.code !== 'THIS_IS_UNDEFINED') {
			console.error(`(!) ${warning.message}`);
		}
	},
	plugins: [
		replace({preventAssignment: false, 'Reflect.decorate': 'undefined'}),
		resolve(),
		json(),
		minifyHTML.default(),
		terser({
			ecma: 2021,
			module: true,
			warnings: true,
			mangle: {
				properties: {
				regex: /^__/,
				},
			},
		})
	]
};