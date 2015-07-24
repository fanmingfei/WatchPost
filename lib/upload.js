var fs = require('fs');
var http = require('http');
var url = require('url');

var getHeader = function (filePath, to, receiver, callback) {
    var boundaryKey = Math.random().toString(16); // random string
    var endl = '\r\n'
    var boundary = '-----np' + Math.random();
    var file = fs.readFileSync(filePath);
    var content = new Buffer(file, 'utf8');

    var collect = [];
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="to"' + endl);
    collect.push(endl);
    collect.push(to + endl);

    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="file"; filename="' + filePath + '"' + endl);
    collect.push(endl);
    collect.push(content);
    collect.push('--' + boundary + '--' + endl);
    var length = 0;
    collect.forEach(function(ele) {
        length += ele.length;
    });

    var receiverObj = url.parse(receiver);
    var options = {
        host: receiverObj.hostname,
        path: receiverObj.path,
        port: receiverObj.port,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + boundary,
            'Content-Length': length
        }
    }
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var status = res.statusCode;
        var body = '';
        res
            .on('data', function(chunk){
                body += chunk;
            })
            .on('end', function(){
                if(status >= 200 && status < 300 || status === 304){
                    callback(null, body);
                } else {
                    callback(status);
                }
            })
            .on('error', function(err){
                callback(err.message || err);
            });
    });

    collect.forEach(function(d) {
        req.write(d);
        if (d instanceof Buffer) {
          req.write(endl);
        }
    });
    req.end();
};

module.exports = getHeader;