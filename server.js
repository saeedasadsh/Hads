var io = require('socket.io')(process.env.PORT || 3000);
var http = require('http');
var shortid = require('shortid');

console.log('server started');





var socks = [];
var players = [];
var gameRomms = [];

var maxPlayer = 6;

var playersArr = [[]];
var playersNameArr = [[]];
var playersAvatarArr = [[]];

var socksArr = [[]];

var fr_rooms = [];
var fr_socks = [];
var fr_players = [];
var fr_playersName = [];

var leagues = [];
var LeaguePlayerCount = [];
var LeaguePlayerCountMax = [];
var leaguesPlayersArr = [[]];
var leaguesPlayersNameArr = [[]];
var leaguesPlayersAvatarArr = [[]];
var leagueSocksArr = [[]];

for (i = 1; i < maxPlayer; i++) {
    playersArr.push([]);
    socksArr.push([]);
    playersNameArr.push([]);
    playersAvatarArr.push([]);
}

var dataQS = {
    var1: "something",
    var2: "something else"
};

var querystring = require("querystring");
var qs = querystring.stringify(dataQS);
var qslength = qs.length;
var options = {
    hostname: "ashabrasaneh.ir",
    port: 80,
    path: "/GamesData/Hads/GetLeaguesForNjs.php",
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': qslength
    }
};

var buffer = "";
var req = http.request(options, function (res) {
    res.on('data', function (chunk) {
        buffer += chunk;
    });
    res.on('end', function () {


        var dt = JSON.parse(buffer);
        for (var i = 0; i < dt.length; i++) {
            var lId = dt[i].leagueId;
            var mP = dt[i].maxPlayer;
            var plc = dt[i].playerCount;
            var canAdd = 1;
            for (var j = 0; j < leagues.length; j++) {
                if (leagues[j] == lId) {
                    canAdd = 0;
                }
            }
            if (canAdd == 1) {
                leagues.push(lId);
                LeaguePlayerCountMax.push(mP);
                LeaguePlayerCount.push(plc);
                leaguesPlayersArr.push([]);
                leaguesPlayersNameArr.push([]);
                leaguesPlayersAvatarArr.push([]);
                leagueSocksArr.push([]);
            }

        }
        console.log("Leagues Added---ready for Play");
    });
});

req.write(qs);
req.end();


(function () {
    var c = 0;
    var timeout = setInterval(function () {
        //do thing
        var dataQS = {
            var1: "something",
            var2: "something else"
        };

        var querystring = require("querystring");
        var qs = querystring.stringify(dataQS);
        var qslength = qs.length;
        var options = {
            hostname: "ashabrasaneh.ir",
            port: 80,
            path: "/GamesData/Hads/GetLeaguesForNjs.php",
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': qslength
            }
        };

        var buffer = "";
        var req = http.request(options, function (res) {
            res.on('data', function (chunk) {
                buffer += chunk;
            });
            res.on('end', function () {


                var dt = JSON.parse(buffer);
                for (var i = 0; i < dt.length; i++) {
                    var lId = dt[i].leagueId;
                    var mP = dt[i].maxPlayer;
                    var plc = dt[i].playerCount;
                    var canAdd = 1;
                    for (var j = 0; j < leagues.length; j++) {
                        if (leagues[j] == lId) {
                            canAdd = 0;
                        }
                    }
                    if (canAdd == 1) {
                        leagues.push(lId);
                        LeaguePlayerCountMax.push(mP);
                        LeaguePlayerCount.push(plc);
                        leaguesPlayersArr.push([]);
                        leaguesPlayersNameArr.push([]);
                        leaguesPlayersAvatarArr.push([]);
                        leagueSocksArr.push([]);
                    }

                }
                console.log("Leagues Added---ready for Play");
            });
        });

        req.write(qs);
        req.end();
        //
    }, 3600000);
})();

io.on('connection', function (socket) {
    var thisClientId = shortid.generate();
    var thisRoomId;
    var roomPlayers = [];
    var roomPlayersName = [];
    var roomPlayerAvatar = [];
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
        var userData = { type: data.type, id: data.id, myName: data.myName, playerCount: data.playerCount, avatar: data.avatar, leagueId: data.leagueId };

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
            playersAvatarArr[(playerCount - 1)].push(userData.avatar);

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

                            var av = playersAvatarArr[lastIndex].pop();
                            roomPlayerAvatar.push(av);

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
                        dt.push({ roomPlayer: roomPlayers[k], isActive: true, playerCards: [], point: 0, turn: k, roomPlayersName: roomPlayersName[k], roomPlayerAvatar: roomPlayerAvatar[k] });
                    }

                    var nobat = Math.floor(Math.random() * (roomPlayers.length));
                    //
                    var data = { roomId: thisRoomId, players: roomPlayers, roomSocks: roomSocks, roomPlayersName: roomPlayersName, nobat: nobat, gameTurn: 0, playersCards: [[]], playerCount: roomSocks.length, roomPlayerAvatar: roomPlayerAvatar };
                    gameRomms.push(data);
                    console.log("nobat", nobat);
                    roomSocks.forEach(function (item, index, arr) {
                        item.emit('GameBegin', { roomId: thisRoomId, gameTurn: 0, nobat: nobat, gameRommsIndex: gameRomms.length - 1, players: { dt }, PlayersCount: dt.length });

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
        else if (userData.type == "league") {
            console.log("join to league");
            for (i = 0; i < leagues.length; i++) {
                if (userData.leagueId == leagues[i]) {
                    console.log(userData.leagueId == leagues[i]);
                    LeaguePlayerCount[i]++;
                    leaguesPlayersArr[i].push(player);
                    leagueSocksArr[i].push(sock);
                    leaguesPlayersNameArr[i].push(userData.myName);
                    leaguesPlayersAvatarArr[i].push(userData.avatar);
                    var max = maxPlayer;

                    var count = leaguesPlayersArr[i].length;

                    if (count >= max) {
                        var playerCounter = 0;
                        var lastIndex = max - 1;
                        while (playerCounter <= max - 1) {

                            var pl = leaguesPlayersArr[i].pop();
                            roomPlayers.push(pl);

                            var nm = leaguesPlayersNameArr[i].pop();
                            roomPlayersName.push(nm);

                            var av = leaguesPlayersAvatarArr[i].pop();
                            roomPlayerAvatar.push(av);

                            var sc = leagueSocksArr[i].pop();
                            roomSocks.push(sc);
                            playerCounter++;
                        }

                        var dt = [];
                        thisRoomId = shortid.generate();
                        for (k = 0; k < roomPlayers.length; k++) {
                            dt.push({ roomPlayer: roomPlayers[k], isActive: true, playerCards: [], point: 0, turn: k, roomPlayersName: roomPlayersName[k], roomPlayerAvatar: roomPlayerAvatar[k] });
                        }

                        var nobat = Math.floor(Math.random() * (roomPlayers.length));
                        //
                        var data = { roomId: thisRoomId, players: roomPlayers, roomSocks: roomSocks, roomPlayersName: roomPlayersName, nobat: nobat, gameTurn: 0, playersCards: [[]], playerCount: roomSocks.length, roomPlayerAvatar: roomPlayerAvatar };
                        gameRomms.push(data);
                        console.log("nobat", nobat);
                        roomSocks.forEach(function (item, index, arr) {
                            item.emit('GameBegin', { roomId: thisRoomId, gameTurn: 0, nobat: nobat, gameRommsIndex: gameRomms.length - 1, players: { dt }, PlayersCount: dt.length });

                        });
                        counter = -1;
                    }


                    for (j = 0; j < leagueSocksArr[i].length; j++) {
                        if (!leagueSocksArr[i][j].connected) {
                            leaguesPlayersArr[i].splice(j, 1);
                            leagueSocksArr[i].splice(j, 1);
                            leaguesPlayersNameArr[i].splice(j, 1);
                            leaguesPlayersAvatarArr[i].splice(j, 1);
                        }
                    }

                    var count = leaguesPlayersArr[i].length;
                    var datal = { counts: count, playerName: leaguesPlayersNameArr[i] };
                    //console.log(datal);
                    for (k = 0; k < leagueSocksArr[i].length; k++) {
                        leagueSocksArr[i][k].emit("OnGetLeaguePlayerCount", datal);
                    }
                }
            }

        }
    });

    socket.on('GetLeaguePlayerCount', function (data) {
        //console.log('GetLeaguePlayerCount', data);
        var leagueId = data.leagueId;
        var leaguesl = [];

        for (i = 0; i < leagues.length; i++) {
            //console.log(leagues[i] + " " + leagueId);
            if (leagues[i] == leagueId) {

                for (j = 0; j < leagueSocksArr[i].length; j++) {
                    if (!leagueSocksArr[i][j].connected) {
                        leaguesPlayersArr[i].splice(j, 1);
                        leagueSocksArr[i].splice(j, 1);
                        leaguesPlayersNameArr[i].splice(j, 1);
                        leaguesPlayersAvatarArr[i].splice(j, 1);
                    }
                }

                var count = leaguesPlayersArr[i].length;
                var datal = { counts: count, playerName: leaguesPlayersNameArr[i] };
                //console.log(datal);
                socket.emit("OnGetLeaguePlayerCount", datal);
            }
        }

    });

    socket.on('setPlayerSocket', function (data) {
        console.log("set roomsocks");
        var ind = -1;

        data.gameRommsIndex;

        for (i = 0; i < gameRomms.length; i++) {
            if (data.roomId == gameRomms[i].roomId) {
                ind = i;
            }
        }
        RoomData = gameRomms[ind];

        roomSocks = RoomData.roomSocks;
        roomPlayersName = RoomData.roomPlayersName;
        roomPlayerAvatar = RoomData.roomPlayerAvatar;
        roomPlayers = RoomData.players;

        roomSocks.forEach(function (item, index, arr) {
            item.emit('setSocket');
        });
    });

    socket.on('deletePlayers', function (data) {
        console.log('deletePlayers', data);

        ids = data.id;
        _leagueId = data.leagueId;

        for (i = 0; i < leagues.length; i++) {
            if (leagues[i] == _leagueId) {
                for (j = 0; j < leaguesPlayersArr[i].length; j++) {
                    for (k = 0; k < ids.length; k++) {
                        if (leaguesPlayersArr[i][j] == ids[k]) {
                            leaguesPlayersArr[i].splice(j, 1);
                            leagueSocksArr[i].splice(j, 1);
                            leaguesPlayersNameArr[i].splice(j, 1);
                            leaguesPlayersAvatarArr[i].splice(j, 1);
                        }
                    }
                }

                var count = leaguesPlayersArr[i].length;
                var datal = { counts: count, playerName: leaguesPlayersNameArr[i] };
                //console.log(datal);
                socket.emit("OnPlayersDeleted", datal);
            }
        }

    });

    socket.on('startGame', function (data) {
        console.log('startGame', data);


        roomSocks.forEach(function (item, index, arr) {
            item.emit('roomStartGame', data);
        });
    });

    socket.on('readyForPlay', function (data) {
        console.log('OnReadyForPlay', data);


        roomSocks.forEach(function (item, index, arr) {
            item.emit('OnReadyForPlay', data);
        });
    });

    socket.on('CanChooseCard', function (data) {
        console.log('CanChooseCard', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('OnCanChooseCard', data);
        });
    });

    socket.on('disconnectFromServer', function (data) {
        console.log("disconnectFromServer id: " + data.id)
        myid = data.id;
        type = data.type;
        playerCount = data.playerCount;

        for (i = 0; i < playersArr[(playerCount - 1)].length; i++) {
            if (playersArr[(playerCount - 1)][i] == myid) {
                playersArr[(playerCount - 1)].splice(i, 1);
                socksArr[(playerCount - 1)].splice(i, 1);
                playersNameArr[(playerCount - 1)].splice(i, 1);
                playersAvatarArr[(playerCount - 1)].splice(i, 1);
                var counts = [];
                for (i = 0; i < playersArr.length; i++) {
                    counts.push(playersArr[i].length);
                }
                var dt = { counts: counts };

                for (k = 0; k < socksArr.length; k++) {
                    var sc = socksArr[k];
                    sc.forEach(function (item, index, arr) {

                        item.emit("roomPlayersCount", dt);

                    });
                }
                return;
            }
        }

    });

    socket.on('disconnect', function (data) {
        console.log("disconnected id: " + data.id)
        myid = thisClientId;
        //type = data.type;
        //playerCount = data.playerCount;

        for (i = 0; i < playersArr.length; i++) {
            for (j = 0; j < playersArr[i].length; j++) {
                if (playersArr[i][j] == myid) {
                    playersArr[i].splice(j, 1);
                    socksArr[i].splice(j, 1);
                    playersNameArr[i].splice(j, 1);
                    playersAvatarArr[i].splice(j, 1);

                    var counts = [];
                    for (k = 0; k < playersArr.length; k++) {
                        counts.push(playersArr[k].length);
                    }
                    var dt = { counts: counts };

                    for (k = 0; k < socksArr.length; k++) {
                        var sc = socksArr[k];
                        sc.forEach(function (item, index, arr) {

                            item.emit("roomPlayersCount", dt);

                        });
                    }

                    console.log('disconnected', thisClientId);
                    return;
                }
            }
        }

        for (i = 0; i < leagues.length; i++) {
            for (j = 0; j < leaguesPlayersArr[i].length; j++) {
                if (leaguesPlayersArr[i][j] == thisClientId) {
                    leaguesPlayersArr[i].splice(j, 1);
                    leagueSocksArr[i].splice(j, 1);
                    leaguesPlayersNameArr[i].splice(j, 1);
                    leaguesPlayersAvatarArr[i].splice(j, 1);
                }
            }

            var count = leaguesPlayersArr[i].length;
            var datal = { counts: count, playerName: leaguesPlayersNameArr[i] };
            //console.log(datal);
            for (k = 0; k < leagueSocksArr[i].length; k++) {
                leagueSocksArr[i][k].emit("OnGetLeaguePlayerCount", datal);
            }
        }



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

    socket.on('resendChoosedCard', function (data) {
        //console.log('choosedcard', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('lastPlayerResendChoosedCard', data);
        });
    });

    socket.on('playerResendCard', function (data) {
        roomSocks.forEach(function (item, index, arr) {
            item.emit('recieveResendedCard', data);
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

    socket.on('ChangeCardToServer', function (data) {
        console.log('ChangeCardToServer', data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('OnChangeCardToServer', data);
        });
    });

    socket.on('checkAlive', function (data) {
        //console.log('checkAlive');
        var data = [];
        roomSocks.forEach(function (item, index, arr) {
            data.push({ alive: item.connected, playerId: roomPlayers[index] });
        });
        //console.log(data);
        roomSocks.forEach(function (item, index, arr) {
            item.emit('checkAliveResponse', { states: data });
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

        for (i = 0; i < fr_rooms.length; i++) {
            if (fr_rooms[i].roomId == data.roomId) {
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
            socket.emit('fr_joinedRoom', { roomId: data.roomId, playerInRoom: fr_rooms[data.roomIndex].playersId.length });
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
        roomPlayerAvatar = dt.roomPlayerAvatar;

        socket.emit("setSocket");
    });


    socket.on('SendDataToServer', function (data) {
        console.log('header', data.header);

        roomSocks.forEach(function (item, index, arr) {
            item.emit('SendDataToClients', data);
        });
    });

});



