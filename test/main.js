/* jshint node: true */
/* global describe, it */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var inlineCss = require('../index');

function compare(input, options, done) {
    var fakeFile = new gutil.File({
        path: path.resolve('./test/fixtures/in.html'),
        cwd: './test/',
        base: './test/fixtures/',
        contents: new Buffer(String(input))
    });

    var output = fs.readFileSync(path.join('test', 'expected', 'out.html'));

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
        var input = fs.readFileSync(path.join('test', 'fixtures', 'in.html'));
        var options = {};
        compare(input, options, done);
    });
});