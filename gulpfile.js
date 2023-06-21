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

	'$ gulp' 					[Runs through all build steps, use it locally]

*/


/* -----------------------------------------------------------------------------
 * Gulp requirements and plugins
 * -------------------------------------------------------------------------- */

/* Base gulp requirements */
const gulp = require('gulp');
const { src, dest, watch, series, parallel } = require('gulp');
const exec = require('child_process').exec;
const clean = require('gulp-clean');

/* Fetch required plugins */
const copy = require('gulp-copy');

/* -----------------------------------------------------------------------------
 * Gulp tasks
 * -------------------------------------------------------------------------- */

function defaultTask(cb) {
	console.log('place code for your default task here');
	cb();
}

function weather(cb) {
	exec('curl -s http://wttr.in/Gothenburg | head -7', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
}


/* -----------------------------------------------------------------------------
 * Public Gulp tasks
 * -------------------------------------------------------------------------- */

/* Default */
exports.default = series(
	weather
);

