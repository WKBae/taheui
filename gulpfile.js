const gulp = require('gulp'),
	closureCompiler = require('google-closure-compiler').gulp(),
	child_process = require('child_process'),
	ts = require("gulp-typescript"),
	tsProject = ts.createProject("tsconfig.json")

function compile() {
	return tsProject.src()
		.pipe(tsProject())
		.js
		.pipe(closureCompiler({
			compilation_level: 'SIMPLE', // TODO ADVANCED
			warning_level: 'VERBOSE',
			language_in: 'ECMASCRIPT6_STRICT',
			language_out: 'ECMASCRIPT5_STRICT',
			js_output_file: 'aheui.min.js'
		}))
		.pipe(gulp.dest('./dist/'))
}

function compilePretty() {
	return tsProject.src()
		.pipe(tsProject())
		.js
		.pipe(closureCompiler({
			compilation_level: 'SIMPLE', // TODO ADVANCED
			warning_level: 'VERBOSE',
			language_in: 'ECMASCRIPT6_STRICT',
			language_out: 'ECMASCRIPT5_STRICT',
			js_output_file: 'aheui.min.js',
			formatting: 'pretty_print'
		}))
		.pipe(gulp.dest('./dist/'))
}

function test(callback) {
	var child = child_process.exec('./test/snippets-standard.sh', callback)
	child.stdout.pipe(process.stdout)
	child.stderr.pipe(process.stderr)
}

exports.compile = compile
exports.compilePretty = compilePretty
exports.test = test
exports.default = compile
