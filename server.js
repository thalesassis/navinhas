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
  console.log('IDS NAVES:'+idsNaves);
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

    //Atualiza posições
    socket.broadcast.send("AtualizarPosicoes");

    socket.on('Saude', function(data) {
        socket.get('idNave', function (err, id_nave) {
          socket.broadcast.send("Saude,"+id_nave+","+data);
      });
    });

    socket.on('Posicao', function(data) {
        xya = data.split(",");

        socket.get('idNave', function (err, id_nave) {
          socket.broadcast.send("Posicao,"+id_nave+","+xya[0]+","+xya[1]+","+xya[2]);
      });
    });

    socket.on('Tiro', function(data) {
        xya = data.split(",");

        socket.get('idNave', function (err, id_nave) {
          socket.broadcast.send("Tiro,"+id_nave+","+xya[0]+","+xya[1]+","+xya[2]+","+xya[3]);
      });
    });

    socket.on('Acertou', function(data) {
        id_nave = data;

        io.sockets.send("Acertou,"+id_nave);
    });

    socket.on('DestruirJogador', function(data) {
        id_nave = data;
        console.log(id_nave);

        var i = idsNaves.indexOf(Number(id_nave));
        console.log(id_nave+"///"+i+"///"+idsNaves);
        if(i != -1) { idsNaves.splice(i,1); }

        //io.sockets.send("DestruirJogador,"+id_nave);
        idNave++;
    });

    socket.on('disconnect', function() {
      console.log("---------------------user disconnected------------------------");
      
      var sockid = socket["id"];
        var i = jogadores.indexOf(sockid);
        jogadores.splice(i,1);

        socket.get('idNave', function (err, id_nave) {
          var i = idsNaves.indexOf(id_nave);
            console.log(id_nave+"///"+i+"///"+idsNaves);
          if(i != -1) { idsNaves.splice(i,1); }

          io.sockets.send("DestruirJogador,"+id_nave);
          idNave++;
        });
    
    });

});