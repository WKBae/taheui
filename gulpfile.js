const gulp = require('gulp'),
	closureCompiler = require('google-closure-compiler').gulp(),
	addsrc = require('gulp-add-src'),
	child_process = require('child_process')

gulp.task('compile', function() {
	return gulp.src(["./src/*.js", "!./src/export.js"], {base: './src/'})
		.pipe(closureCompiler({
			compilation_level: 'WHITESPACE_ONLY',
			warning_level: 'VERBOSE',

			process_common_js_modules: true,
			dependency_mode: 'STRICT',
			entry_point: 'goog:aheui',

			js_output_file: '_aheui.js',
		}))
		.pipe(addsrc("./src/export.js"))
		.pipe(closureCompiler({
			compilation_level: 'SIMPLE', // TODO ADVANCED
			warning_level: 'VERBOSE',
			language_in: 'ECMASCRIPT6_STRICT',
			language_out: 'ECMASCRIPT5_STRICT',

			entry_point: 'goog:export',
			output_wrapper: '(function(){%output%}).call(this)',

			js_output_file: 'aheui.min.js',
		}))
		.pipe(gulp.dest('./dist/'))
})

gulp.task('compile-pretty', function() {
	return gulp.src(["./src/*.js", "!./src/export.js"], {base: './src/'})
		.pipe(closureCompiler({
			compilation_level: 'WHITESPACE_ONLY',
			warning_level: 'VERBOSE',

			process_common_js_modules: true,
			dependency_mode: 'STRICT',
			entry_point: 'goog:aheui',

			js_output_file: '_aheui.js',
		}))
		.pipe(addsrc("./src/export.js"))
		.pipe(closureCompiler({
			formatting: 'pretty_print',

			compilation_level: 'SIMPLE', // TODO ADVANCED
			warning_level: 'VERBOSE',
			language_in: 'ECMASCRIPT6_STRICT',
			language_out: 'ECMASCRIPT5_STRICT',

			entry_point: 'goog:export',
			output_wrapper: '(function(){%output%}).call(this)',

			js_output_file: 'aheui.min.js',
		}))
		.pipe(gulp.dest('./dist/'))
})

gulp.task('test', function(callback) {
	var child = child_process.exec('./test/snippets-standard.sh', callback)
	child.stdout.pipe(process.stdout)
	child.stderr.pipe(process.stderr)
})

gulp.task('default', ['compile'])
