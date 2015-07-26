#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var watch = require('./lib/watch.js');
var upload = require('./lib/upload.js');


var confPath = path.join(process.cwd(), 'wp-conf.json');
var config = JSON.parse(fs.readFileSync(confPath));
var base = config.base;
var to = config.to;
var unwatchSuffix = config.unwatchSuffix;
var unwatchPath = config.unwatchPath;
var unwatchPathFirst = config.unwatchPathFirst;
var receiver = config.receiver;
var option = function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {      // Finished walking the tree
        var files = [];
        for (x in f) {
            var stat = fs.statSync(x);
            if (!stat.isDirectory()) {
                files.push(x);
            }
        }
        uploadEach(files);
    } else if (prev === null) {
        analyse(f, function (data, f) {
            if (data != 0) {
                console.log('文件传输失败');
            } else {
                console.log(f, '传输成功！')
            }
        });
    } else if (curr.nlink === 0) {
    } else {
        analyse(f, function (data) {
            if (data != 0) {
                console.log('文件传输失败');
            } else {
                console.log(f, '传输成功！')
            }
        });
    }
}
var errorFile = [];
var eachI = -1;
var uploadEach = function (files) {
    eachI ++;
    analyse(x, function (f) {
        if (eachI == files.length) {
            startWatch();
            return;
        }
        var suffixFlag = false;
        var pathFlag = false;
        unwatchSuffix.forEach(function (x) {
            if (path.extname(files[eachI]) === x) {
                suffixFlag = true;
            }
        });
        unwatchPathFirst.forEach(function (x) {
            if (files[eachI].split(path.sep).indexOf(x) > -1) {
                pathFlag = true;
            }
        });
        unwatchPath.forEach(function (x) {
            if (files[eachI].split(path.sep).indexOf(x) > -1) {
                pathFlag = true;
            }
        });
        if (suffixFlag || pathFlag) {
            if (eachI < files.length) {
                uploadEach(files);
                return;
            }
        }
        if (f != 0) {
            console.log(files[eachI], 'x>', path.join(to, path.relative(base, files[eachI])));
            errorFile.push(files[eachI]);
            if (eachI < files.length) {
                uploadEach(files);
                return;
            }
        } else {
            console.log(files[eachI], '->', path.join(to, path.relative(base, files[eachI])));

            if (eachI < files.length) {
                uploadEach(files);
                return;
            } else {
                startWatch();
            }
        }
    });
};

var startWatch = function () {
    if (errorFile.length > 0) {
        console.log('-----传输失败的文件-----')
        errorFile.forEach(function (x) {
            console.log(x);
        });
        console.log('-----传输失败的文件-----');
    }
    console.log('--------开始监控------')
};

var analyse = function (f, callback) {
    var relative =  path.relative(base, f);
    var toPath = path.join(to, relative);
    upload(f, toPath, receiver, function (err, data) {
        if (err) {
            console.log(err);
        }
        callback(data, f);
    });
};

watch.watchTree(base, option, unwatchSuffix, unwatchPath);
