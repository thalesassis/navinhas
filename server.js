var express = require('express');
var app = express();
var mime = require('mime');

app.configure(function(){
  app.set('views', __dirname);
  app.set('view engine', 'ejs');
  app.set('view options', {layout: false});
  app.use(express.json()); 
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use('/', express.static(__dirname));
});

app.get('/', function(req, res){
  res.render('index');
});


var io = require('socket.io').listen(app.listen(9637));

var jogadores = [];
var idsNaves = [];
var idNave = 0;

io.sockets.on('connection', function(socket) {
	idNave++;
	var sockid = socket["id"];
    jogadores[sockid] = socket;
    socket.set('idNave', idNave);

    console.log(idsNaves);
    //Cria os jogadores já conectados
  	for(var i = 0; i < idsNaves.length; i++) {
  		socket.send("CriarJogadores,"+idsNaves[i]);
  	}

  	//Adiciona novo jogador
    idsNaves.push(idNave);
    //Adiciona para o socket
  	socket.send("CriarNave,"+idNave);

  	//Adiciona para o resto
  	socket.broadcast.send("CriarJogadores,"+idNave);


    socket.on('Posicao', function(data) {
        xya = data.split(",");

        socket.get('idNave', function (err, id_nave) {
        	socket.broadcast.send("Posicao,"+id_nave+","+xya[0]+","+xya[1]+","+xya[2]);
    	});
    });

    socket.on('Tiro', function(data) {
        xya = data.split(",");

        socket.get('idNave', function (err, id_nave) {
        	socket.broadcast.send("Tiro,"+id_nave+","+xya[0]+","+xya[1]+","+xya[2]);
    	});
    });

    socket.on('disconnect', function() {
    	var sockid = socket["id"];
        var i = jogadores.indexOf(sockid);
        jogadores.splice(i,1);

        socket.get('idNave', function (err, id_nave) {
        	var i = idsNaves.indexOf(id_nave);
        	idsNaves.splice(i,1);

        	io.sockets.send("DeletarJogador,"+id_nave);
    	});
    });

});

/*
app.get('/', function(req, res){
  res.render('index');
});

app.get('/chat', function(req, res){
  res.redirect('/');
});

app.post('/chat', function(req, res){
  var user = req.body.user;
  if(user.nome == "") {
    res.redirect('/');
  } else {
    res.render('chat', {user:user});
  }
});

var io = require('socket.io').listen(app.listen(3000));

var jogadores = [];
 
io.sockets.on('connection', function(socket) {
    jogadores.push(socket);

    socket.on('message_to_server', function(data) {
        var escaped_message = sanitize(data["message"]).escape();
        io.sockets.emit("message_to_client",{ message: escaped_message });
    });

    socket.on('novo_usuario', function(data) {
        var escaped_message = sanitize(data["nome"]).escape();
        
        socket.set('nickname', escaped_message);

        var lista_nicknames = [];
        for(var i = 0; i < jogadores.length; i++) {
            var sock = jogadores[i];
            console.log(sock);
            sock.get('nickname', function (err, name) {
                lista_nicknames.push(name);
            });
        }

        io.sockets.emit("lista", { message : lista_nicknames });
        
        var msg = '<strong>'+ escaped_message + '</strong> entrou na sala.';
        io.sockets.emit("message_to_client", { message : msg });
    

    });

    socket.on('disconnect', function() {
        var i = jogadores.indexOf(socket);
        delete jogadores[i];

        socket.get('nickname', function (err, name) {
          io.sockets.emit("message_to_client",{ message: name+' saiu da sala' });
        });
    });

    */