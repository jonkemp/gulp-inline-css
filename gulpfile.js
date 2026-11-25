const { execFile } = require('node:child_process');
const gulp = require('gulp');
const { ESLint } = require('eslint');

const scripts = ['index.js'];

gulp.task('lint', async () => {
    const eslint = new ESLint({ fix: true });
    const results = await eslint.lintFiles(scripts);

    await ESLint.outputFixes(results);

    const formatter = await eslint.loadFormatter('stylish');
    const output = formatter.format(results);

    if (output) {
        process.stdout.write(output);
    }

    if (results.some(result => result.errorCount > 0)) {
        throw new Error('Lint failed');
    }
});

gulp.task('test', done => {
    const child = execFile(process.execPath, [require.resolve('mocha/bin/mocha.js')], done);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
});

gulp.task('watch', () => {
    gulp.watch(scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
