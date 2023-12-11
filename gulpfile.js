/*                                    lllllll
									  l:::::l
									  l:::::l
									  l:::::l
   ggggggggg   ggggguuuuuu    uuuuuu   l::::lppppp   ppppppppp
  g:::::::::ggg::::gu::::u    u::::u   l::::lp::::ppp:::::::::p
 g:::::::::::::::::gu::::u    u::::u   l::::lp:::::::::::::::::p
g::::::ggggg::::::ggu::::u    u::::u   l::::lpp::::::ppppp::::::p
g:::::g     g:::::g u::::u    u::::u   l::::l p:::::p     p:::::p
g:::::g     g:::::g u::::u    u::::u   l::::l p:::::p     p:::::p
g:::::g     g:::::g u::::u    u::::u   l::::l p:::::p     p:::::p
g::::::g    g:::::g u:::::uuuu:::::u   l::::l p:::::p    p::::::p
g:::::::ggggg:::::g u:::::::::::::::uul::::::lp:::::ppppp:::::::p
 g::::::::::::::::g  u:::::::::::::::ul::::::lp::::::::::::::::p
  gg::::::::::::::g   uu::::::::uu:::ul::::::lp::::::::::::::pp
	gggggggg::::::g     uuuuuuuu  uuuullllllllp::::::pppppppp
			g:::::g                           p:::::p
gggggg      g:::::g                           p:::::p
g:::::gg   gg:::::g                          p:::::::p
 g::::::ggg:::::::g                          p:::::::p
  gg:::::::::::::g                           p:::::::p
	ggg::::::ggg                             ppppppppp
	   gggggg

https://gulpjs.com/
*/

/**
 * Exported / Public tasks
 *
 *	'$ gulp css'				[Process Sass and CSS to files]
 *	'$ gulp fractal_start 		[Start a local fractal web server with browser sync]
 *	'$ gulp fractal_build 		[Build a static styleguide]
 *	'$ gulp deploy_legacy'		[Deploys the legacy github.io site, use it on Main/www]
 *	'$ gulp deploy_styleguide	[Builds and deploys a static styleguide]
 */

/**
 * Outside Gulp
 *
 *	'$ npm run 11ty_dev'		[Deploys the site in development environment]
 *	'$ npm run 11ty_www'		[Deploys the site in production environment]
 */





/* -----------------------------------------------------------------------------
 * Gulp requirements and plugins
 * -------------------------------------------------------------------------- */

/* Base gulp requirements */
const gulp = require('gulp');
const { src, dest, watch, series, parallel } = require('gulp');
const exec = require('child_process').exec;
const clean = require('gulp-clean');
const copy = require('gulp-copy');
const rename = require("gulp-rename");
const size = require('gulp-size');

/* Fetch required modules */
const sass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const cleanCSS = require('gulp-clean-css');
const csscomb = require('gulp-csscomb'); /* https://github.com/csscomb/csscomb.js */

/* Fetch PostCSS plugins */
const postcssNormalize = require('postcss-normalize');
// Autoprefixer - base on .browserslistrc
// https://github.com/postcss/autoprefixer
const autoprefixer = require('autoprefixer');
const stylelint = require('stylelint');
const reporter = require('postcss-reporter');
const scssParser = require('postcss-scss');






/* -----------------------------------------------------------------------------
 * Gulp tasks
 * -------------------------------------------------------------------------- */

function defaultTask(cb) {
	console.log("No default task defined");
	cb();
}

function clean_site(cb) {
	return src('_site/*', { read: false })
		.pipe(clean()
		.on('end', function () {
			console.log('Site destination folder cleaned.')
		})
	);
}

function clean_styleguide(cb) {
	return src('_styleguide/*', { read: false })
		.pipe(clean()
		.on('end', function () {
			console.log('Styleguide destination folder cleaned.')
		})
	);
}

function copy_site_assets(cb) {
	return src('src/_static/assets/**/*')
		.pipe(copy('_site', { prefix: 2 })
		.on('end', function () {
			console.log('Assets folder copied from styleguide to site.')
		})
	);
}

function copy_processed_css(cb) {
	return src('src/css/*')
		.pipe(copy('src/_static/assets', { prefix: 1 }))
		.on('end', function () {
			console.log('CSS files copied to the styleguide assets folder.')
		});
}


/* -----------------------------------------------------------------------------
 * CSS tasks
 * -------------------------------------------------------------------------- */


/**
 * Tidy upp Sass using CombCSS
 */

function combCSS(cb) {
	return gulp
		.src([
			'src/**/*.scss'
		])
		.pipe(csscomb())
		.pipe(gulp.dest('src/'))
		.pipe(size({
			title: 'Combed',
			showFiles: true
		}))
		.on('end', function () {
			console.log('Sass partials sorted and combed')
		});
}


/**
 * Lint Sass using Stylelint
 */

function postCSSstylelint(cb) {
	const plugins = [
       stylelint(),
        reporter({"clearReportedMessages": true})
 	];

	return gulp
		.src([
			'src/**/*.scss'
		])
		.pipe(postcss(plugins))
		.pipe(gulp.dest('src/'))
		// .pipe(size({
		// 	title: 'Linted',
		// 	showFiles: true
		// }))
		.on('end', function () {
			console.log('Sass partials linted')
		});
}

/* Pre-process Sass files to CSS */

function processSass() {
	return gulp
		.src([
			'src/css/sass/*.scss'
		])
		.pipe(sassGlob())
		.pipe(sass({
			outputStyle: 'expanded'
		})
			.on('error', sass.logError))
		.pipe(gulp.dest('src/css'))
		.pipe(size({
			title: 'Processed Sass to',
			showFiles: true
		}))
		.on('end', function () {
			console.log('Sass processed to CSS.')
		});
}


/**
 * Import Normalize based on Browserslist using PostCSS
 */

function postCSSnormalize(cb) {
	const plugins = [
		postcssNormalize()
	];

	return gulp
		.src([
			'src/css/*.css',
			'!src/css/*.min.css'
		])
		.pipe(postcss(plugins))
		.pipe(gulp.dest('src/css'))
		.pipe(size({
			title: 'Inject Normalize to',
			showFiles: true
		}))
		.on('end', function () {
			console.log('Normalized injected using PostCSS and Browserslist.')
		});
}

/**
 * Inject vendor prefixes based on Browserslist uring PostCSS
 */


function postCSSautoprefixer(cb) {
	const plugins = [
		autoprefixer()
	];

	return gulp
		.src([
			'src/css/*.css',
			'!src/css/*.min.css'
		])
		.pipe(postcss(plugins))
		.pipe(gulp.dest('src/css'))
		.pipe(size({
			title: 'Inject vendor prefixer to',
			showFiles: true
		}))
		.on('end', function () {
			console.log('Vendor prefixes auto injected using PostCSS and Browserslist.')
		});
}


/**
 * Minify processed CSS
 */

function minifyCSS(cb) {
	return gulp
		.src([
			'src/css/*.css',
			'!src/css/*.min.css'
			])
		.pipe(cleanCSS({debug: true}, (details) => {
			console.log(`${details.name} minified from ${details.stats.originalSize} to ${details.stats.minifiedSize}`);
		}))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest('src/css')
	);
}

/**
 * Copy post-processed and minified CSS to static assets folder
 */

function copyCSSassets() {
	return src(["src/css/*.css", "src/css/*.min.css"])
		.pipe(copy("src/_static/assets/css", { prefix: 2 }))
		.pipe(
			size({
				title: "Copy processed CSS file:",
				showFiles: true,
			})
		)
		.on("end", function () {
			console.log(
				"Post-processed CSS files copied to the static assets folder"
			);
		});
}





// gulp.task('styles', function() {
//   return gulp.src('src/styles/main.css')
//     .pipe(csscomb())
//     .pipe(gulp.dest('./build/css'));
// });

// const fs = require("fs");
// const less = require("postcss-less");
// const postcss = require("postcss");

// // Code to be processed
// const code = fs.readFileSync("input.less", "utf8");

// postcss([
//   require("stylelint")({
//     /* your options */
//   }),
//   require("postcss-reporter")({ clearReportedMessages: true })
// ])
//   .process(code, {
//     from: "input.less",
//     syntax: less
//   })
//   .then(() => {})
//   .catch((err) => console.error(err.stack));

/* -----------------------------------------------------------------------------
 * Fractal configuration and tasks
 *
 * Fractal settings documentation can be found here:
 * https://fractal.build/guide/project-settings.html#the-fractal-js-file
 * -------------------------------------------------------------------------- */

/**
 * Base Fractal requirements
 */

const fractal = require('@frctl/fractal').create();
const logger = fractal.cli.console;



/**
 * Fractal configuration
 */

/* Set the title of the project */
fractal.set('project.title', 'sandbox styleguide');

/* Tell Fractal where the components will live */
fractal.components.set('path', __dirname + '/src/fractal/patterns');
fractal.components.set('label', 'Patterns');
fractal.components.set('title', 'Patterns');

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', __dirname + '/src/fractal/docs');

/* Specify a directory of static assets */
fractal.web.set('static.path', __dirname + '/src/_static');

/* Set the static HTML build destination */
fractal.web.set('builder.dest', __dirname + '/_styleguide');

/* Preview */
fractal.components.set('default.preview', '@preview');
fractal.components.set('collate.preview', '@collate');



/**
 * Customized Styleguide theme
 */

/* Require the Mandelbrot theme module */
const mandelbrot = require('@frctl/mandelbrot');

/* Create a new instance with custom config options */
const myCustomisedTheme = mandelbrot({
	"styles": [
		"/styleguide.css",
		"default"
	]
});

/* Tell Fractal to use the configured theme by default */
fractal.web.theme(myCustomisedTheme);


/**
 * Adding a SVG inline helper
 */

const hbs = require('@frctl/handlebars')({});
const instance = fractal.components.engine(hbs);

var fs = require('fs');
instance.handlebars.registerHelper('svg', function (iconName) {
	let path = __dirname + '/project/static/icons/' + iconName + '.svg';
	let content = fs.readFileSync(path, 'utf8');
	return content;
});



/**
 * Fractal tasks
 */

/* Start a localhost:3000 web server with browser sync */
function fractal_start() {
	const server = fractal.web.server({
		sync: true
	});
	server.on('error', err => logger.error(err.message));
	return server.start().then(() => {
		logger.success(`Fractal server is now running at ${server.url}`);
	});
}

/* Build a static web site */
function fractal_build() {
	const builder = fractal.web.builder();
	builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
	builder.on('error', err => logger.error(err.message));
	return builder.start().then(() => {
		logger.success('Fractal build completed!');
	});
}





/* -----------------------------------------------------------------------------
 * Public Gulp tasks
 * -------------------------------------------------------------------------- */

/* Default */
exports.default = defaultTask;


/**
 * CSS
 */

exports.css = series(
	combCSS,
	postCSSstylelint,
	processSass,
	postCSSnormalize,
	postCSSautoprefixer,
	minifyCSS,
	copyCSSassets
);

/* Verified */
exports.css_comb = combCSS;
exports.css_lint = postCSSstylelint;
exports.css_sass = processSass;
exports.css_norm = postCSSnormalize;
exports.css_prefix = postCSSautoprefixer;
exports.css_min = minifyCSS;
exports.css_assets = copyCSSassets;
/* Unverified */


/* Fractal */
exports.fractal_start = fractal_start;
exports.fractal_build = fractal_build;


/* Fractal pipeline */
exports.fractal = series(
//	css,
	clean_styleguide,
	fractal_build
);

/* Eleventy pre pipeline */
exports.pre_11ty = series(
	clean_site,
	copy_site_assets
);

/* Eleventy post pipeline */
// exports.post_11ty = series(
// );


