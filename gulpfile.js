const gulp = require('gulp'),
	closureCompiler = require('google-closure-compiler').gulp()

gulp.task('compile', function() {
	return gulp.src('./src/aheuijs.js', {base: './'})
		.pipe(closureCompiler({
			compilation_level: 'SIMPLE', // TODO ADVANCED
			warning_level: 'VERBOSE',
			language_in: 'ECMASCRIPT6_STRICT',
			language_out: 'ECMASCRIPT5_STRICT',
			js_output_file: 'aheuijs.min.js'
		}))
		.pipe(gulp.dest('./dist/'))
})

gulp.task('default', ['compile'])
