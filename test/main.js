/* eslint-disable */
/* global describe, it */

const should = require('should');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const Vinyl = require('vinyl');
const es = require('event-stream');
const inlineCss = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: Buffer.from(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedPath, options, done) {
    // Create a plugin stream
    const stream = inlineCss(options);

    // write the fake file to it
    stream.write(getFile(fixturePath));

    // wait for the file to come back out
    stream.once('data', file => {
        // make sure it came out the same way it went in
        should.ok(file.isBuffer());

        // check the contents
        file.contents.toString('utf8').should.be.equal(String(fs.readFileSync(expectedPath)));
        done();
    });
}

describe('gulp-inline-css', () => {
    it('file should pass through', done => {
        let a = 0;

        const fakeFile = new Vinyl({
            path: '/test/fixture/file.html',
            cwd: '/test/',
            base: '/test/fixture/',
            contents: Buffer.from('Hello World!')
        });

        const stream = inlineCss();

        stream.on('data', newFile => {
            should.ok(newFile.contents);
            should.equal(newFile.path, path.normalize('/test/fixture/file.html'));
            should.equal(newFile.relative, 'file.html');
            ++a;
        });

        stream.once('end', () => {
            should.equal(a, 1);
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

    it('should let null files pass through', done => {
        const stream = inlineCss();
        let n = 0;

        stream.pipe(es.through(file => {
            should.equal(file.path, 'null.md');
            should.equal(file.contents,  null);
            n++;
        }, () => {
            should.equal(n, 1);
            done();
        }));

        stream.write(new Vinyl({
            path: 'null.md',
            contents: null
         }));

        stream.end();
    });

    it('should emit error on streamed file', done => {
      gulp.src(path.join('test', 'fixtures', 'in.html'), { buffer: false })
        .pipe(inlineCss())
        .on('error', ({message}) => {
          message.should.equal('Streaming not supported');
          done();
        });
    });

    it('Should convert linked css to inline css', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });

    it('Should inline css in multiple HTML files', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'expected', 'multiple', 'one', 'out.html'), options, () => {});
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'expected', 'multiple', 'two', 'out.html'), options, done);
    });

    it('Should ignore hbs code blocks', done => {
        const options = {};
        compare(path.join('test', 'fixtures', 'codeblocks.html'), path.join('test', 'expected', 'codeblocks.html'), options, done);
    });

    it('Should ignore user defined code blocks', done => {
        const options = {
            codeBlocks: {
                craze: { start: '<<', end: '>>' }
            }
        };
        compare(path.join('test', 'fixtures', 'codeblocks-external.html'), path.join('test', 'expected', 'codeblocks-external.html'), options, done);
    });
});
