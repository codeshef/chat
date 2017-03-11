var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dir = {};
var online_users = [];
var max = 4;
app.get('/', function(req, res){
  res.sendfile('index1.html');
});
var peers =[];
io.on('connection', function(socket){
  console.log('A user connected');
  socket.on('setUsername', function(data){
    console.log(data);
     var users;
      var ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
        var user_port = socket.request.connection.remotePort; //  only works locally
     console.log('New user connected: '+ data+' from: '+ ip);

        if (user_port){
            console.log('Port: '+ user_port); 
        }
        else {
            user_port = '';
        }
     users = new User(data,peers,ip,user_port,socket);
      dir[data]= users;
      online_users.push(data);
      console.log(data + ' just signed in!');
            console.log('Number of users online: '+ online_users.length);
            console.log('Online users:' + online_users);
            var newest_users = getMostRecentUsers();
            var total_users = online_users.length;
            socket.emit('update lobby', newest_users,total_users);
            // notify everyone
            socket.broadcast.emit('message',{'from':'SERVER','content':''+ data+' just signed in'});
             if(online_users.indexOf(data) > -1){
      online_users.push(data);
      socket.emit('userSet', {username: data});
    }
    else{
      socket.emit('userExists', data + ' username is taken! Try some other username.');
    }   
  });
  socket.on('msg', function(data){
      //Send message to everyone
      io.sockets.emit('newmsg', data);
  });
  // share an image or a video

   socket.on('disconnect', function () {
    console.log('A user disconnected');

  });

});
http.listen(3000, function(){
  console.log('listening on localhost:3000');
});
// function
function User(data,peers,ip,port,socket){
    this.data = data; 
    this.peers = peers;        
    this.ip = ip;               
    this.port = port;
    this.socket = socket;   
    }
  function getMostRecentUsers(){
        var newest_users = [];
          
        for (var i= online_users.length - 2; i >= 0 && i > online_users.length -12; i--){
            newest_users.push(online_users[i]); 
        }
        return newest_users;
}
