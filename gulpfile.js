const del = require('del');
const { series, parallel, src, dest } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const gulpif = require('gulp-if');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

const clean = () => del([
        'public/'
    ]
);

const fonts = () => {
    return src([
        'node_modules/govuk-frontend/govuk/assets/fonts/*.woff',
        'node_modules/govuk-frontend/govuk/assets/fonts/*.woff2',
    ]).pipe(dest('public/assets/fonts'));
}

const images = () => {
    return src([
        'node_modules/govuk-frontend/govuk/assets/images/*.ico',
        'node_modules/govuk-frontend/govuk/assets/images/*.png',
        'node_modules/govuk-frontend/govuk/assets/images/*.svg'
    ]).pipe(dest('public/assets/images'));
}

const javascript = () => {
    return src('node_modules/govuk-frontend/govuk/all.js').pipe(dest('public/javascript'));
}

const html5shiv = () => {
    return src('node_modules/html5shiv/dist/html5shiv.js').pipe(dest('public/javascript'));
}

const css = () => {
    return src(['src/assets/sass/application.scss', 'src/assets/sass/application-ie8.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [
                'node_modules/govuk-frontend/govuk/all.scss',
                'node_modules/govuk-frontend/govuk/all-ie8.scss',
            ],
            sourceMap: true,
        }).on('error', sass.logError))
        .pipe(gulpif(process.env.NODE_ENV === 'production', cleanCSS()))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('public/stylesheets'));
}

exports.default = series(
    clean,
    parallel(
        fonts,
        images,
        javascript,
        html5shiv,
        css,
    ),
);
