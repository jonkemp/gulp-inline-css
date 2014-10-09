/* jshint node: true */
/* global describe, it */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var inlineCss = require('../index');

function compare(inputPath, outputPath, options, done) {
    
    var input = fs.readFileSync(inputPath);
    
    var fakeFile = new gutil.File({
        path: path.resolve('./'+inputPath),
        cwd: './test/',
        base: './test/fixtures/',
        contents: new Buffer(String(input))
    });

    var output = fs.readFileSync(outputPath);

    // Create a plugin stream
    var stream = inlineCss(options);

    // write the fake file to it
    stream.write(fakeFile);

    // wait for the file to come back out
    stream.once('data', function (file) {
        // make sure it came out the same way it went in
        assert(file.isBuffer());

        // check the contents
        assert.equal(file.contents.toString('utf8'), String(output));
        done();
    });
}

describe('gulp-inline-css', function() {
    it('Should convert linked css to inline css', function(done) {
        var inputPath = path.join('test', 'fixtures', 'in.html');
        var outputPath = path.join('test', 'expected', 'out.html');
        var options = {};
        compare(inputPath, outputPath, options, done);
    });
    it('Should handle multiple HTML files with relative stylesheets', function(done){
        var one = path.join('test', 'fixtures', 'multiple', 'one', 'in.html');
        var two = path.join('test', 'fixtures', 'multiple', 'two', 'in.html');
        var options = {};
        var doneCount = 0;
        var bothDone = function(){ doneCount++; if(doneCount == 2){ done(); } };
        compare(one, path.join('test', 'expected', 'multiple', 'one', 'out.html'), options, bothDone);
        compare(two, path.join('test', 'expected', 'multiple', 'two', 'out.html'), options, bothDone);
    });
});

