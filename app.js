var app = require('express') ();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var static = require('node-static');
var formidable=require('formidable');
var util =require('util');
app.get('/',function(req,res)
    {
        res.sendfile('index.html');
  });

  

        var users=[];
        var dir ={};
        var Max_peers =4;
        var clients=0;
        var online_users=[];
        io.on('connection',function(socket)
            {var peers =[];
                var user;
                var ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
        var user_port = socket.request.connection.remotePort; 
                console.log('A user connected');
                socket.on('setUsername',function(data)
                    {
                        console.log(data);
                        if(users.indexOf(data)>-1)
                        {
                            socket.emit('userExists',data+' try another name');
                        }
                        else
                        {      
                            
                            users.push(data);
                            // sign in user
             user = new User(data,peers,ip,user_port,socket);
            
            dir[data] = user;         // add user to directory
              online_users.push(data); // add users to list of online users
            console.log(data+ ' just signed in!');
            console.log('Number of users online: '+ users.length);
            console.log('Online users:' + users);
                            socket.emit('userSet',{username:data});
                        // online users list
                        var newest_users = getMostRecentUsers();
                         var total_users=online_users.length;
                         socket.emit('lobby',newest_users,total_users);
                        }
                    });
               // search online users
               socket.on('search',function(query)
                {
                    var matching_users=findOnlineUsers(query,user.data);
                    var total_users = online_users.length;
                    socket.emit('lobby',matching_users,total_users);
                });
                
                // share message
                socket.on('msg',function(data)
                    {
                    
                        io.sockets.emit('newmsg',data);
                        
                    });
                // share an image 
               socket.on('attach',function(data)
                {   
                     app.post('/upload',function(req,res)
             { if (req.url == '/upload' && req.method == 'POST') {
    // parse a file upload
                 var form = new formidable.IncomingForm();

             form.parse(req, function(err, fields, files) {
                 fs.rename(files.upload.path, './temp.jpg');
          res.writeHead(200, {'content-type': 'text/html'});
         res.write('Received upload: <a href="/image">View Document</a>');
           res.end();
            io.sockets.emit('newattach',data);
             });

          return;
               }
                 });
                    
                });
                
                socket.on('disconnect',function()
                    {   
                        
                        try{
                        console.log("user disconnected");
                    }
                    catch(err)
                    {
                        console.log('Error');
                    }
                    console.log('Number of users online : '+users.length);
                    console.log('Online users : '+users);
                    });
                socket.on('error',function(err)
                    {
                        console.log('Error'+err);
                    });
                
            });
        app.get('/image',function(req,res)
            {
                if(req.url=='/image' && req.method=='GET')
                {
                     fs.readFile('./temp.jpg', function(err, file) {
                   res.writeHead(200, {"Content-Type" : "application/jpg" });
                    res.write(file, "binary");
                 res.end();
                 });
                 return;
                }
            });
        app.post('/upload',function(req,res)
            { if (req.url == '/upload' && req.method == 'POST') {
    // parse a file upload
         var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
        fs.rename(files.upload.path, './temp.jpg');
          res.writeHead(200, {'content-type': 'text/html'});
      res.write('Received upload: <a href="/image">View Document</a>');
      res.end();

    });

    return;
  }

            });
    http.listen(8000,function()
{
  console.log('listening on : 8000');
});
// function
function User(data,peers,ip,port,socket){
    this.data = data; 
    this.peers = peers;        
    this.ip = ip;       
    this.port = port;
    this.socket = socket;   
}
function findOnlineUsers(query,user)
{
    var matching_users=[];
    var string_length =query.length;
    for(var i=0;i<online_users.length;i++)
    {
      if(online_users[i].substring(0,string_length)===query && online_users[i]!==user)
      {
           matching_users.push(online_users[i]); }
           if(matching_users.length===10)
           break;
            }
             return matching_users;
         }
         function getMostRecentUsers()
         {
            var newest_users=[];
            for(var i=0;i<online_users.length;i++)
            {
                newest_users.push(online_users[i]);
            }
            return newest_users;
         }
