/* eslint-disable */
/* global describe, it */

const should = require('should');
const fs = require('fs');
const path = require('path');
const { once } = require('events');
const { Readable } = require('stream');
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

async function compare(fixturePath, expectedPath, options) {
    const stream = inlineCss(options);
    const output = once(stream, 'data');

    stream.end(getFile(fixturePath));

    const [file] = await output;
    should.ok(file.isBuffer());
    file.contents.toString('utf8').should.be.equal(fs.readFileSync(expectedPath, 'utf8'));
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
        const stream = inlineCss();

        stream.once('error', ({ message }) => {
            message.should.equal('Streaming not supported');
            done();
        });

        stream.end(new Vinyl({
            path: 'in.html',
            contents: Readable.from(['<html></html>'])
        }));
    });

    it('Should convert linked css to inline css', () =>
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html')));

    it('Should inline css in multiple HTML files', () => Promise.all([
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'expected', 'multiple', 'one', 'out.html')),
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'expected', 'multiple', 'two', 'out.html'))
    ]));

    it('Should ignore hbs code blocks', () =>
        compare(path.join('test', 'fixtures', 'codeblocks.html'), path.join('test', 'expected', 'codeblocks.html')));

    it('Should ignore user defined code blocks', () => {
        const options = {
            codeBlocks: {
                craze: { start: '<<', end: '>>' }
            }
        };

        return compare(path.join('test', 'fixtures', 'codeblocks-external.html'), path.join('test', 'expected', 'codeblocks-external.html'), options);
    });
});
