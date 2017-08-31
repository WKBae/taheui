const gulp = require('gulp'),
	closureCompiler = require('google-closure-compiler').gulp(),
	child_process = require('child_process')

gulp.task('compile', function() {
	return gulp.src('./src/aheui.js', {base: './'})
		.pipe(closureCompiler({
			compilation_level: 'SIMPLE', // TODO ADVANCED
			warning_level: 'VERBOSE',
			language_in: 'ECMASCRIPT6_STRICT',
			language_out: 'ECMASCRIPT5_STRICT',
			js_output_file: 'aheui.min.js'
		}))
		.pipe(gulp.dest('./dist/'))
})

gulp.task('test', function(callback) {
	var child = child_process.exec('./test/snippets-standard.sh', callback)
	child.stdout.pipe(process.stdout)
	child.stderr.pipe(process.stderr)
})

gulp.task('default', ['compile'])
