var path = require('path');

module.exports = function(grunt) {
  'use strict';


  var production = true;


  // # Project configuration.
  grunt.initConfig({

    // ##### Project metadata
    pkg:      grunt.file.readJSON('package.json'),
    settings: grunt.file.readYAML('settings.yml'),
    site:     grunt.file.readYAML('site.yml'),


    // ##### Before generating any new files, remove files from previous build.
    clean: {
      site:        ['<%= settings.dest %>/*'],
      docs:        ['<%= settings.docs %>/*'],
      screenshots: ['<%= settings.tests %>/visual/screenshots/*']
    },


    // ##### Lint JavaScript
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      site:    [
        'Gruntfile.js',
        '<%= settings.scripts %>/**/*.js',
        '<%= settings.components %>/**/*.js',
        '!<%= settings.scripts %>/vendor/**/*.js' // exclude vendor scripts
      ]
    },

    // ##### Compile JS | require('modules') in the browser by bundling up all of your dependencies
    browserify:{
      dist:{
        options:{
          transform: [['babelify', {presets: ['es2015']}]]
        },
        files: {
          '<%= settings.dest %>/<%= settings.assets %>/js/app.js': ['<%= settings.components %>/**/*.js']
        }
      }
    },

    // ##### Compile SASS
    sass: {
      options: {
        sourcemap: true
      },
      site:    {
        files: {
          '<%= settings.dest %>/<%= settings.assets %>/css/main.css': '<%= settings.style %>/main.scss'
        }
      }
    },


    // ##### Generate SASS import file with all atoms, molecules, organisms and templates
    sassimp: {
      site: {
        files: [
          '<%= settings.atoms %>/**/*.scss',
          '<%= settings.molecules %>/**/*.scss',
          '<%= settings.organisms %>/**/*.scss',
          '<%= settings.templates %>/**/*.scss'
        ],
        dest:  '<%= settings.style %>/_components.scss'
      }
    },


    // ##### Autoprefix CSS
    autoprefixer: {

      options: {
        // Task-specific options go here.
      },

      // prefix the specified file
      single_file: {
        options: {
          // Target-specific options go here.
          browsers: [
            '> 1%',
            'last 2 version',
            'ie 9'
          ],
          map:      true
        },
        src:     '<%= settings.dest %>/<%= settings.assets %>/css/main.css'
      }
    },


    // ##### Minify CSS
    cssmin: {
      add_banner: {
        options: {
          banner: '/* CSS */'
        },
        files:   {
          '<%= settings.dest %>/<%= settings.assets %>/css/main.min.css': ['<%= settings.dest %>/<%= settings.assets %>/css/main.css']
        }
      }
    },


    // ##### Build HTML from templates and data
    twigRender: {
      site: {
        files : [
          {
            data: ['<%= settings.data %>'],
            expand: true,
            cwd: '<%= settings.components %>',
            src: ['**/*.twig', '!**/_*.twig'], // Match twig templates but not partials
            dest: '<%= settings.dest %>/components/',
            ext: '.html'   // index.twig + datafile.json => index.html
          }
        ]
      }
    },


    // ##### Copy vendor scripts
    copy: {
      site: {
        files: [
          // includes files within path
          {
            expand: true,
            cwd:    '<%= settings.assets %>/',
            src:    [
              'js/vendor/**',
              'fonts/**',
              'images/**'
            ],
            dest:   '<%= settings.dest %>/<%= settings.assets %>/'
          },
          {
            expand: true,
            cwd:    '<%= settings.assets %>/js/',
            src:    ['**'],
            dest:   '<%= settings.dest %>/<%= settings.assets %>/src/'
          },
          // copy styleguide files
          {
            expand:  true,
            flatten: true,
            src:     ['styleguide_src/**/*'],
            dest:    '<%= settings.dest %>/_styleguide/'
          }
        ]
      }
    },


    // ##### Watch files
    watch: {
      sass:  {
        files: [
          '<%= settings.style %>/**/*.scss',
          '<%= settings.components %>/**/*.scss'
        ],
        tasks: [
          'copy:site',
          'styles'
        ]
      },
      js:    {
        files: [
          'Gruntfile.js',
          '<%= settings.data %>/*.json',
          '<%= settings.scripts %>/**/*.js',
          '<%= settings.components %>/**/*.js'
        ],
        tasks: [
          'copy:site',
          'scripts',
          'browserify:dist'
        ]
      },
      hbs:   {
        files: [
          '<%= settings.components %>/**/*.hbs',
          '<%= settings.data %>/*.json'
        ],
        tasks: [
          'copy:site',
          'build'
        ]
      },
      twig:   {
        files: [
          '<%= settings.components %>/**/*.twig',
          '<%= settings.data %>/*.json'
        ],
        tasks: [
          'copy:site',
          'build'
        ]
      },
      tests: {
        files: [
          '<%= settings.tests %>/**/*.js',
          '!<%= settings.tests %>/visual/**/*.js',
          '<%= settings.atoms %>/**/*.js',
          '<%= settings.molecules %>/**/*.js',
          '<%= settings.organisms %>/**/*.js'
        ],
        tasks: ['test']
      }
    },


    // ##### Generate documentation
    groc: {
      options: {
        "out": "<%= settings.docs %>/"
      },
      site:    [
        "README.md",
        "TODO.md",
        "Gruntfile.js",

        // > Scripts
        "<%= settings.scripts %>/**/*.js",
        "!<%= settings.scripts %>/vendor/**/*.js",
        "<%= settings.tests %>/**/*.js",
        "<%= settings.atoms %>/**/*.js",
        "<%= settings.molecules %>/**/*.js",
        "<%= settings.organisms %>/**/*.js",
        "<%= settings.templates %>/**/*.js",

        // > SASS
        "<%= settings.style %>/**/*.scss",
        "<%= settings.atoms %>/**/*.scss",
        "<%= settings.molecules %>/**/*.scss",
        "<%= settings.organisms %>/**/*.scss",
        "<%= settings.templates %>/**/*.scss",

        // > Templates
        "<%= settings.atoms %>/**/*.{hbs,twig}",
        "<%= settings.molecules %>/**/*.{hbs,twig}",
        "<%= settings.organisms %>/**/*.{hbs,twig}",
        "<%= settings.templates %>/**/*.{hbs,twig}",
        "<%= settings.layouts %>/**/*.{hbs,twig}",
        "<%= settings.partials %>/**/*.{hbs,twig}"
      ]
    },


    // ##### Live reload with BrowserSync
    browserSync: {
      bsFiles: {
        src: [
          '<%= settings.dest %>/<%= settings.assets %>/css/*.css',
          '<%= settings.dest %>/<%= settings.assets %>/js/*.js',
          '<%= settings.dest %>/*.html'
        ]
      },
      options: {
        server:    {
          baseDir: ['<%= settings.dest %>/']
        },
        watchTask: true
      }
    },


    // ##### Unit testing with Karma, Mocha, Chai and Sinon
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun:  true,
        reporters:  'progress',
        runnerPort: 9876
      }
    },


    // ##### Functional testing with CasperJS and Mocha
    mocha_casperjs: {
      options: {
        reporter: 'spec'
      },
      site:    {
        src: ['<%= settings.tests %>/functional/**/*.js']
      }
    },


    // ##### CSS Regression testing with PhantomCSS
    phantomcss: {
      options: {},
      desktop: {
        options: {
          screenshots:  '<%= settings.tests %>/visual/screenshots/baseline/desktop/',
          results:      '<%= settings.tests %>/visual/screenshots/results/desktop/',
          viewportSize: [
            1280,
            768
          ]
        },
        src:     [
          '<%= settings.tests %>/visual/**/*.js'
        ]
      },
      mobile:  {
        options: {
          screenshots:  '<%= settings.tests %>/visual/screenshots/baseline/mobile/',
          results:      '<%= settings.tests %>/visual/screenshots/results/mobile/',
          viewportSize: [
            320,
            480
          ]
        },
        src:     [
          '<%= settings.tests %>/visual/**/*.js'
        ]
      }
    }
  });

  // ### Load npm plugins to provide necessary tasks.
  //
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-twig-render');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-mocha-casperjs');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-phantomcss');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-karma');
  // Modified [grunt-groc](https://github.com/seltar/grunt-groc) task with personal fork of
  // [groc](https://github.com/seltar/groc)
  grunt.loadNpmTasks('grunt-groc');

  // ### Custom task to generate import statements of all components
  //
  grunt.registerTask('sassimp', function(target) {
    // Get the options
    var options  = grunt.config.get(this.name)[target];
    var filesTmp = options.files;
    var files    = ['// Autogenerated - Don\'t modify! '];

    // Get all files matching the glob from options
    grunt.file.expand(filesTmp).map(function(filepath) {

      // DEUBG
      console.log(filepath);

      // Get basename
      var ofile = path.basename(filepath);
      var file  = ofile.replace(".scss", "").substr(1);

      // Push SASS import statement into array
      files.push('@import "' + "../../" + filepath.replace(ofile, file) + '";');
    });

    // Write results to destination file
    grunt.file.write(options.dest, files.join("\n"));
  });

  // ### Tasks
  //

  // * `grunt server`
  // > Start server with live reload
  grunt.registerTask('server', ['browserSync']);
  // * `grunt build`
  // > Build HTML
  grunt.registerTask('build', ['twigRender:site']);
  // * `grunt scripts`
  // > Check for errors in javascript
  grunt.registerTask('scripts', ['browserify:dist']);
  // * `grunt styles`
  // > Generate components import and compile SASS
  grunt.registerTask('styles', [
    'sassimp:site',
    'sass:site',
    'autoprefixer',
    'cssmin'
  ]);
  // * `grunt docs`
  // > Generate documentation
  grunt.registerTask('docs', [
    'clean:docs',
    'groc:site'
  ]);
  // * `grunt test`
  // > Run unit and functional tests
  grunt.registerTask('test', [
    'karma',
    'mocha_casperjs'
  ]);
  // * `grunt watch`
  // > Watch for changes and automatically run tasks

  // * `grunt baseline`
  // > Register CSS Regression baseline
  grunt.registerTask('baseline', [
    'clean:screenshots',
    'phantomcss'
  ]);
  // * `grunt compare`
  // > Run CSS Regression tests
  grunt.registerTask('compare', ['phantomcss']);
  //

  // * `grunt make`
  // > Builds the entire site
  grunt.registerTask('make', [
    'clean:site',
    'copy:site',
    'build',
    'scripts',
    'styles'
  ]);
  // * `grunt run`
  // > Starts the server and watches files
  grunt.registerTask('run', [
    'server',
    'watch'
  ]);
  //

  // * `grunt`
  // > Default task
  grunt.registerTask('default', [
    'make',
    'docs',
    'run'
  ]);

};