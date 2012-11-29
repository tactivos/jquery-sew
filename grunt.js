module.exports = function (grunt) {
	grunt.initConfig({
		lint: {
			all: ['jquery.sew.js']
		},
		min: {
	    dist: {
	      src: ['jquery.sew.js'],
	      dest: 'jquery.sew.min.js'
	    }
    }
	})
}
