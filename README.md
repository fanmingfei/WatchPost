# WatchPost 本地开发过程中直接与服务器进行文件同步

WatchPost
版本： v1.0.4

版权协议： MIT

## 使用方法：

1、安装WatchPost

    npm install -g watchpost

2、在任意目录下（一般在项目目录下）执行以下命令，创建wp-conf.json

    $cd <项目目录>/

    $watchpost init
    
    # 输入相关的内容，见参数简介，日后想修改可以如此执行也可以 

    $vi wp-config.json 进行修改

3、在wp-conf.json 所在目录下 执行 watchpost -w 即可开始监控

    $watchpost -w


(目前没有测试过Windows)


### wp-conf.json 参数简介

    {
        "receiver": "http://www.fanmingfei.cn/receiver.php",
        "base": "/Users/fanmingfei/server/",
        "to": "/data/www/server",
        "unwatchSuffix": [".swp"],
        "unwatchPath": [".git","Runtime"],
        "unwatchPathFirst": [".git","Runtime"],
    }


* receiver 接收文件的url

本插件是通过post请求发送文件，所以服务端需要一个文件进行接收，文件是从FEX的FIS库中直接拿过来的，

链接：<https://github.com/fex-team/fis3-command-release/blob/master/tools/receiver.php>

直接放在服务器可以访问到的地方，把访问URL放在receiver

* base 本机项目目录

* to 测试机项目目录

* unwatchSuffix 不进行监控的文件后缀名， 比如说一些没有用的 可能会出现的 .psd、.zip 之类的都不需要监控，注意这里是带"."的。

* unwatchPath 不进行监控的目录或文件。

* unwatchPathFirst 执行命令时不需要上传的目录或文件，因为每次开启监控都要重新吧所有文件上传一次，像一些无需第一次更新的目录卸载上面，就不会在执行代码的时候把它上传上了，但是开始监控以后会实时监控这些目录。


### 更新日志

2015.8.29 v1.0.4

不输入本地目录时自动当前目录

2015.8.29 v1.0.3

增加参数功能

2015.8.27 v1.0.2

做成npm包进行发布。

2015.8.26 v1.0.1

对不进行监控的目录或文件和第一次不监控的文件进行区分。
