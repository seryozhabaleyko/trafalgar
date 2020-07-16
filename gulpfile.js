const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const del = require('del');

sass.compiler = require('node-sass');

function clean(cb) {
    cb();
}

function html() {
    return src('src/*.html').pipe(dest('build'));
}

function css() {
    return src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(concat('bundle.min.css'))
        .pipe(
            autoprefixer({
                grid: 'autoplace',
                overrideBrowserslist: ['last 10 versions'],
            }),
        )
        .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
        .pipe(dest('build/css'))
        .pipe(browserSync.stream());
}

function javascript() {
    return src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(concat('bundle.min.js'))
        .pipe(dest('build/js'))
        .pipe(browserSync.stream());
}

function images() {
    return src('src/images/**/*')
        .pipe(newer('build/images'))
        .pipe(imagemin())
        .pipe(dest('build/images'));
}

function cleanImages() {
    return del('build/images/**/*', { force: true });
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: './build',
        },
        notify: false,
        online: false,
    });
}

function startWatch() {
    watch('src/*.html', html).on('change', browserSync.reload);
    watch('src/scss/**/*.scss', css);
    watch('src/js/**/*.js', javascript);
}

exports.html = html;
exports.css = css;
exports.javascript = javascript;
exports.images = images;
exports.cleanImages = cleanImages;
exports.browsersync = browsersync;

exports.dev = series(
    clean,
    parallel(html, css, javascript, images, browsersync, startWatch),
);
