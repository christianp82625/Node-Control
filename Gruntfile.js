'use strict';

module.exports = function(grunt) {

//  //Load NPM tasks
//  grunt.loadNpmTasks('grunt-shell');
//  grunt.loadNpmTasks('grunt-contrib-watch');
//  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-concat');
//  grunt.loadNpmTasks('grunt-mocha-test');
//  grunt.loadNpmTasks('grunt-karma');
//  grunt.loadNpmTasks('grunt-nodemon');
//  grunt.loadNpmTasks('grunt-concurrent');
//  grunt.loadNpmTasks('grunt-env');

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

    // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell: {
      options : {
        stdout: true
      },
      npm_install: {
        command: 'npm install'
      },
      bower_install: {
        command: './node_modules/.bin/bower install'
      },
      font_awesome_fonts: {
        command: 'cp -R bower_components/components-font-awesome/font app/font'
      },
      install_selenium: {
        command: './node_modules/protractor/bin/webdriver-manager update'
      },
      run_selenium: {
        command: 'node_modules/protractor/bin/webdriver-manager start --standalone'
      }
    },
    watch: {
      assets: {
        files: ['public/app/css/**/*.css','public/app/scripts/**/*.js', 'Gruntfile.js'],
        tasks: ['concat'],
        options: {
          livereload: true
        }
      },
      html: {
        files: ['public/app/scripts/templates/**', 'public/app/index.html'],
        options: {
          livereload: true
        }
      }
    },
    concat: {
      styles: {
        dest: './public/app/assets/app.css',
        src: [
          './public/app/css/bootstrap/font-awesome/css/font-awesome.css',
          './public/app/js/angular-slider/angular-slider.min.css',
          './public/app/css/bootstrap/css/bootstrap.min.css',
          './public/app/js/ng-grid/ng-grid.css',
          './public/app/css/traceroute/traceroute.css',
          './public/app/js/select2/select2.css',
          './public/app/js/joint/joint.all.min.css',
          './public/app/css/designer/toolbar.css',
          './public/app/css/designer/statusbar.css',
          './public/app/css/designer/halo.css',
          './public/app/css/designer/freetransform.css',
          './public/app/css/designer/layout.css',
          './public/app/css/designer/selection.css',
          './public/app/css/designer/paper.css',
          './public/app/css/designer/stencil.css',
          './public/app/css/designer/inspector.css',
          './public/app/css/designer/designer.css',
          './public/app/css/designer/tooltip.css',
          './public/app/js/angular-growl/angular-growl.min.css',
          './public/app/js/ngprogress-lite/ngprogress-lite.css',
          './public/app/css/app/style.css'
        ]
      },
      scripts: {
        options: {
          separator: ';'
        },
        dest: './public/app/assets/app.js',
        src: [
          './public/app/js/joint/joint.all.min.js',
          './public/app/js/angular/angular.js',
          './public/app/js/angular/angular-route.js',
          './public/app/js/angular/angular-strap.min.js',
          './public/app/js/angular-slider/angular-slider.min.js',
          './public/app/js/restangular/restangular.min.js',
          './public/app/js/angular-growl/angular-growl.min.js',
          './public/app/js/ngprogress-lite/ngprogress-lite.min.js',
          './public/app/js/ng-grid/ng-grid-2.0.7.debug.js',
          './public/app/js/go/go-debug.js',
          './public/app/js/script-loader/script.min.js',
          './public/app/js/ui-utils/modules/keypress/keypress.js',
          './public/app/js/select2/select2.min.js',
          './public/app/js/select2/select2.angular.js',
          './public/app/js/traceroute/LightLinkView.js',
          './public/app/js/traceroute/joint.viz.Traceroutes.js',
          './public/app/js/traceroute/joint.shapes.traceroutes.js',
          './public/app/js/traceroute/joint.viz.HopDiagram.js',
          './public/app/js/joint/keyboard.js',
          './public/app/js/angularjs-scope.safeapply/src/Scope.SafeApply.js',
//          This version is broken modals in Agents. We should figure it out.
//          './public/app/js/ui-bootstrap/ui-bootstrap.min.js',
          './public/app/js/ui-bootstrap/ui-bootstrap-tpls-0.8.0.min.js',
          './public/app/scripts/lib/router.js',
          './public/app/scripts/config/config.js',
          './public/app/scripts/services/**/services.js',
          './public/app/scripts/services/joint.js',
          './public/app/scripts/directives/**/directives.js',
          './public/app/scripts/controllers/**/controllers.js',
          './public/app/scripts/filters/filters.js',
          './public/app/scripts/config/routes.js',
          './public/app/scripts/main.js'
        ]
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'server.js',
          args: [],
          ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
          watchedExtensions: ['js'],
          watchedFolders: ['app', 'config'],
          debug: true,
          delayTime: 1,
          cwd: __dirname
        }
      }
    },
    concurrent: {
      run: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      },
      appTest: {
        tasks: ['nodemon'],
        options: {
          logConcurrentOutput: true
        }
      },
      test: {
        tasks: ['shell:run_selenium', 'concurrent:appTest', 'protractor:run'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    mochaTest: {
      options: {
        require: 'should',
        reporter: 'spec',
        ui: 'bdd'
      },
      src: ['test/unit/**/*.js']
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    protractor: {
      options: {
        keepAlive: true,
        configFile: "protractor.conf.js"
      },
      run: {}
    }
  });

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //installation-related
  grunt.registerTask('install', ['shell:npm_install','shell:bower_install','shell:font_awesome_fonts']);

  //Test task.
  grunt.registerTask('unit_test', [ 'mochaTest' ]);
  grunt.registerTask('e2e_test', [ 'concurrent:test' ]);

  //Default task(s).
  grunt.registerTask('default', [ 'concat', 'concurrent:run' ]);

};