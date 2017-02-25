// Storm Framework
// by Emmanuel Zarzosa (zarzosa.me)
// github.com/zarzosa/storm-framework (MIT License)

// Includes
var gulp = require('gulp'),
		runSequence = require('run-sequence'),
		plugins = require('gulp-load-plugins')({
			pattern: ['gulp-*', 'gulp.*'],
			replaceString: /\bgulp[\-.]/,
			lazy: true,
			camelize: true
		});

var browserSync = require('browser-sync').create();

// Config
var config = require('./config.json');
var build = false;

// --- --- --- DEFAULT --- --- --- //

// Default Task
gulp.task('default', function() {
	runSequence(
			'dev'
	);
});

// --- --- --- TASKS --- --- --- //

// Dev Task
gulp.task('dev', function() {
	if (config.sync.enabled){
		runSequence(
			'pages', ['styles', 'scripts', 'images', 'watch'], 'browser-sync'
		);
	}else{
		runSequence(
			'pages', ['styles', 'scripts', 'images', 'watch']
		);
	}
});

// Build Task
gulp.task('build', function() {
	build = true;
	runSequence(
		'pages', ['styles', 'scripts', 'images'], 'webstandards'
	);
});

// --- --- --- STYLES --- --- --- //

// - STYLES -
gulp.task('styles', function() {
	if(build){
		runSequence('sass', 'autoprefixer', 'cleancss', 'uncss');
	}else{
		runSequence('sass');
	}
});
// SASS
gulp.task('sass', function() {
	return gulp.src(config.path.source+config.path.styles.source+'/**/main.scss')
		.pipe(plugins.plumber())
		.pipe(plugins.sass({
				outputStyle: config.styles.sass.outpuStyle,
				includePaths: config.styles.sass.includePaths
		}))
		.pipe(gulp.dest(config.path.distribution+config.path.styles.distribution))
		.pipe(browserSync.stream());
});
// Autoprefixer (Build)
gulp.task('autoprefixer', function() {
	return gulp.src(config.path.distribution+config.path.styles.distribution+'/**/*.css', {base: './'})
		.pipe(plugins.plumber())
    .pipe(plugins.autoprefixer({
    		browsers: config.styles.autoprefixer.browsers,
      	cascade: config.styles.autoprefixer.cascade
    }))
    .pipe(gulp.dest('./'))
});
// Clean CSS (Build)
gulp.task('cleancss', function() {
	return gulp.src(config.path.distribution+config.path.styles.distribution+'/**/*.css', {base: './'})
		.pipe(plugins.plumber())
    .pipe(plugins.cleancss({
				keepBreaks: config.styles.cleancss.keepBreaks
		}))
    .pipe(gulp.dest('./'));
});
// UnCSS (Build)
gulp.task('uncss', function() {
	return gulp.src(config.path.distribution+config.path.styles.distribution+'/**/*.css', {base: './'})
		.pipe(plugins.plumber())
    .pipe(plugins.uncss({
    		html: [config.path.distribution+config.path.pages.distribution+'/**/*.html']
    }))
    .pipe(gulp.dest('./'));
});

// --- --- --- SCRIPTS --- --- --- //

// - SCRIPTS -
gulp.task('scripts', function() {
	if(build){
		runSequence('uglify');
	}else{
		runSequence('copy-scripts');
	}
});
// UglifyJS
gulp.task('uglify', function() {
	return gulp.src(config.path.source+config.path.scripts.source+'/**/*.js')
		.pipe(plugins.plumber())
		.pipe(plugins.uglify())
		.pipe(gulp.dest(config.path.distribution+config.path.scripts.distribution));
});
// Copy Scripts
gulp.task('copy-scripts', function() {
	return gulp.src(config.path.source+config.path.scripts.source+'/**/*.js')
		.pipe(plugins.plumber())
		.pipe(gulp.dest(config.path.distribution+config.path.scripts.distribution));
});
// --- --- --- PAGES --- --- --- //

// - PAGES -
gulp.task('pages', function() {
	if(build){
		runSequence('htmlmin');
	}else{
		runSequence('copy-pages');
	}
});
// HTML Min
gulp.task('htmlmin', function() {
	return gulp.src(config.path.source+config.path.pages.source+'/**/*.html')
		.pipe(plugins.plumber())
		.pipe(plugins.htmlmin({
				collapseWhitespace: config.pages.htmlmin.collapseWhitespace
		}))
		.pipe(gulp.dest(config.path.distribution+config.path.pages.distribution));
});
// Copy Pages
gulp.task('copy-pages', function() {
	return gulp.src(config.path.source+config.path.pages.source+'/**/*.html')
		.pipe(plugins.plumber())
		.pipe(gulp.dest(config.path.distribution+config.path.pages.distribution));
});

// --- --- --- IMAGES --- --- --- //

// - IMAGES -
gulp.task('images', function() {
	runSequence('imagemin');
	if(build){
		runSequence('imagemin');
	}else{
		runSequence('copy-images');
	}
});
// Image Min
gulp.task('imagemin', function() {
	return gulp.src(config.path.source+config.path.images.source+'/**/*.{jpg,jpeg,png,gif,svg}')
		.pipe(plugins.plumber())
		.pipe(plugins.imagemin())
		.pipe(gulp.dest(config.path.distribution+config.path.images.distribution));
});
// Copy Images
gulp.task('copy-images', function() {
	return gulp.src(config.path.source+config.path.images.source+'/**/*.{jpg,jpeg,png,gif,svg}')
		.pipe(plugins.plumber())
		.pipe(gulp.dest(config.path.distribution+config.path.images.distribution));
});
// --- --- --- WATCH --- --- --- //

// - WATCH -
gulp.task('watch', function() {
	gulp.watch(config.path.source+config.path.styles.source+'/**/*.scss', ['styles']);
	gulp.watch(config.path.source+config.path.scripts.source+'/**/*.js', ['scripts']).on('change', browserSync.reload);
	gulp.watch(config.path.source+config.path.pages.source+'/**/*.html', ['pages']).on('change', browserSync.reload);
	gulp.watch(config.path.source+config.path.images.source+'/**/*.{jpg,jpeg,png,gif,svg}', ['images']);
});

// --- --- --- TEST --- --- --- //

// - WebStandards -
gulp.task('webstandards', function () {
  return gulp.src(config.path.distribution+'/**/*')
  	.pipe(plugins.webstandards());
});

// --- --- --- SYNC --- --- --- //

// - BrowserSync -
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: config.path.distribution
        },
				port: config.sync.browserSync.options.port,
				ui: {
					port: config.sync.browserSync.options.ui.port
				}
    });
});
