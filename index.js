/**
 * taillog 
 * Created by yuenshui on 15/4/29.
 *
 */
var fs = require("fs");

/**
 * 创建一个文件监听
 * filePath  日志文件的路径
 * interval  监听灵敏度，单位毫秒
 * @param option
 * {
 *      filePath: "./app.log",
 *      interval: 100
 * }
 */
module.exports.createListen = function (option) {
	var bufferSizeMax = 1024 * 1024;
	var bufferSizeDefault = 4 * 1024;
	
	if(!option.filePath) {
		throw new Error('filePath is Null');
		return false;
	}
	
	if(!fs.existsSync(option.filePath)) {
		throw new Error('"' + option.filePath + '" does not exist');
		return false;
	}
	
	if(option.interval === undefined) {
		option.interval = 1000;
	}
	
	var app = new Object();

	app.play = false;
	app.filePath = option.filePath;
	app.interval = option.interval;
	app.fileHand = null;
	app.Point = app.PointMax = 0;

	app.bufferSize = option.bufferSize === undefined ? bufferSizeDefault : parseInt(option.bufferSize);
		if(app.bufferSize < 1) app.bufferSize = 1;
		if(app.bufferSize > bufferSizeMax) app.bufferSize = bufferSizeMax;

	app.dataEvent = null;
	app.filterGrepDoc = [];
	app.filterGrepvDoc = [];
		
	app.on = function(eventName, callback) {
		if(eventName && eventName == 'data' && typeof callback == "function") {
			app.dataEvent = callback;
		}
	}

	var fireData = function(data) {
		if(typeof app.dataEvent == "function") {
			//data = grep(data, app.filterGrepDoc);
			//data = grepv(data, app.filterGrepvDoc);
			app.dataEvent(data);
		}
	}
	
	var grepv = function (data, doc) {
		return data;
	}
	
	var grep = function(data, doc) {
		return data;
	}

	/**
	 * 设置过滤条件，有关键词的内容符合要求；过滤器还没还发完成，请不要用
	 * @param filterStrings   字符串数组
	 */
	app.filterGrep = function(filterStrings) {
		app.filterGrepDoc = filterStrings;
	}

	/**
	 * 设置过滤条件，有关键词的内容不符合要求；过滤器还没还发完成，请不要用
	 * @param filterStrings   字符串数组
	 */
	app.filterGrepv = function(filterStrings) {
		app.filterGrepvDoc = filterStrings;
	}

	/**
	 * 开始监听
	 * @returns {boolean}
	 */
	app.start = function () {
		app.fileHand = fs.openSync(app.filePath, 'r');
		if (!app.fileHand) {
			throw new Error('filePath is Null');
			return false;
		}

		app.Point = app.PointMax = fs.statSync(app.filePath).size;

		fs.watchFile(app.filePath, {
			persistent: true,
			interval: app.interval
		}, fireLog);
		app.play = true;
		
		function fireLog(curr, prev) {
			app.PointMax = curr.size;
			if (app.Point > app.PointMax) {
				app.Point = prev.size;
			}
			setTimeout(readData, 1);
		}
		var readStat = false;
		var readData = function() {
			if (readStat) {
				if (app.Point < app.PointMax) setTimeout(readData, 10);
				return 0;
			}
			if (app.Point == app.PointMax) return;
			readStat = true;
			var nextPoint = app.PointMax;

			var data = "";
			while (1) {
				var read_size = nextPoint - app.Point;
				var buf_size = app.bufferSize > read_size ? read_size : app.bufferSize;
				var buf = new Buffer(buf_size);
				try {
					var rs = fs.readSync(app.fileHand, buf, 0, read_size, app.Point);
				}
				catch(e) {
					console.log(e);
				}
				data = rs ? buf.toString('utf-8') : "";

				app.Point += data.length;

				fireData(data);

				if (app.Point >= app.PointMax) break;
				break;
			}
			readStat = false;
			if (app.Point < app.PointMax) setTimeout(readData, 1);
		}
	};

	app.stop = function() {
		fs.unwatch(app.filePath);
		app.play = true;
	}
	return app;
}
