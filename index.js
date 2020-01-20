const PluginError = require('plugin-error');
const through = require('through2');
const inlineCss = require('inline-css');

module.exports = opt => through.obj(function (file, enc, cb) {
    const self = this;
    const _opt = JSON.parse(JSON.stringify(opt || {}));

    // 'url' option is required
    // set it automatically if not provided
    if (!_opt.url) {
        _opt.url = `file://${file.path}`;
    }

    if (file.isNull()) {
        cb(null, file);
        return;
    }

    if (file.isStream()) {
        cb(new PluginError('gulp-inline-css', 'Streaming not supported'));
        return;
    }

    inlineCss(String(file.contents), _opt)
        .then(html => {
            file.contents = Buffer.from(html);

            self.push(file);

            return cb();
        })
        .catch(err => {
            if (err) {
                self.emit('error', new PluginError('gulp-inline-css', err));
            }
        });
});
