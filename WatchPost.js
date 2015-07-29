#!/usr/bin/env node

/**
 * WatchPost
 * Author: Mingfei Fan (Edire)
 * Source: https://github.com/edire/WatchPost
 * License: MIT
 */

var version = '1.0.3';

var fs = require('fs');
var path = require('path');
var watch = require('./lib/watch.js');
var upload = require('./lib/upload.js');

var program = require('commander');


program
  .version(version)
  .option('init, --init [type]', 'Create a package.json at current path')
  .option('-w, --watch [type]', 'Watch and post the files')
  .parse(process.argv);

if (program.init) {
    init();
} else if (program.watch) {
    watchIt();
} else {
    program.help();
}

function watchIt () {
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
}
function init () {
    console.log(
        ' _       _   ____   _______    ___    _     _  _____    _____    _____  _______ \r\n' +
        '(_)  _  (_) (_____)(__ _ __)_(___)  (_)   (_) (_____)  (_____)  (_____)(__ _ __)\r\n' +
        '(_) (_) (_)(_)___(_)  (_)  (_)      (_)___(_) (_)__(_)(_)   (_)(_)___     (_)   \r\n' +
        '(_) (_) (_)(_______)  (_)  (_)      (_______) (_____) (_)   (_)  (___)_   (_)   \r\n' +
        '(_)_(_)_(_)(_)   (_)  (_)  (_)___   (_)   (_) (_)     (_)___(_)  ____(_)  (_)   \r\n' +
        ' (__) (__) (_)   (_)  (_)    (___)  (_)   (_) (_)      (_____)  (_____)   (_) \r\n\r\n\r\n\r\n'
    );
    var readline = require('readline');

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('接收文件的服务器程序地址: \r\n', function (a) {
        var receiver = a.toString();
        rl.question('本地文件目录:(默认当前执行文件的目录)\r\n', function (a) {
            var base = a.toString();
            if (base === ''){ 
                base = process.cwd();
            }
            rl.question('服务器文件目录:\r\n', function (a) {
                var to = a.toString();
                rl.question('过滤的后缀名(,分割):\r\n', function (a) {
                    var unwatchSuffix = JSON.stringify(a.split(','));
                    rl.question('第一次不需要上传的目录(,分割):\r\n', function (a) {
                        var unwatchPathFirst = JSON.stringify(a.split(','));
                        rl.question('不进行监控的目录，请填写(,分割)    :\r\n', function (a) {
                            var unwatchPath = JSON.stringify(a.split(','));
                            var content = '{\r\n' +
                                '    "receiver": "' + receiver + '", \r\n' +
                                '    "base": "' + base + '", \r\n' +
                                '    "to": "' + to + '", \r\n' +
                                '    "unwatchSuffix": ' + unwatchSuffix + ', \r\n' +
                                '    "unwatchPathFirst": ' + unwatchPathFirst + ', \r\n' +
                                '    "unwatchPath": ' + unwatchPath + '\r\n' +
                            '}';

                            fs.writeFile(path.join(process.cwd(), 'wp-conf.json'), content, function(err) {
                                if (err) throw err;
                                console.log('WatchPost Inited');
                            });
                            rl.close();
                        })
                    })
                })
            })
        })
    });
}
