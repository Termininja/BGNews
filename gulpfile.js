// Load plugins
var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

// Scripts
gulp.task('scripts', function () {
    return gulp.src('BGNews.Client/js/**/*.js')
		.pipe(jshint('jshintrc.json')).pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(concat('all.min.js'))
		.pipe(gulp.dest('BGNews.Client/js/'))
});

// Clean
gulp.task('clean', function() {
	return del(['BGNews.Client/js/all.min.js']);
});

// Default task
gulp.task('default', ['clean'], function() {
	gulp.start('scripts');
});

