"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();

var del = require("del");
var htmlmin = require("gulp-htmlmin");
var imagemin = require("gulp-imagemin");
var include = require("posthtml-include");
var minify = require("gulp-csso");
var posthtml = require("gulp-posthtml");
var run = require("run-sequence");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var webp = require("gulp-webp");
var uglify = require("gulp-uglify");
var pump = require("pump");


gulp.task("clean", function() {
  return del("build");
});


gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});


gulp.task("html", function() {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});


gulp.task("compress", function(cb) {
  pump([
    gulp.src("source/js/*.js"),
    rename(({ suffix: ".min" })),
    uglify(),
    gulp.dest("build/js")
    ],
  cb
  );
});


gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
      ]))

  .pipe(gulp.dest("build/img"));
});


gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/*.html", ["html"]).on("change", server.reload);
});


gulp.task("sprite", function() {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});


gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});


gulp.task("webp", function() {
  return gulp.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});



gulp.task("build", function(done) {
  run("clean",
    "copy",
    "style",
    "compress",
    "sprite",
    "images",
    "html",
    //"webp",
    done);
});
