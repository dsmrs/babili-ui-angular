(function () {
  "use strict";

  module.exports = function (grunt) {

    grunt.initConfig({
      jshint: {
        files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"],
        options: {
          reporter: require("jshint-stylish")
        }
      },
      concat: {
        js: {
          src: ["src/babili_ui.js", "src/**/*.js"],
          dest: "dist/babili-ui_without_templates.js"
        },
        dist: {
          src: ["dist/babili-ui_without_templates.js", "dist/babili-ui_templates.js"],
          dest: "dist/babili-ui.js"
        }
      },
      ngAnnotate: {
        options: {},
        js: {
          src: ["dist/babili-ui_without_templates.js"],
          dest: "dist/babili-ui_without_templates.js"
        }
      },
      ngtemplates: {
        "babili-ui": {
          src:      "src/**/*.html",
          dest:     "dist/babili-ui_templates.js"
        }
      },
      sass: {
        dist: {
          options: {
            sourcemap: "none",
            style: "expanded"
          },
          files: {
            "dist/babili-ui.css": ["src/**/*.scss"]
          }
        }
      },
      uglify: {
        "babili-ui": {
          files: {
            "dist/babili-ui.min.js": ["dist/babili-ui.js"]
          }
        }
      },
      cssmin: {
        options: {
          shorthandCompacting: false,
          roundingPrecision: -1
        },
        target: {
          files: {
            "dist/babili-ui.min.css": ["dist/babili-ui.css"]
          }
        }
      },
      watch: {
        scripts: {
          files: ["src/**/*.js", "src/**/*.scss", "src/**/*.html"],
          tasks: ["build"],
          options: {
            spawn: false
          }
        }
      },
      clean: {
        tmp: [".tmp", "dist/babili-ui_templates.js", "dist/babili-ui_without_templates.js"]
      }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-angular-templates");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-ng-annotate");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.registerTask("default", ["build"]);
    grunt.registerTask("dev", ["build", "watch"]);
    grunt.registerTask("build", ["jshint", "concat:js", "sass", "ngtemplates", "ngAnnotate",
                                 "concat:dist", "uglify", "cssmin", "clean"]);
  };
}());
