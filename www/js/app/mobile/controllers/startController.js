game325.controller('startController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', 'XPService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService, XPService){
    $scope.pageClass = 'page-home';
    $scope.joinGameRoomId = '';
    $scope.xp = 0;
    $scope.xpColor = '#009688';
    $scope.xpBGColor = '#FFE082';
    $scope.checkWelcomeMsgs = function(){
      if($rootScope.loggedIn){
        welcome = localStorage.getItem('welcome');
        if(welcome){
          welcome = JSON.parse(welcome);
          if(welcome.msg1 != 'SHOWN'){
            welcome.msg1 = 'SHOWN';
            localStorage.setItem("welcome", JSON.stringify(welcome));
            $scope.showWelcomeMsg1();
          }
          if(welcome.msg2 < 3){
            welcome.msg2++;
            localStorage.setItem("welcome", JSON.stringify(welcome));
          }else if(welcome.msg2 == 3 || welcome.msg2 == 50 || welcome.msg2 == 250){
            welcome.msg2++;
            localStorage.setItem("welcome", JSON.stringify(welcome));
            $scope.showWelcomeMsg2();
          }else{
            welcome.msg2++;
            localStorage.setItem("welcome", JSON.stringify(welcome));
          }
        }else{
          welcome = {
            msg1 : 'SHOWN',
            msg2 : 1
          }
          localStorage.setItem("welcome", JSON.stringify(welcome));
          $scope.showWelcomeMsg1();
        }
      }
    }
    $scope.showWelcomeMsg1 = function(){
      $mdDialog.show({
                          template:
                            '<md-dialog>' +
                            '  <md-content> <h3 class="md-title marg-4"> Thanks for updating! </h3>'+
                            '<div class="xptext"><p> With this update, apart from a few bug fixes, we have included the much awaited Leaderboard. </p>'+
                             '  <div class="md-actions">' +
                             '<md-button ng-click="closeDialog()" aria-label="closeXPDialog"> Close </md-button>'+
                             '<md-button ng-click="goToLeaderBoard()" aria-label="goToLeaderBoard"> Visit Leaderboard </md-button>'+
                             '  </div>' +
                            '</md-content></md-dialog>',
                            clickOutsideToClose : false,
                            escapeToClose : false,
                            controller: 'errDialogController'
                        });
    }
    $scope.showWelcomeMsg2 = function(){
      $mdDialog.show({
                          template:
                            '<md-dialog>' +
                            '  <md-content> <h3 class="md-title marg-4" style="margin-bottom: 10px;"> <img src="assets/img/heart.png" style="width:30px; position: relative; top: 7px; left: -5px;"/>Do you love this game? </h3>'+
                            '<div class="xptext"><p style="line-height:1.5;"> Please rate us and give your reviews on Google Play. This keeps our motivation high, allows us to constantly improve and continue building new games! </p>'+
                             '  <div class="md-actions">' +
                             '<md-button ng-click="rateUsOnGooglePlay()" aria-label="goToLeaderBoard" style="background-color: #FF5722;color: #fff;"> Rate Us Now! </md-button>'+
                             '<md-button ng-click="closeDialog()" aria-label="closeXPDialog"> Later </md-button>'+
                             '  </div>' +
                            '</md-content></md-dialog>',
                            clickOutsideToClose : false,
                            escapeToClose : false,
                            controller: 'errDialogController'
                        });
    }
    $scope.checkWelcomeMsgs();
    $scope.deactivateMultiplayer = function(){
      $scope.multiplayerBtnMsg = 'Internet required to Play Multiplayer';
      $scope.showMultiplayerOptions = false;
    }
    $scope.activateMultiplayer = function(){
      $scope.multiplayerBtnMsg = 'Play Multiplayer';
    }
    if($rootScope.currentConnStatus == 'online'){
      $scope.activateMultiplayer();
    }else{
      $scope.deactivateMultiplayer();
    }
    
    // Naisheel Change here abc
    $scope.showStartGame = false;
    $scope.showCreateGame = false;
    $scope.showJoinGame = false;
    $scope.roomText = 'Create Private Room';
    if($state.current.name == 'start'){
        $scope.showStartGame = true;
    }
    if($state.current.name == 'create'){
        $scope.showCreateGame = true;
    }
    if($state.current.name == 'join'){
        $scope.showJoinGame = true;
    }
    $scope.loading = false;
    $scope.showMultiplayerOptions = false;
    // console.log($scope.showLoggedInOptions);
    $scope.goToLeaderBoard = function (){
      $state.go('leaderboard');
    }
    $scope.toggleMultiplayerOptions = function (){   
      $scope.checkLogin();
      if($rootScope.currentConnStatus == 'online'){
        if($scope.showMultiplayerOptions == false){
          $scope.showMultiplayerOptions = true;
        }else{
          $scope.showMultiplayerOptions = false;
        }
      }else{
        errService.showErrSimple('Connect to internet to play multiplayer.');
      }
      // console.log($scope.showLoggedInOptions);
          // Naisheel Change here abc Some problem with showLoggedInOptions, I am not able to figure out!
    }
    AuthService.get().then(function (data) {
        $scope.loggedinuser = data.data.user;
       if(data.data.error){
       }else{
           // socket.emit('joinRoom', {roomId : $scope.gameId});        
       }
    });
    $scope.updateXP = function(){
      points = localStorage.getItem('points');
      if(points == null){
          var points = {
              roundsPlayed: 0,
              lastRound: 0,
              xparray: [0],
              xp: 0
          }
          localStorage.setItem('points', JSON.stringify(points));
      }else{
          points = JSON.parse(points);
      }
      $scope.xp = points.xp;
      if($scope.xp > 5000){
        $scope.xpColor = '#B71C1C';
        $scope.xpBGColor = '#FFC107';
      }else if($scope.xp > 1000){
        $scope.xpColor = 'white';
        $scope.xpBGColor = '#3F51B5';
      }else if($scope.xp > 500){
        $scope.xpColor = 'white';
        $scope.xpBGColor = '#673AB7';
      }else if($scope.xp > 100){
        $scope.xpColor = 'white';
        $scope.xpBGColor = '#F44336';
      }else{
        $scope.xpColor = '#009688';
        $scope.xpBGColor = '#FFE082'; 
      }
      // if($rootScope.loggedIn  && points.xp>99 && points.xparray.length<3){
      //   $scope.getXPFromDB();
      // }
    }
    $scope.getXPFromDB = function(){
      $mdDialog.show({
                          template:
                            '<md-dialog>' +
                            '  <md-content> <h3 class="md-title marg-4"> Experience Points (XP)</h3>'+
                            '<div class="xptext"><p>XP are gained for every hand made, lost for hand-deficits, and bonus points for every extra hands made. </p>'+
                            '<p>Login with Facebook to sync XP and appear on the Leaderboard.</p>'+
                             '  <div class="md-actions">' +
                             '<md-button ng-click="closeDialog()" aria-label="closeXPDialog"> Close </md-button>'+
                             '<md-button ng-click="gotToLeaderBoard()" aria-label="goToLeaderBoard"> Leaderboard </md-button>'+
                             '  </div>' +
                            '</md-content></md-dialog>',
                            clickOutsideToClose : false,
                            escapeToClose : false,
                            controller: 'errDialogController'
                        });
      XPService.getXP($scope.updateXP);
    }
    XPService.getXP($scope.updateXP);
    // $scope.changeClass = function(a){
    //       if(a == 'game-325'){
    //         var req = {};
    //         if(Session.name && Session.type != 'local'){
    //             console.log(Session);
    //             $scope.showLoggedInOptions = true;
    //         }else{
    //           startGameService.start(req).then(function(res){
    //             $state.go('game/:id', {id : res.data.roomId, type : res.data.type});      
    //           });
    //         }
    //       }
    //     }
    $scope.goToHelp = function(){
      $state.go('blog');
    }
    $scope.startGame = function(e){
        if(e == 'bots'){
          $state.go('game325');
        }else{
          var req = {};
          startGameService.start(req).then(function(res){
            // console.log(res);
            $state.go('game/:id', {id : res.data.roomId, type : res.data.type});
          });
        }
    }
    $scope.createGame = function(){
        var req = {};
        startGameService.create(req).then(function(res){
            console.log(res.data)
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
    }
    $scope.goToCover = function(){
      setTimeout(function(){
        $state.go('cover');
      }, 100);
    }
    $scope.toggleRoomOptions = function () {
        if($scope.joinGameRoomId.length == 0){
          $scope.roomText = 'Create Private Room';
        }else{
          $scope.roomText = 'Join';
        }
    }
    $scope.joinGame = function(){
        console.log($scope.joinGameRoomId);
        if($scope.joinGameRoomId.length == 0){
          $scope.createGame();
          return false;
        }
        var req = {
            roomId : $scope.joinGameRoomId
        }
        startGameService.join(req).then(function(res){
            console.log(res.data)
            if(res.data.error){
                $scope.roomerror();
                return false;
            }
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
        $scope.roomerror = function(ev) {
         $mdDialog.show({
          template:
            '<md-dialog>' +
            '    <md-button style="background-color: rgba(241,103,103,1)!important" ng-click="closeDialog()" aria-label="closedialog">' +
            '      <i class="fa fa-times" style="float:right;"></i>' +
            '    </md-button>' +
            '  <md-content>Invalid Room!' +
            '</md-content></md-dialog>',
            controller: 'errDialogController'
        });
      }
    }
    $scope.loggedIn = $rootScope.loggedIn;
    $scope.profile = {
        name : '',
        image : '',
        backgroundPosition : ''
    }
    $scope.checkLogin = function(){
      if(Session.name){
        $scope.profile.name = Session.name;
        $rootScope.loggedIn = true;
      }
      if(Session.type == 'local'){
          $scope.profile.image = 'assets/img/avatars.png';
          $scope.profile.backgroundPosition = 45*Session.image+'px 0px';
          $scope.showfb = false;
        }else{
        $scope.profile.image = Session.image;
        $scope.profile.backgroundPosition = '50% 50%';
        $scope.showfb = true;
        // localStorage.setItem('showLoggedInOptions', true);
      }
      $scope.loggedIn = $rootScope.loggedIn;
      $scope.showLoggedInOptions = localStorage.getItem('showLoggedInOptions');
    }
    $scope.deleteProfile = function(){
        $scope.profile.name = null;
        $scope.profile.image = null;
        $scope.profile.backgroundPosition = null;
        $rootScope.loggedIn = false;
    }
    $scope.checkLogin();
    $scope.$on(AUTH_EVENTS.loginSuccess, $scope.checkLogin);
    $scope.$on(AUTH_EVENTS.notAuthenticated, $scope.deleteProfile);
    
    $scope.showProfile = function(){
      var id = localStorage.getItem('userId');
      id = JSON.parse(id);
      if(id.type == 'local'){
        console.log('from start controller');
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
    $scope.toastPosition = {
        bottom: false,
        top: true,
        left: false,
        right: true
    };
    $scope.getToastPosition = function() {
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };
    $scope.ifNotFbLoggedIn = function(){
      if($scope.showMultiplayerOptions){
        if($scope.showfb){
          return false;
        }else{
          return true;
        }
      }else{
        return false;
      }
    }
    $scope.ifFbLoggedIn = function(){
      if($scope.showMultiplayerOptions){
        if($scope.showfb){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
    $scope.updateXP();
    $scope.$on(AUTH_EVENTS.loginSuccess, $scope.checkLogin);
    $scope.$on('DEVICE_OFFLINE', $scope.deactivateMultiplayer);
    $scope.$on('DEVICE_ONLINE', $scope.activateMultiplayer);
}]);

game325.controller('errDialogController',['$rootScope', '$scope', '$mdDialog', '$state', '$mdToast', function($rootScope, $scope, $mdDialog, $state, $mdToast){
    $scope.rateUsOnGooglePlay = function(){
        $mdDialog.hide();
        window.location.href = 'market://details?id=com.game.teendopaanch';
    }
    $scope.goToLeaderBoard = function(){
        $mdDialog.hide();
        $state.go('leaderboard');
    }
    $scope.likeUsOnFacebook = function(){
      $mdDialog.hide();
      window.location.href = 'http://www.facebook.com/325game/';
    }
    $scope.closeDialog = function(){
        $mdDialog.hide();
    };
    $scope.goToHome = function(){
      $mdDialog.hide();
      $state.go('cover');
    }
    $scope.goBack = function(){
      // console.log('Go Back Called');
      history.go(-1);
      navigator.app.backHistory();
    }
    $scope.loadGame = function(){
      $rootScope.$broadcast('LOAD_GAME');
      $mdDialog.hide();
    }
    $scope.newGame = function(){
      $rootScope.$broadcast('NEW_GAME');
      $mdDialog.hide();
    }
    $scope.nextRound = function(){
      $rootScope.$broadcast('NEXT_ROUND');
      $mdDialog.hide();
    }
    $scope.exitGame = function () {
      $mdDialog.hide();
      navigator.app.exitApp();
    }
    $scope.cancelExit = function () {
      $mdDialog.hide();
      // history.go(-1);
      // navigator.app.backHistory();
    }
}]);
game325.controller('infoController', ['$rootScope', '$http', '$scope', '$state', '$stateParams', 'Session', function ($rootScope, $http, $scope, $state, $stateParams, Session) {
  $scope.pageClass = 'page-about';
  $scope.feedbackErr = false;
  $scope.messageTxt = '';
  $scope.messageEmail = '';
  $scope.loggedIn = false;
  $scope.showInvalidEmail  = false;
  $scope.showInvalidMsg = false;
  $scope.showSuccessMsg = false;
  $scope.profile = {
      name : '',
      image : '',
      backgroundPosition : ''
  }
  if(Session.name){
    $scope.profile.name = Session.name;
    $scope.loggedIn = true;
  }
  if(Session.type == 'local'){
    $scope.profile.image = 'assets/img/avatars.png';
    $scope.profile.backgroundPosition = 45*Session.image+'px 0px';
  }else{
    $scope.profile.image = Session.image;
    $scope.profile.backgroundPosition = '50% 50%';
  }
  $scope.validateEmail = function(email){
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }
  $scope.submitMessage = function () {
    $scope.showInvalidEmail  = false;
    $scope.showInvalidMsg = false;
    var y = $scope.validateEmail($scope.messageEmail);
    if(!y){
      $scope.showInvalidEmail = true;
      return false;
    }
    if($scope.messageTxt.length == 0){
      $scope.showInvalidMsg = true;
      return false;
    }
    var data = {
      email : $scope.messageEmail,
      message : $scope.messageTxt
    }
    $http.post(apiPrefix+'message', data)
      .success(function (e) {
        $scope.showInvalidEmail  = false;
        $scope.showInvalidMsg = false;
        $scope.showSuccessMsg = true;
      }).error(function (e) {
        console.error('Error submitting message');
      });
  }
    // }
  // }
}]);
game325.controller('coverController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService){
  $scope.pageClass = 'page-cover';
  $scope.className='';
  // $scope.showLoggedInOptions  = false;
  $scope.showGame325 = false;

  $scope.getWinContainerHeight = function(){
    var h = window.innerHeight - 100;
    return {
            'height' : h
    }
  }
  $scope.start325Game = function(){
    $scope.showGame325 = true; 
    if(Session.name && Session.type != 'local'){
          // $cookieStore.put('showLoggedInOptions', true);
          // localStorage.setItem('showLoggedInOptions', true);
        }else{
          // $cookieStore.put('showLoggedInOptions', false);
          // localStorage.setItem('showLoggedInOptions', false);
        }
    // $scope.showLoggedInOptions = $cookieStore.get('showLoggedInOptions');
    // $scope.showLoggedInOptions = localStorage.getItem('showLoggedInOptions');
    setTimeout(function(){
      $state.go('cover');
    },800)
    
  }
  // $scope.changeClass = function(a){
  //   // $scope.className = 'expanded';
  //   if(a == 'game-325'){
  //     var req = {};
  //       if(Session.name && Session.type != 'local'){
  //         $scope.showLoggedInOptions = true;
  //       }else{
  //         startGameService.start(req).then(function(res){
  //           $state.go('game/:id', {id : res.data.roomId, type : res.data.type});      
  //         });
  //       }
  //   }
  // }
  // $scope.logOut = function(){
  //       Session.destroy();
  //       $cookieStore.put('userId', 'anon');
  //       $window.location.href = '/';
  // }

  $scope.getGameLogo = function(className){
    var logoimg = '';
    var w = 96;
    var h = 96;
    var t = -40;

    switch(className){
      case 'aboutus':
        logoimg = 'about-us.png';
        w = 50;
        h = 50;
        break;
      case 'leaderboard':
        logoimg = 'leaderboard.png';
        w= 50;
        h= 50;
        break;
      case 'game-325':
        logoimg = '325.png';
        w = 144;
        h = 144;
        break;
      case 'game-hearts':
        logoimg = 'hearts.png';
        break;
      case 'game-29':
        logoimg = '29.png';
        break;
      case 'game-7':
        logoimg = '7centre.png';
        break;  
      case 'game-10pakad':
        logoimg = '10pakad.png';
        break;
      case 'game-a':
        logoimg = 'game-stats.png';
        w = 100;
        h = 100;
        break;
      case 'game-c':
        logoimg = 'discuss.png';
        w = 120;
        h = 120;
        break;
      case 'game-on-demand':
        logoimg = 'demand.png';
        w = 50;
        h = 50;
        break;
      default: 
        logoimg = 'ankit.jpg';
        w = 80;
        h = 80;
        t = 0;
        break;
    }
    logoimg = '../../assets/img/' + logoimg;
    if(window.innerWidth < 700 || window.innerHeight < 500){
      w = w/2;
      h = h/2;
      t = t/2;
    }
    return{
      'background-image' : 'url('+logoimg+')',
    }
  }
    $scope.joinGameRoomId = '';
    $scope.showStartGame = false;
    $scope.showCreateGame = false;
    $scope.showJoinGame = false;
    if($state.current.name == 'start'){
        $scope.showStartGame = true;
    }
    if($state.current.name == 'create'){
        $scope.showCreateGame = true;
    }
    if($state.current.name == 'join'){
        $scope.showJoinGame = true;
    }
    $scope.loading = false;
    AuthService.get().then(function (data) {
        $scope.loggedinuser = data.data.user;
       if(data.data.error){
       }else{
           // socket.emit('joinRoom', {roomId : $scope.gameId});        
       }
    });
    $scope.startGame = function(e){
        var req = {
          gameType : e
        };
        startGameService.start(req).then(function(res){
          $state.go('game/:id', {id : res.data.roomId, type : res.data.type});
        });
        
    }

    $scope.createGame = function(){
        var req = {};
        startGameService.create(req).then(function(res){
            console.log(res.data)
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
    }
    $scope.joinGame = function(){
        var req = {
            roomId : $scope.joinGameRoomId
        };
        console.log(req);
        startGameService.join(req).then(function(res){
            console.log(res.data)
            if(res.data.error){
                $scope.roomerror();
                return false;
            }
          $state.go('game/:id/:type', {id : res.data.roomId, type : res.data.type});      
        });
        $scope.roomerror = function(ev) {
         $mdDialog.show({
          template:
            '<md-dialog>' +
            '    <md-button style="background-color: rgba(241,103,103,1)!important" ng-click="closeDialog()" aria-label="closedialog">' +
            '      <i class="fa fa-times" style="float:right;"></i>' +
            '    </md-button>' +
            '  <md-content>Invalid Room!' +
            '</md-content></md-dialog>',
            controller: 'errDialogController'
        });
      }
    }
  $scope.loggedIn = false;
  $scope.profile = {
      name : '',
      image : '',
      backgroundPosition : ''
  }
  if(Session.name){
    $scope.profile.name = Session.name;
    $scope.loggedIn = true;
  }
  if(Session.type == 'local'){
    $scope.profile.image = 'assets/img/avatars.png';
    $scope.profile.backgroundPosition = 45*Session.image+'px 0px';
  }else{
    $scope.profile.image = Session.image;
    $scope.profile.backgroundPosition = '50% 50%';
  }
  $scope.showProfile = function(){
    // var id = $cookieStore.get('userId');
    var id = localStorage.getItem('userId');
    id = JSON.parse(id);
    if(id.type == 'local'){
      $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }
  }
}]);
game325.controller('blogController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', '$sce', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService, $sce){
  $scope.pageClass = 'page-home';
  $scope.renderHTML = function(html_code){
            var decoded = angular.element('<textarea />').html(html_code).text();
            return $sce.trustAsHtml(decoded);
    };
  $scope.goToCover = function(){
    $state.go('cover');
  }  
  $scope.suitlist = [{
            name : 'S',
            engname : 'Spades',
            ranks : ' A K Q J 10 9 8 7 ',
            rnks: [13,12,11,10,9,8,7,6],
            suitimg: '<img height="16" width="16" src="css/cards/images/heart.png">',
            htmlicon : '&spades;'
            },{
            name : 'H',
            engname : 'Hearts',
            ranks : ' A K Q J 10 9 8 7 ',
            rnks: [13,12,11,10,9,8,7,6],
            suitimg: '<img height="18" width="18" src="css/cards/images/spade.png" style="position:relative;right:4px;">',
            htmlicon : '&hearts;'
            },{
            name : 'C',
            engname : 'Clubs',
            ranks : ' A K Q J 10 9 8 ',
            rnks: [13,12,11,10,9,8,7],
            suitimg:'<img height="18" width="18" src="css/cards/images/diams.png" style="position:relative;right:6px;">',
            htmlicon : '&clubs;'
            },{
            name : 'D',
            engname : 'Diamonds',
            ranks : ' A K Q J 10 9 8 ',
            rnks: [13,12,11,10,9,8,7],
            suitimg: '<img height="18" width="18" src="css/cards/images/club.png">',
            htmlicon : '&diams;'
            }];           

    $scope.getSampleCards = function(suit){
      var deck = new Deck();
      deck = deck.deck;
      var newDeck = [];
      for (var i = deck.length - 1; i >= 0; i--) {
        if(deck[i].suit == suit){
          newDeck.push(deck[i]);
        }
      };
      return newDeck;
    }
    $scope.sampleCards = [  
                $scope.getSampleCards('S'),
                $scope.getSampleCards('H'),
                $scope.getSampleCards('C'),
                $scope.getSampleCards('D')];
    
    $scope.getCardCSS = function(){
        return {
            position : 'absolute',
            width : gameCSSConstants.cardSize.x,
            height : gameCSSConstants.cardSize.y
        }
    }
    $scope.getCardSuit = function (cardSuit) {
            if(cardSuit == 'H')
                return '<img height="16" width="16" src="css/cards/images/heart.png">';
            if(cardSuit == 'S')
                // return '&spades;';
                return '<img height="18" width="18" src="css/cards/images/spade.png" style="position:relative;right:4px;">';
            if(cardSuit == 'D')
                //return '&diams;';
                return '<img height="18" width="18" src="css/cards/images/diams.png" style="position:relative;right:6px;">';
            if(cardSuit == 'C')
                // return '&clubs;';
                return '<img height="18" width="18" src="css/cards/images/club.png">';
        }      
    $scope.getHTML = function(card){
        return $sce.trustAsHtml($scope.getRankForHTML(card));
    }     
    $scope.getImageForHTML = function(card){

    }     
    $scope.getRankForHTML = function(card){
            if(card.rank == 13){
                return 'A';
            }else if(card.rank == 12){
                return 'K';
            }else if(card.rank == 11){
                return 'Q';
            }else if(card.rank == 10){
                return 'J';
            }else{
                return card.rank+1;
            }
        }
    $scope.getCardSuitForHTML = function (cardSuit) {
            if(cardSuit == 'H')
                return '<img height="16" width="16" src="css/cards/images/heart.png">';
            if(cardSuit == 'S')
                // return '&spades;';
                return '<img height="18" width="18" src="css/cards/images/spade.png" style="position:relative;right:4px;">';
            if(cardSuit == 'D')
                //return '&diams;';
                return '<img height="18" width="18" src="css/cards/images/diams.png" style="position:relative;right:6px;">';
            if(cardSuit == 'C')
                // return '&clubs;';
                return '<img height="18" width="18" src="css/cards/images/club.png">';
            }
    $scope.getCardCSS = function(){
        return {
            position : 'absolute',
            width : gameCSSConstants.cardSize.x,
            height : gameCSSConstants.cardSize.y
        }
    }
    $scope.getCardPic = function(card){
        if(card === null){
            return {};
        }else{
        if(card.suit == 'H')
            var posy = '-226.88px';
        if(card.suit == 'S')
            var posy = '-340.32px';
        if(card.suit == 'D')
            var posy = '0px';
        if(card.suit == 'C')
            var posy = '-113.44px';
        var posx = ((card.rank-1)*80*-1);
        var x = {
                    backgroundImage : 'url(assets/img/cardpic.jpg)',
                    width : gameCSSConstants.cardSize.x,
                    height : gameCSSConstants.cardSize.y,
                    backgroundSize : '1200px',
                    backgroundPosition : posx+'px '+posy,
                    left : 0,
                    padding : 0
                };
    return x;
        }
    }                            
}])
game325.controller('leaderBoardController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', '$sce', 'XPService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService, $sce, XPService){
  $scope.pageClass = 'page-leader';
  $scope.ifFbLoggedIn = false;
  $scope.showMyScore = true;
  $scope.showWaitingMsg = true;
  var points = localStorage.getItem('points');
  points = JSON.parse(points);
  $scope.myXP = points.xp;

  $scope.checkFBLogin = function(){
    if(Session.name && Session.type == "fb"){
      $scope.ifFbLoggedIn = true;
      $scope.myImg = Session.image;
      $scope.myImgPos = '50% 50%';
    }else{
      $scope.ifFbLoggedIn = false;
      $scope.myImg = 'assets/img/avatars.png';
      $scope.myImgPos = 45*Session.image+'px 0px';
    }
  }
  $scope.getLeaders = function(){
    XPService.getLeaders(20, function(leaders){
      $scope.leaders = leaders;
      for (var i = 0; i < $scope.leaders.length; i++) {
        if($scope.leaders[i].facebook.id == Session.id){
          $scope.showMyScore = false;
          $scope.leaders[i].color = '#FFEB3B';
          $scope.leaders[i].facebook.name += ' (You)';
        }else{
          $scope.leaders[i].color = '#ECECEC';
        }
      };
      $scope.showWaitingMsg = false;
    });
  }
  $scope.getLeaders();
  $scope.checkFBLogin();
}])