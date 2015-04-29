# taillog

taillog 是Node.js下的程序包，可以应用在项目中监听文件变化，典型的使用案例是监听服务器日志文件，根据日志文件内容进行业务处理。

1. 可以用于报警，当出现错误日志时
2. 可以及时分析用户浏览状况，在不干设计到业务程序代码的情况下
3. 可以将部分生产系统的日志开放给开发人员，用于处理线上产品的业务问题
4. 可以用在多人开发服务器接口的场景，可以实时反馈nginx、apache、Node.js的访问log、错误log、debug log到网页中。方便客户端开发人员及时了解到服务器状况，而不需要登录服务器

##  安装

```bash
npm install taillog
```

##  使用
```js

var taillog = require('taillog');

// 创建一个监听
var tail = taillog.createListen({
	filePath: "./app.log",      // 监听的日志文件
	interval: 10                // 监听的灵敏度，单位毫秒
});

// 收听监听内容
tail.on("data", function(data) {
	// 这里可以吧监听到的数据进行处理或发送给其他程序
	console.log("fire:" + data);
});

// 开始监听
tail.start();

// 停止监听
// tail.stop();

```
