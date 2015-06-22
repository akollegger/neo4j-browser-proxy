var gulp = require('gulp');
var git = require('gulp-git');
var minimist = require('minimist');

var jade = require('gulp-jade');
var coffee = require('gulp-coffee');
var stylus = require('gulp-stylus');
var nib = require('nib');
var concatCss = require('gulp-concat-css');

var concat = require('gulp-concat');
var replace = require('gulp-replace');
var gutil = require('gulp-util');
var del = require('del');

var knownOptions = {
  string: 'neo4j-branch',
  boolean: 'quiet',
  default: {
    'neo4j-branch': '2.3',
    'quiet': false
  }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('neo4j-init', function() {
  return git.addSubmodule('https://github.com/neo4j/neo4j.git', 'neo4j', {quiet: false})
  .pipe(git.updateSubmodule({args: "--init", quiet: options.quiet}));

});


gulp.task('neo4j-fetch', function() {
  return git.fetch('', '',
    {args:'', cwd:'neo4j', quiet: options.quiet}
  );
});

gulp.task('neo4j-pull', ['neo4j-fetch', 'neo4j-checkout'], function() {
  return git.pull('origin', options['neo4j-branch'],
    {args:'--rebase', cwd:'neo4j', quiet: options.quiet});
});

gulp.task('neo4j-checkout', ['neo4j-fetch'], function() {
  return git.checkout(options['neo4j-branch'],
    {args:'', cwd:'neo4j', quiet: options.quiet});
});

gulp.task('templates', function() {

  return gulp.src([
      './neo4j/community/browser/app/{views,content}/**/*.jade',
      './src/**/*.jade'])
    // fix some errors in the jade
    .pipe(replace(/^[^!]*!!!.*$/gm,
      'doctype html'))
    .pipe(replace(/^(\s*)\/(.*)/gm,
      '$1| /$2'))
    .pipe(jade({
      pretty: true,
      client: false
    }))
    .pipe(gulp.dest('./dist/'));

});

gulp.task('styles', function() {

  return gulp.src('./neo4j/community/browser/app/styles/*.styl')
    .pipe(stylus({
      use: nib(),
      compress: true,
      paths: ["./neo4j/community/browser/app/vendor/foundation", "./neo4j/community/browser/app/images"]
    }))
    .pipe(concatCss("main.css"))
    .pipe(gulp.dest('./dist/styles/'));

});

gulp.task('import-neo4j-resources', function() {

  return gulp.src([
    './neo4j/community/browser/app/{components,fonts,images}/**/*'
  ],  {base: './neo4j/community/browser/app/'})
  .pipe(gulp.dest('./dist/', {overwrite:true})); // false isn't respected until gulp 4.0

});

gulp.task('resources', ['import-neo4j-resources'], function() {

  return gulp.src([
    './src/{fonts,images}/**/*'
  ],  {base: './src/'})
  .pipe(gulp.dest('./dist/', {overwrite:true}));

});

gulp.task('coffee', function() {
  gulp.src('./neo4j/community/browser/app/scripts/**/*.coffee')
    .pipe(coffee(
      {
        bare: true,
        force: true
      }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'));
  gulp.src([
    './neo4j/community/browser/lib/visualization/neod3.coffee',
    './neo4j/community/browser/lib/visualization/components/*.coffee',
    './neo4j/community/browser/lib/visualization/utils/*.coffee',
    './neo4j/community/browser/lib/visualization/init.coffee'
  ])
  .pipe(coffee(
    {
      bare: true,
      force: true
    }).on('error', gutil.log))
  .pipe(concat('neod3.js'))
  .pipe(gulp.dest('./dist/lib/visualization/'));

});

gulp.task('clean', function(cb) {
    del(['./dist/**/*'], cb);
});

gulp.task('build',
  ['resources', 'templates', 'styles', 'coffee'],
  function() {
    gutil.log("Built it!");
});

gulp.task('default', function() {
  // place code for your default task here
});
