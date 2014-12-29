var express = require('express')
	,path = require('path')
	,app = express.createServer().listen(3000)
	,io = require('socket.io').listen(app)
	,mongodb = require('mongodb');

var users = [];//保存在线用户
var socketlist = [];//保存当前建立的所有socket
var socketnum = 0, usernum = 0;
//监听socket连接
io.on('connection', function(socket)
{
	socketlist[socketnum++] = socket;
	console.log('someone connected!');
	socket.send(toUserList(users));
	
	socket.on('message', function(data)
	{
		var result = eval('('+ data +')');
		var username = result.username;
		var content = result.content;
		var wordsize = result.wordsize;
		var wordcolor = result.wordcolor;
		var sendcontent = "<p style='color:black;font-size:15px'>"+username+":<span style='color:"+wordcolor+";font-size:"+wordsize+"px;'>"+content+"</span></P>"
		
		for(var i = 0; i < socketlist.length; ++i)
		{
			if(socketlist[i])
			{
				var jsonstr = '{type:"info",content:"'+sendcontent+'"}';
				console.log(jsonstr);
				socketlist[i].send(jsonstr);
			}
		}
	});
	
});
//express基本配置
app.configure(function()
{
	app.use(express.bodyParser());//添加解释文档的中间件
	//app.use(express.methodOverride);
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));//指定静态文件目录
});
app.get('/', function(req, res)
{
	res.sendfile('views/login.html', {root:__dirname});
	console.log('please login first.');
});
app.post('/login', function(req, res)
{
	var username = req.body.username;
	var password = req.body.password;
	//query the database	
	
	var dbserver = new mongodb.Server('127.0.0.1', 27017);
	new mongodb.Db('myqq', dbserver).open(function(err, client)
	{
		if(err) throw err;
		console.log('connect mongodb success!!!');
		app.user = new mongodb.Collection(client ,'users');
		app.user.findOne({name:req.body.username, password:req.body.password}, function(err, doc)
		{
			if(doc)
			{
				if(isNewer(username))
				{
					users[usernum++] = username;
					console.log(username + " login success!");
				}
				else
				{
					console.log(username + " welcome back!");
				}
				res.setHeader("Set-Cookie", 'username='+username);
				res.sendfile('views/chartRoom.html', {root:__dirname});
			}
			else
			{
				res.sendfile('views/login.html', {root:__dirname});
				console.log('login failure!');
			}
		});
		
	});
});
function toUserList(userslist)
{
	var temp, list = '';
	for(var i = 0; i < userslist.length; ++i)
	{
		temp = "<p style='height:15px;color:green;margin:4px'>" + userslist[i] + "</p>";
		list += temp;
	}	
	var jsonstr = '{type:"ulist",content:"'+list+'"}';
	return jsonstr;
}
function isNewer(username)
{
	for(var i = 0; i < users.length; ++i)
	{
		if(username == users[i])
			return false;
	}
	return true;
}
console.log('server is running at port 3000...');

