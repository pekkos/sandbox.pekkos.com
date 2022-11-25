
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


/* Base gulp requirements */
const gulp = require('gulp');
const { src, dest, watch, series, parallel } = require('gulp');
const exec = require('child_process').exec;
const clean = require('gulp-clean');

/* Fetch required plugins */
const copy = require('gulp-copy');

function defaultTask(cb) {
	console.log('place code for your default task here');
	cb();
}

function clean_site(cb) {
	return src('_site/*', { read: false })
		.pipe(clean());
}

function clean_site_styleguide(cb) {
	return src('_styleguide/*', { read: false })
		.pipe(clean());
}

function copy_root(cb) {
	return src('root/*')
		.pipe(copy('_site', { prefix: 1 }));
}

function copy_site_legacy(cb) {
	return src('legacy2021/**/*')
		.pipe(copy('_site', { prefix: 1 }));
}

function copy_site_styleguide(cb) {
	return src('src/_styleguide/**/*')
		.pipe(copy('_styleguide', { prefix: 2 }));
}

function weather(cb) {
	exec('curl -s http://wttr.in/Gothenburg | head -7', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
}




/* Public tasks */

/* Default */
exports.default = series(
	clean_site,
	copy_root,
	copy_site_legacy,
	weather
);


/* Deploy */
exports.deploy = series(
	clean_site,
	copy_root,
	copy_site_legacy
);

exports.deploy_styleguide = series(
	clean_site_styleguide,
	copy_site_styleguide
);


/* Single tasks */
exports.weather = weather;
exports.clean = clean_site;
exports.legacy = copy_site_legacy;
exports.root = copy_root;


