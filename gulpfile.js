"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var run = require("run-sequence");
var del = require("del");
var fileinclude = require('gulp-file-include');

gulp.task("style", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("assamble-html", function(){
  gulp.src("source/html/index.html")
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest("source/"))
    .pipe(server.stream());
})

gulp.task("style-build", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("serve", ["assamble-html", "style"], function() {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("source/*.html").on("change", server.reload);
  gulp.watch("source/html/*.html",  ["assamble-html"]).on("change", server.reload);
});

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png,svg,jpg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3}),
      imagemin.jpegtran({ poregressive: true }),
      imagemin.svgo()
    ]))

    .pipe(gulp.dest("source/img"))
});

gulp.task("webp", function() {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 90}))
    .pipe(gulp.dest("source/img"))
});

gulp.task("sprite-build", function() {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
});

gulp.task("html-build", function() {
  return gulp.src("source/*.html")
  /* <include src="source/img/sprite.svg"></include> */
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"))
});

gulp.task("build", function(done) {
  run("clean", "copy", "style-build", "sprite-build", "html-build", done)
})

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
  ], {
    /* Сохраняет всю вложенность папок в build. ie: build/fonts/... */
    base: "source"
  })
  .pipe(gulp.dest("build"))
})

gulp.task("clean", function() {
  del("build")
})
