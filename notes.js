module.exports = (grunt) => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        // files to concat
        src: ['public/client/**/*.js'],
        // location of resulting JS files
        dest: 'public/dist/<%= pkg.name %>.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['test/**/index.test.js'],
      },
    },

    nodemon: {
      dev: {
        script: 'server/index.js',
      },
    },

    uglify: {
      dist: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    eslint: {
      options: {
        quiet: true,
      },
      target: [
        // Add list of files to lint here
        'public/**/*.js',
        'Gruntfile.js',
        'app/**/*.js',
        'lib/**/*.js',
        './*.js',
        'spec/**/*.js'
      ]
    },

    cssmin: {
      dist: {
        files: {
          'public/dist/style.min.css': 'public/style.css'
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify',
        ],
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin'],
      },
    },

    shell: {
      prodServer: {
        command: 'git push live master',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', (target) => {
    // running nodejes in a different process
    // displays output to same console
    const nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run(['watch']);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('upload', (n) => {
    if (grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['shell:prodServer']);
    } else {
      grunt.task.run(['server-dev']);
    }
  });

  grunt.registerTask('test', [
    'eslint', 'mochaTest'
  ]);

  grunt.registerTask('build', ['concat', 'uglify', 'cssmin']);

  grunt.registerTask('deploy', [
    // add your deploy tasks here
    'test', 'build', 'upload'
  ]);
};



