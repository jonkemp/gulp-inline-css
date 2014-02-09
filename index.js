var gutil = require('gulp-util');
var through = require('through2');
var juice = require('juice');

module.exports = function(opt){
    return through.obj(function (file, enc, cb) {
        var self = this;

        if (!opt) {
            opt = {};
        }

        if (file.isNull()) {
            self.push(file);
            return cb();
        }

        if (file.isStream()) {
            self.emit('error', new gutil.PluginError('gulp-inline-css', 'Streaming not supported'));
            return cb();
        }

        juice(file.path, opt, function (err, html) {
            if (err) {
                self.emit('error', new gutil.PluginError('gulp-inline-css', err));
            }

            file.contents = new Buffer(String(html));

            self.push(file);

            return cb();
        });
    });
};