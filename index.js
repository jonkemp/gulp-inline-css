'use strict';

var gutil = require('gulp-util'),
    through = require('through2'),
    inlineCss = require('inline-css');

module.exports = function (opt) {
    return through.obj(function (file, enc, cb) {
        var self = this,
            _opt = JSON.parse(JSON.stringify(opt || {}));

        // 'url' option is required
        // set it automatically if not provided
        if (!_opt.url) {
            _opt.url = 'file://' + file.path;
        }

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-inline-css', 'Streaming not supported'));
            return;
        }

        inlineCss(file.contents, _opt)
            .then(function (html) {
                file.contents = new Buffer(String(html));

                self.push(file);

                return cb();
            })
            .catch(function (err) {
                if (err) {
                    self.emit('error', new gutil.PluginError('gulp-inline-css', err));
                }
            });
    });
};
