'use strict';

var gutil = require('gulp-util'),
    through = require('through2'),
    juice = require('juice2');

module.exports = function(opt){
    return through.obj(function (file, enc, cb) {
        var _opt = JSON.parse(JSON.stringify(opt || {}));

        // 'url' option is required
        // set it automatically if not provided
        if (!_opt.url) {
            _opt.url = 'file://' + file.path;
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-inline-css', 'Streaming not supported'));
            return cb();
        }

        juice.juiceContent(file.contents, _opt, function(err, html) {
            if (err) {
                this.emit('error', new gutil.PluginError('gulp-inline-css', err));
            }

            file.contents = new Buffer(String(html));

            this.push(file);

            return cb();
        }.bind(this));
    });
};
