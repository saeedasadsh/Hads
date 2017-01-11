var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');

console.log('server started');

var socks = [];
var players = [];
var gameRomms = [];

var maxPlayer = 6;

var playersArr = [[]];
var playersNameArr = [[]];

var socksArr = [[]];

var fr_rooms = [];
var fr_socks = [];
var fr_players = [];
var fr_playersName = [];

for (i = 1; i < maxPlayer; i++) {
    playersArr.push([]);
    socksArr.push([]);
    playersNameArr.push([]);
}


io.on('connection', function (socket) {
    var thisClientId = shortid.generate();
    var thisRoomId;
    var roomPlayers = [];
    var roomPlayersName = [];
    var roomSocks = [];
    var RoomData;
    socks.push(socket);
    players.push(thisClientId);

    console.log('client coneccted, id: ', thisClientId);
    socket.emit('connectToServer', { id: thisClientId });


    socket.on("tellType", function (data) {
        var playerCount = data.playerCount;
        var player = data.id;
        var sock = socket;
        var userData = { type: data.type, id: data.id, myName: data.myName, playerCount: data.playerCount };

        for (i = 0; i < players.length; i++) {
            if (players[i] == thisClientId) {
                players.splice(i, 1);
                socks.splice(i, 1);
            }
        }

        console.log("connect To Server by id:" + player + " --- playerCount: " + data.playerCount);

        if (player != null && userData.type == "or") {

            playersArr[(playerCount - 1)].push(player);
            socksArr[(playerCount - 1)].push(sock);
            playersNameArr[(playerCount - 1)].push(userData.myName);

            var counts = [];
            counts.push(playersArr[0].length);
            for (i = 1; i < playersArr.length; i++) {
                counts.push(counts[i - 1] + playersArr[i].length);
            }

            var counter = counts.length - 1;
            var max = maxPlayer;

            while (counter >= 0) {
                var count = counts[counter];
                if (count >= max) {
                    var playerCounter = 0;
                    var lastIndex = max - 1;
                    while (playerCounter <= max - 1) {

                        if (playersArr[lastIndex].length > 0) {
                            var pl = playersArr[lastIndex].pop();
                            roomPlayers.push(pl);

                            var nm = playersNameArr[lastIndex].pop();
                            roomPlayersName.push(nm);

                            var sc = socksArr[lastIndex].pop();
                            roomSocks.push(sc);
                            playerCounter++;
                        }
                        else {
                            lastIndex--;
                        }
                    }

                    var dt = [];
                    thisRoomId = shortid.generate();
                    for (k = 0; k < roomPlayers.length; k++) {
                        dt.push({ roomPlayer: roomPlayers[k], isActive: true, playerCards: [], point: 0, turn: k, roomPlayersName: roomPlayersName[k] });
                    }

                    var nobat = Math.floor(Math.random() * (roomPlayers.length));
                    //
                    var data = { roomId: thisRoomId, players: roomPlayers, roomSocks: roomSocks, roomPlayersName: roomPlayersName, nobat: nobat, gameTurn: 0, playersCards: [[]], playerCount: roomSocks.length };
                    gameRomms.push(data);
                    console.log("nobat", nobat);
                    roomSocks.forEach(function (item, index, arr) {
                        item.emit('GameBegin', { roomId: thisRoomId, gameTurn: 0, nobat: nobat, gameRommsIndex: gameRomms.length - 1, players: { dt } });

                    });
                    counter = -1;
                }
                else {
                    max--;
                    counter--;
                }
            }

            var counts = [];
            for (i = 0; i < playersArr.length; i++) {
                counts.push(playersArr[i].length);
            }

            var data = { counts: counts };


            for (i = 0; i < socksArr.length; i++) {
                var sc = socksArr[i];
                sc.forEach(function (item, index, arr) {

                    item.emit("roomPlayersCount", data);
                });
            }

            for (i = 0; i < socks.length; i++) {
                socks[i].emit("roomPlayersCount", data);
            }
        }
        else if (userData.type == "fr") {
            fr_players.push(player);
            fr_playersName.push(userData.myName);
            fr_socks.push(sock);
            socket.emit('fr_connectToServer', { id: player });
        }
    });

    socket.on('setPlayerSocket', function (data) {
        console.log("set roomsocks");
        var ind = -1;

        data.gameRommsIndex;

        for (i = 0; i < gameRomms.length; i++)
        {
            if (data.roomId == gameRomms[i].roomId) {
                ind = i;
            }
        }
        RoomData = gameRomms[ind];
        roomSocks = RoomData.roomSocks;
        roomPlayersName = RoomData.roomPlayersName;
        socket.emit("setSocket");
    });

    socket.on('disconnectFromServer', function (data) {
        myid = data.id;
        type = data.type;
        playerCount = data.playerCount;

        for (i = 0; i < playersArr[(playerCount - 1)].length; i++) {
            if (playersArr[(playerCount - 1)][i] == myid) {
                playersArr[(playerCount - 1)].splice(i, 1);
                socksArr[(playerCount - 1)].splice(i, 1);
                playersNameArr[(playerCount - 1)].splice(i, 1);
                var counts = [];
                for (i = 0; i < playersArr.length; i++) {
                    counts.push(playersArr[i].length);
                }
                var data = { counts: counts };
                socket.emit("roomPlayersCount", data);
                return;
            }
        }

    });

    socket.on('disconnect', function (data) {
        if (thisRoomId != "") {
            //console.log(data);
            //roomSocks.forEach(function (item, index, arr) {
            //    item.emit('disconnect', { id: roomPlayers[index], roomId: thisRoomId, turn: index });
            //});
        }
        else {
            //console.log(data);
        }
        console.log('disconnected', thisClientId);
    });

    socket.on('GetRoomsPlayers', function (data) {
        //console.log('GetRoomsPlayers', data);
        var counts = [];
        for (i = 0; i < playersArr.length; i++) {
            counts.push(playersArr[i].length);
        }
        var data = { counts: counts };
        socket.emit("roomPlayersCount", data);
    });

    socket.on('choosedcard', function (data) {
        console.log('choosedcard', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('playerChoosedCard', data);
        });
    });

    socket.on('choosedRandomCard', function (data) {
        console.log('choosedRandomCard', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('playerChoosedRandomCard', data);
        });
    });

    socket.on('StartPlaying', function (data) {
        console.log('StartPlaying', data);
        console.log('StartPlaying', roomSocks.length);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('StartPlayingGame');
        });
    });

    socket.on('sendSentenceToServer', function (data) {
        console.log('sendSentenceToServer', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('recieveSentenceFromServer', data);
        });
    });

    socket.on('otherPlayersSendChosenCardToServer', function (data) {
        console.log('otherPlayersSendChosenCardToServer', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('recieveOtherPlayersChosenCards', data);
        });
    });

    socket.on('otherPlayersSendHadsCardToServer', function (data) {
        console.log('otherPlayersSendHadsCardToServer', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('recieveOtherPlayersHadsCards', data);
        });
    });

    socket.on('sendChoosenCardToServer', function (data) {
        console.log('sendChoosenCardToServer', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('recieveChoosenCardFromServer', data);
        });
    });

    socket.on('raviSendScoreToServer', function (data) {
        console.log('raviSendScoreToServer', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('recieveScoresFromServer', data);
        });
    });

    socket.on('fr_createRoom', function (data) {
        thisRoomId = shortid.generate();
        var creatorId = data.creatorId;
        var creatorName = data.creatorName;
        var playerCount = data.playerCount;
        var havePass = data.havePass;
        var pass = data.pass;
        var roomName = data.roomName;

        var playersId = [];
        playersId.push(creatorId);

        var playersName = [];
        playersName.push(creatorName);

        var playersSockets = [];
        playersSockets.push(socket);

        var roomIndex = fr_rooms.length;

        var dt = { rommId: thisRoomId, creatorId: creatorId, creatorName: creatorName, playerCount: playerCount, havePass: havePass, pass: pass, roomName: roomName, playersId: playersId, playersName: playersName, playersSockets: playersSockets, roomIndex: roomIndex };
        fr_rooms.push(dt);

        socket.emit('fr_createdRomm', { rommId: thisRoomId, creatorId: creatorId, creatorName: creatorName, playerCount: playerCount, havePass: havePass, pass: pass, roomName: roomName, roomIndex: roomIndex, inRoom: 1 });
    });

    socket.on('fr_joinRoom', function (data) {

        var roomIndex = -1;

        for (i = 0; i < fr_rooms.length; i++)
        {
            if (fr_rooms[i].roomId == data.roomId)
            {
                roomIndex = i;
            }
        }

        fr_rooms[roomIndex].playersId.push(data.playersId);
        fr_rooms[roomIndex].playersName.push(data.playersName);
        fr_rooms[roomIndex].playersSockets.push(socket);

        if (fr_rooms[data.roomIndex].playersId.length == fr_rooms[data.roomIndex].playerCount) {
            //gameBegin
            socket.emit('fr_comeToSetSocket');
        }
        else {
            //just joined
            socket.emit('fr_joinedRoom', { roomId: data.roomId, playerInRoom: fr_rooms[data.roomIndex].playersId.length});
        }

    });

    socket.on('fr_setSocket', function (data) {
        console.log("set roomsocks");
        var roomIndex = -1;
        for (i = 0; i < fr_rooms.length; i++) {
            if (fr_rooms[i].roomId == data.roomId) {
                roomIndex = i;
            }
        }

        RoomData = fr_rooms[roomIndex];
        //fr_rooms.splice(roomIndex, 1);

        roomSocks = RoomData.playersSockets;
        roomPlayersName = dt.playersName;

        socket.emit("setSocket");
    });

});



