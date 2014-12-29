$(document).ready(function()
{
	var clearlog = $('#clearlog');
	var viewlog = $('#viewlog');
	var content = $('#content');
	var ulist = $('#ulist');
	var username;
	//建立websocket连接
	socket = io.connect('ws://125.221.225.59:3000');
	socket.on('connect', function()
	{
		username = getCookie('username');
		var temp = content.html() + "<p style='height:15px;margin:4px;color:red'>Hello "+ username +",welcome to XiaoShitou chat room.</p>"
		content.html(temp);
		
	});

	socket.on('message', function(data)
	{
		var result = eval('('+ data +')');
		var type = result.type;
		if('ulist' == type)		
			ulist.html(result.content);
		else
		{
			var temp = content.html() + result.content;
			content.html(temp);
		}
	});
	
	$('form').submit(function()
	{
		var info = $('#info').val();
		if(info.length == 0)
		{
			alert('不能发送空消息!');
			return;
		}
		var wordcolor = $('#wordcolor').val();
	   var wordsize = $('#wordsize').val();
		var jsondata = '{username:"'+username+'",content:"'+info+'",wordsize:"'+wordsize+'",wordcolor:"'+wordcolor+'"}';
		socket.send(jsondata);
		$('#info').val('');
		return false;
	});
	$('#clearinfo').click(function()
	{
		$('#info').val('');
	});


});
function getCookie(name) 
{ 
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
 
    if(arr=document.cookie.match(reg))
 
        return unescape(arr[2]); 
    else 
        return null; 
} 
