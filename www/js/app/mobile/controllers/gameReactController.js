var temp;
game325.controller('gameReactController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','Session','errService','XPService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, Session, errService, XPService){
    $scope.pageClass = 'page-game';
    $scope.gameId = $stateParams.id;
    $scope.gameRoom = 'PUBLIC';
    if($stateParams.type == 0){
        $scope.gameRoom = 'PRIVATE';
    }
    $scope.waiting = true;
    $scope.ready = false;
    $scope.chatMsg = '';
    $scope.player = 0;
    $scope.profilepicsize = 50 + 10;
    $scope.showScores = false;
    $scope.withDrawEnabled = false;
    $scope.chatMsg;
    $scope.user = Session;
    $scope.gameRound = 0;
    if(!Session.name){
        $state.go('cover');
    }
    $(window).resize(function(){
          $scope.reactRender()
    })
    $scope.closeScores = function (){
        $scope.showScores = false;
    }
    $scope.gameBodyStyle = function(){
        return {
            width : gameCSSConstants.gameBody.x,
            height : gameCSSConstants.gameBody.y
        }
    }
    $scope.getMsgTemplate = function (content){
        var x ='<md-item>'+
                    '<md-item-content>'+
                      '<div class="md-tile-left ball" style="background: #fff url('+content.userPic+');background-position:'+content.backgroundPosition+'; background-size: cover; margin-right: 0;">'+
                      '</div>'+
                      '<div class="md-tile-content">'+
                        '<h4>' + content.userName +'</h4>'+
                        '<p>'+
                          content.body+
                        '</p>'+
                      '</div>'+
                    '</md-item-content>'+
                  '  <md-divider></md-divider>'+
                  '</md-item>';             
        return x;
    }
    if($scope.gameId){
        $scope.gameType = 'LIVE';
    }else{
        $scope.gameType = 'BOTS';
    }
    $scope.startGame = function(){
        if(($scope.gameType == 'LIVE' && $scope.game325 && $scope.game325.players.length == 3) || ($scope.gameType == 'BOTS')){
            return true;
        }
    }
    $scope.getBgColor = function () {
        return {
            backgroundColor : globalVars.activeBgColor
        }
    }
    $scope.getBackClass = function (){
        return globalVars.backClass;
    }
    $scope.totalGames = 9;
    $scope.sendEvent = function(data){
        angular.element('.bottom-player-diabled').css('display', 'block');
        if($scope.gameType == 'LIVE'){
            socket.emit('GAME', {data : data});  
        }else{
            if(data.gameEvent == 'NEXT_ROUND'){
                console.log('xp display');
                $scope.gameRound++;
                if($scope.gameRound == $scope.totalGames && $scope.gameType == 'BOTS'){
                    var points = localStorage.getItem('points');
                    points = JSON.parse(points);
                    $mdDialog.show({
                      template:
                        '<md-dialog>' +
                        '  <md-content> <h3 class="md-title marg-4"> End of round '+$scope.gameRound+' </h3>'+
                        '<h4 style="margin:1px; padding:1px; text-align:center; color:green; font-size:0.8em; "> Your Total XP = ' + points.xp + '</h4>' + 
                         '  <div class="md-actions">' +
                         '<md-button ng-click="newGame()" aria-label="newGame"> New Game</md-button>'+
                         '  </div>' +
                        '</md-content></md-dialog>',
                        clickOutsideToClose : false,
                        escapeToClose : false,
                        controller: 'errDialogController'
                    });
                }else{
                    var t = '';
                    t+='<table class="score-table"><thead>';
                    t+='<th>Round</th>';
                    for (var i = 0; i < $scope.game325.players[0].scores.length; i++) {
                        var k = i+1;
                        $scope.gameRound = k;
                        t+='<th>'+k+'</th>';
                    };
                    t+='<th>Total</th>';
                    t+='</thead>';
                    for (var i = 0;i < $scope.game325.players.length; i++) {
                        if(i==0){
                            t+='<tr><td>You</td>';
                        }else{
                            t+='<tr><td>'+$scope.game325.players[i].name+'</td>';
                        }
                        var totalHandsToMake = 0;
                        var totalHandsMade = 0;
                        for (var j = 0; j < $scope.game325.players[i].scores.length; j++) {
                            totalHandsToMake+= $scope.game325.players[i].scores[j].handsToMake;
                            totalHandsMade+= $scope.game325.players[i].scores[j].handsMade;
                            var x = $scope.game325.players[i].scores[j].handsMade - $scope.game325.players[i].scores[j].handsToMake;
                            var n = '';
                            if(x > 0){
                                n = '<span style="color:green">(+'+x+')</span>';
                            }
                            if(x < 0){
                                n = '<span style="color:red">('+x+')</span>';
                            }
                            if(x == 0){
                                n = '<span style="color:blue">(0)</span>';   
                            }
                            // t+='<td>'+$scope.game325.players[i].scores[j].handsToMake+'/'+$scope.game325.players[i].scores[j].handsMade+'</td>';
                            t+='<td>'+$scope.game325.players[i].scores[j].handsMade+' '+n+'</td>';
                        }
                        var x = totalHandsMade - totalHandsToMake;
                        var n = '';
                        if(x > 0){
                            n = '<span style="color:green">(+'+x+')</span>';
                        }
                        if(x < 0){
                            n = '<span style="color:red">('+x+')</span>';
                        }
                        if(x == 0){
                            n = '<span style="color:blue">(0)</span>';   
                        }
                        // t+='<td>'+$scope.game325.players[i].scores[j].handsToMake+'/'+$scope.game325.players[i].scores[j].handsMade+'</td>';
                        t+='<td>'+totalHandsMade+' '+n+'</td>';
                        t+='</tr>';
                    };
                    t+='</table>';
                    setTimeout(function () {
                        var points = localStorage.getItem('points');
                        points = JSON.parse(points);
                        $mdDialog.show({
                          template:
                            '<md-dialog style="border-radius:15px;">' +
                            '  <md-content style="font-size:0.7em; border-radius:15px;"> <h3 class="md-title marg-4"> End of round '+$scope.gameRound+' </h3>'+
                            '<h4 style="margin:1px; padding:1px; text-align:center; color:green; font-size:0.8em; "> Your Total XP = ' + points.xp + '</h4>'  + t+
                             '  <div class="md-actions">' +
                             '<md-button ng-click="nextRound()" aria-label="nextRound" style="background-color:#ccc;"> Continue </md-button>'+
                             '  </div>' +
                            '</md-content></md-dialog>',
                            clickOutsideToClose : false,
                            escapeToClose : false,
                            controller: 'errDialogController'
                        });
                    }, 1200)
                }
            }else{
                $scope.gameEvent(data);
            }
        }
    }
    $scope.outdateXP = function(){
        points = localStorage.getItem('points');
        if(points == null){
            var points = {
                roundsPlayed: 0,
                updateStatus: 'outdated',
                xparray: [0],
                xp: 0
            }
            localStorage.setItem('points', JSON.stringify(points));
        }else{
            points = JSON.parse(points);
        }
        points.updateStatus = 'outdated';
        localStorage.setItem('points', JSON.stringify(points));
    }
    $scope.calculateXP = function(){
        points = localStorage.getItem('points');
        if(points == null){
            var points = {
                roundsPlayed: 0,
                updateStatus: 'outdated',
                xparray: [0],
                xp: 0
            }
            localStorage.setItem('points', JSON.stringify(points));
        }else{
            points = JSON.parse(points);
        }
        var lastRound = $scope.game325.players[0].scores.length - 1;
        var handsMade = $scope.game325.players[0].scores[lastRound].handsMade;
        var handsToMake = $scope.game325.players[0].scores[lastRound].handsToMake;
        var diff = handsMade - handsToMake;
        var xp = 0;
        xp+= handsMade*10;
        if(diff == 0){
            xp+=20;
        }else if(diff < 0){
            xp+= diff*5;
        }else if(diff > 0){
            xp+= 40;
            xp+= Math.pow(5,diff);
        }
        if(xp < 0){
            xp = 0;
        }
        if(points.updateStatus != 'updated'){
            points.xp += xp;
            points.xparray.push(points.xp);
            points.roundsPlayed ++;
            points.updateStatus = 'updated';
            localStorage.setItem('points', JSON.stringify(points));
        }
        XPService.getXP();
    }
    $scope.initPlayers = function(){
        $scope.players =  Array();
        for (var i = 0; i < gameVars.noOfPlayers; i++) {
            var player = new Player(i);
            player.position = i;
            if(i == 0){
                player.type = 'you'
                player.name = 'You';
                player.image = Session.image;
            }else{
                player.type = 'bot';
                player.name = gameVars.botsName[i];
                player.image = i;
            }
            $scope.players.push(player);
        }
    }
    $scope.updateScores = function (players){
        $rootScope.arrPlayers = players;
    }
    $scope.showScores = false;
    $scope.toggleScores = function(ev){
        // // console.log(ev);
         $mdDialog.show({
            templateUrl: 'templates/scoredialog.html',
            controller: 'scoreDialogController'
        });
         $('.fracscore').each(function(key, value) {
            $this = $(this)
            var split = $this.html().split("/")
            if( split.length == 2 ){
                $this.html('<span class="fracscore-top">'+split[0]+'</span>'+
                    '<span class="fracscore-bottom">'+split[1]+'</span>');
            }    
        });
    }
    $scope.startNewGame = function(){
        var gameData = new Game();
        $scope.playerId = 0;
        $scope.waiting = false;
        $scope.ready = true;
        gameData.gameTurn = 1;
        $scope.initPlayers();
        gameData.players = $scope.players;
        gameData.activePlayerId = gameData.players[0].id;
        $rootScope.arrPlayers = gameData.players;
        gameData.gameEvent = 'START_GAME';
        $scope.game325 = gameData;
        var data = {
            gameEvent : 'START_GAME'
        }
        $scope.gameEvent(data);
    }
    $scope.reactRender = function(){
        var game = $scope.game325;
        var playerId = $scope.playerId;
        var type = $scope.gameType;
        var a = React.createFactory(Game325Component);
        var x = a({scope : $scope, game : game, playerId : playerId, type : type});
        React.render(x, document.getElementById('gameRender'));
    }
    $scope.gameEvent = function(data){
        var gameEvent = data.gameEvent;
        var gameData = $scope.game325;
        gameData.returnCard = false;
        var fnCall;
        switch(gameEvent){
            case "START_GAME":
                Game.prototype.initDeck.call(gameData);
                Game.prototype.distributeCards.call(gameData);
                Game.prototype.updateHandsToMake.call(gameData);
                gameData.gameTurn = 1;
                gameData.gameState  ='SET_TRUMP';
                gameData.gameEvent  ='SET_TRUMP';
                // Game.prototype.assignPlayerIds.call(gameData);
                break;
            case "NEXT_ROUND":
                Game.prototype.initDeck.call(gameData);
                Game.prototype.distributeCards.call(gameData);
                Game.prototype.nextRound.call(gameData);
                gameData.gameState  ='SET_TRUMP';
                gameData.gameEvent  ='SET_TRUMP';
                break;
            case "SET_TRUMP":
                gameData.trump = data.trump;
                Game.prototype.distributeCards.call(gameData);
                gameData.gameState  ='PLAY_CARD';
                gameData.gameEvent  ='PLAY_CARD';
                var y = Game.prototype.withdrawCards.call(gameData);
                if(y){
                    gameData.gameState  ='WITHDRAW_CARD';
                    gameData.gameEvent  ='WITHDRAW';
                }
                break;
            case "WITHDRAW_CARD":
                fnCall = 'WITHDRAW_CARD';
                gameData.cardIndex = data.card;
                Game.prototype.moveWithdrawCard.call(gameData);
                //Game.prototype.withdrawCard.call(gameData);
                gameData.gameState  = 'RETURN_CARD';
                gameData.gameEvent ='RETURN';
                break;
            case "RETURN_CARD":
                fnCall = 'RETURN_CARD';
                gameData.cardIndex = data.card;
                gameData.card = data.card;
                Game.prototype.moveReturnCard.call(gameData);
                gameData.returnCard = true;
                var self = this;
                var y = Game.prototype.withdrawCards.call(gameData);
                if(y){
                    gameData.gameState  = 'WITHDRAW_CARD';
                    gameData.gameEvent = 'WITHDRAW';
                    var x = JSON.stringify(gameData);
                }
                else{
                    Game.prototype.assignActivePlayer.call(gameData);
                    gameData.gameState  ='PLAY_CARD';
                    gameData.gameEvent = 'PLAY_CARD';
                }
                break;
            case "PLAY_CARD":
                gameData.cardPlayed = data.cardPlayed;
                Game.prototype.playCard.call(gameData);
                if((gameData.gameTurn % 3) == 1){
                    gameData.turnSuit = gameData.cardPlayed.suit;
                }
                if((gameData.gameTurn % 3) == 0){
                    Game.prototype.nextTurn.call(gameData);
                    Game.prototype.getTurnWinner.call(gameData);
                    gameData.gameState  ='PLAY_CARD';
                    gameData.gameEvent  = 'DECLARE_WINNER';
                }else{
                    Game.prototype.nextTurn.call(gameData);
                    gameData.gameState  ='PLAY_CARD';
                    gameData.gameEvent  = 'CARD_PLAYED';
                }
                break;
            default:
                break;
            }
            $scope.game325 = gameData;
            if($scope.gameType == 'BOTS' && $scope.gameState != 'WITHDRAW_CARD' && $scope.gameState != 'RETURN_CARD'){
                localStorage.setItem('gameData', JSON.stringify($scope.game325));
            }
            $scope.reactRender();
            if($scope.game325.gameEvent == 'SET_TRUMP'){
                $scope.game325.trumpsetcheck = true;
            }
            if($scope.playerId == $scope.game325.activePlayerId && $scope.game325.gameEvent != 'RETURN' && ($scope.game325.gameEvent != 'WITHDRAW' || $scope.game325.trumpsetcheck)){
                var delay = 1000;
                if($scope.game325.gameEvent == 'DECLARE_WINNER'){
                    delay = 2600;
                }
                if($scope.game325.gameEvent == 'SET_TRUMP'){
                    delay = 1100;
                    $scope.game325.trumpsetcheck = true;
                }
                if(($scope.game325.gameEvent == 'PLAY_CARD' || $scope.game325.gameEvent == 'WITHDRAW')  && $scope.game325.trumpsetcheck){
                    delay = 1500;
                    $scope.game325.trumpsetcheck = false;   
                }
                setTimeout(function (){
                    angular.element('.bottom-player-diabled').css('display', 'none');  
                    // console.log(delay);
                }, delay);
            }
    }
    if($scope.gameType == 'LIVE'){
        //Register Events Only When Game Mode Is Live Type
        socket.removeAllListeners();
        socket.emit('JOIN_ROOM', {roomId : $scope.gameId, user : $scope.user});
        socket.on('CONNECTED', function(data){
            $scope.playerId = data.id;
            if (data.start == 'closed') {
                var x = {
                    gameEvent : 'START_GAME'
                }
                socket.emit('GAME', {data : x});
            };
        });
        socket.on('GAME_STATUS', function(data){
            $scope.connectedPlayers  = [];
            for (var i = data.data.players.length - 1; i >= 0; i--) {
                $scope.connectedPlayers.push(data.data.players[i]);
            }
            var n = 3-$scope.connectedPlayers.length;
            $scope.PlayersToJoinMsg = 'Waiting for '+n+' more player(s) to connect';
            if(data.data.status == 'closed'){
                $scope.waiting = false;
                $scope.ready = true;
            };
        });
        socket.on('GAME', function (data){
            $scope.game325 = data.data;
            $scope.reactRender();
            if($scope.playerId == $scope.game325.activePlayerId){
                $timeout(function () {
                    if(document.getElementById('bottomPlayerDiabled').style.display == 'block'){
                        angular.element('.bottom-player-diabled').css('display', 'none');
                    }
                }, 3000);
            }
            
        });
        socket.on('INVALID', function (data){
            alert('Invalid Room');
            $state.go('cover');
        });
        socket.on('DISCONNECTED', function (data){
            for (var i = $scope.game325.players.length - 1; i >= 0; i--) {
                if($scope.game325.players[i].id == data.id){
                    $scope.game325.players[i].status = 'disconnected';
                }
            }
            $scope.reactRender();
        });
        socket.on('CONNECTED_2', function (data){
            $scope.playerId = data.id;
            $scope.game325 = data.data;
        });
        socket.on('NO_PLAYER_LEFT', function (data) {
            $state.go('cover');
        })
        socket.on('msgRecieved', function (data){
            if(data.player.user){
                if(data.player.user.type == 'local'){
                    userPic = '/assets/img/avatars.png';
                    backgroundPosition = 45*data.player.user.image+'px 0px';
                }else{
                    userPic = data.player.user.image;
                    backgroundPosition = '50% 50%';
                }
                $scope.msg = {
                    body : data.msg.msg,
                    userName : data.player.user.name,
                    userId : data.player.id,
                    userPic : userPic,
                    backgroundPosition : backgroundPosition
                }
            }
            for (var i = $scope.game325.players.length - 1; i >= 0; i--){
                if($scope.game325.players[i].id == data.player.id){
                    $scope.game325.players[i].msg = data.msg.msg;
                    $scope.game325.msgRender = true;
                }
            }
            $scope.reactRender();
            var e = $scope.getMsgTemplate($scope.msg);
            angular.element('.chat-box').append(e);
            for (var i = $scope.game325.players.length - 1; i >= 0; i--){
                if($scope.game325.players[i].id == data.player.id){
                    temp = i;
                    var fn = function(){
                       $scope.game325.players[temp].msg = ''; 
                    }
                    delayService.asyncTask(3000, fn);
                }
            }
            $(".chat-hist").scrollTop($(".chat-hist")[0].scrollHeight);
        });
        socket.on('PlayerLeft', function (data){
            $state.go('cover');
        });
    }else{
        //BOTS PLAY MODE
        var gameData = localStorage.getItem("gameData");
        var gameData = JSON.parse(gameData);
        var msg = "Continue last game ?";
        if(gameData && gameData.players[0].cards.length!=0){
            // console.log();
            $mdDialog.show({
              template:
                '<md-dialog>' +
                '  <md-content> <h2 class="md-title">'+msg+'</h2>'+
                 '  <div class="md-actions">' +
                 '<md-button ng-click="loadGame()" aria-label="loadGame"> Yes. </md-button>'+
                 '<md-button ng-click="newGame()" aria-label="newGame"> No </md-button>'+
                 '  </div>' +
                '</md-content></md-dialog>',
                clickOutsideToClose : false,
                escapeToClose : false,
                controller: 'errDialogController'
            });
        }else{
            $scope.startNewGame()
        }
    }
    $scope.$on('LOAD_GAME', function(){
        $scope.loadGame();
        $scope.reactRender();
      });
    $scope.$on('NEXT_ROUND', function () {
        // $scope.loadGame();
        var data = {
            gameEvent : 'NEXT_ROUND'
        }
        $scope.gameEvent(data);
    })
    $scope.$on('NEW_GAME', function(){
        $scope.startNewGame();
      });
    $scope.loadGame = function(){
        $scope.playerId = 0;
        $scope.waiting = false;
        $scope.ready = true;
        $rootScope.arrPlayers = gameData.players;
        $scope.game325 = gameData;
        angular.element('.loading').css('display','block');
        setTimeout(function () {
            angular.element('.loading').css('display','none');
        },4000)
        if($scope.playerId == $scope.game325.activePlayerId){
            var delay = 1000;
            if($scope.game325.gameEvent == 'DECLARE_WINNER'){
                delay = 2600;
            }
            if($scope.game325.gameEvent == 'SET_TRUMP'){
                delay = 1100;
                $scope.game325.trumpsetcheck = true;
            }
            if(($scope.game325.gameEvent == 'PLAY_CARD' || $scope.game325.gameEvent == 'WITHDRAW') && $scope.trumpsetcheck){
                delay = 1500;
                $scope.game325.trumpsetcheck = false;   
            }
            setTimeout(function (){
                if(document.getElementById('bottomPlayerDiabled').style.display == 'block'){
                    angular.element('.bottom-player-diabled').css('display', 'none');    
                }
            }, delay);
        }
    }
    $scope.sendChat = function(){
        var msg = $scope.chatMsg;
        if(msg.length > 0){
            socket.emit('sendMsg', {msg : msg, user : $scope.user});
            $scope.chatMsg = '';
        }
    }
    //other player cards will not be shown
    $scope.hiddenCard = function(){
        return {
            card : {
                suit : 0,
                rank : 0
            }
        }
    }
    $scope.closeRight = function() {
        $mdSidenav('right').close()
        var fn = function(){
            if(!$(".md-sidenav-right").hasClass("md-closed")){
                $(".md-sidenav-right").addClass("md-closed");
                $(".md-sidenav-backdrop").remove();
                $('.content').removeClass('push-left');
            }    
        }
        promiseClose = $timeout(fn, 200);
    };
    $scope.toggleRight = function() {
        // // console.log('toggleRightcalled');
        $mdSidenav('right').toggle();
        var fn = function(){
            if($(".md-sidenav-right").hasClass("md-closed")){
                $(".md-sidenav-right").removeClass("md-closed");
                $(".md-sidenav-right").before('<md-backdrop class="md-sidenav-backdrop md-opaque ng-scope md-default-theme" style=""></md-backdrop>');
                $('.content').addClass('push-left');
            }
        }
        promiseOpen = $timeout(fn, 200);
    };
    $scope.exitGame = function(){
        // console.log('exitGame called');
        if($scope.gameType == 'LIVE'){
            var msg = 'You are about to be disconnected from other players. Other players will lose their game too.';
        }else{
            var msg = 'Are you sure you want to quit game?';
        }
        $mdDialog.show({
              template:
                '<md-dialog>' +
                '  <md-content> <h2 class="md-title"> Exit Game? </h2> <p> ' +msg+
                 '  <div class="md-actions">' +
                 '<md-button ng-click="goBack()" aria-label="goBack"> Yes exit game. </md-button>'+
                 '<md-button ng-click="closeDialog()" aria-label="closeDialog"> Continue playing </md-button>'+
                 '  </div>' +
                '</md-content></md-dialog>',
                clickOutsideToClose : false,
                escapeToClose : false,
                controller: 'errDialogController'
            });
    }
    // Prevent to use the back button.
    $scope.$on('$locationChangeStart', function(event) {
        if(!$scope.waiting && !$scope.gameType == 'LIVE'){
            event.preventDefault();
            $scope.exitGame();        
        }
    });
    $scope.$on('EXIT_CURRENTGAME', $scope.exitGame);

}])
game325.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
    });
game325.controller('scoreDialogController',['$scope', '$mdDialog', '$rootScope', function ($scope, $mdDialog, $rootScope){

    $scope.updateXP = function(){
        var points = localStorage.getItem('points');
        points = JSON.parse(points);
        $scope.xp = points.xp;
    }

    $scope.closeDialog = function(){
            $mdDialog.hide();
        };
    $scope.arrPlayers = $rootScope.arrPlayers;
    $scope.updateXP();

    // // console.log($rootScope.arrPlayers);
}]);
/*game325.directive('gameBody', function (){
    return {
        restrict : 'A',
        scope : {
            data : '=',
            game : '=',
            playerId : '=',
            type : '='
        },
        link : function (scope, elem, attrs){
                scope.gameEvent = function(evt){
                    // console.log(scope);
                    scope.$parent.sendEvent(evt);
                },
                scope.updateScores = function(players){
                    scope.$parent.updateScores(players);
                },
                scope.$watch('game', function (){
                    var game = scope.$parent.game325;
                    var playerId = scope.$parent.playerId;
                    var type = scope.$parent.gameType;
                    var a = React.createFactory(Game325Component);
                    var x = a({scope : scope, game : game, playerId : playerId, type : type});
                    React.render(x, elem[0]);
                })
        }
    }
})
*/