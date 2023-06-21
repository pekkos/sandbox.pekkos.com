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

/* Exported / Public tasks

	'$ npm run fractal' 					[Runs through processing and deploys a styleguide]
	'$ npm run 11ty'						[Fetched assets and depoys a site]

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

/* Fetch required plugins */
const sass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob');
const cleanCSS = require('gulp-clean-css');





/* -----------------------------------------------------------------------------
 * Gulp tasks
 * -------------------------------------------------------------------------- */

function defaultTask(cb) {
	console.log('place code for your default task here');
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
		.pipe(copy('src/_static/assets', { prefix: 1 })
		.on('end', function () {
			console.log('CSS files copied to the styleguide assets folder.')
		})
	);
}

function weather(cb) {
	exec('curl -s http://wttr.in/Gothenburg | head -7', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
}





/* -----------------------------------------------------------------------------
 * CSS tasks
 * -------------------------------------------------------------------------- */

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
		.pipe(gulp.dest('src/css')
		.on('end', function () {
			console.log('Sass processed to CSS.')
		})
	);
}

/* Minify processed CSS */

function minifyCSS(cb) {
	return gulp
		.src([
			'src/css/*.css',
			'!src/css/*.min.css'
			])
		.pipe(cleanCSS())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest('src/css')
		.on('end', function () {
			console.log('CSS files minified.')
		})
	);
}





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
	return builder.build().then(() => {
		logger.success('Fractal build completed!');
	});
}





/* -----------------------------------------------------------------------------
 * Public Gulp tasks
 * -------------------------------------------------------------------------- */

/* Default */
exports.default = series(
	copy_processed_css,
	weather
);

/* Sass */
exports.sass = series(
	processSass
)

/* Fractal */
exports.fractal_start = fractal_start;
exports.fractal_build = fractal_build;


/* Fractal pipeline */
exports.fractal = series(
	clean_styleguide,
	processSass,
	minifyCSS,
	copy_processed_css,
	fractal_build,
	weather
);

/* Eleventy pre pipeline */
exports.pre_11ty = series(
	clean_site,
	copy_site_assets
);

/* Eleventy post pipeline */
exports.post_11ty = series(
	weather
);
