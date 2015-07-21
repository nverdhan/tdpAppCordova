game325.controller('startController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'startGameService' ,'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','$cookieStore','AUTH_EVENTS','Session', 'errService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, startGameService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, $cookieStore, AUTH_EVENTS, Session, errService){
//     AuthService.get().then(function(res){
//        console.log(res);
//         if(res.data.error == "401"){
//             $scope.authorized = false;
//         }else if(res.data.user){
//          $stateProvider.state('start');
//            $state.go('start');
//         }
//     });
    // $scope.showLoggedInOptions = false;
    $scope.pageClass = 'page-home';
    $scope.joinGameRoomId = '';
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
    $scope.toggleMultiplayerOptions = function (){
      if(Session.name && Session.type != 'local'){
          localStorage.setItem('showLoggedInOptions', true);
        }else{
          localStorage.setItem('showLoggedInOptions', false);
        }
      $scope.showLoggedInOptions = localStorage.getItem('showLoggedInOptions');
      if($rootScope.currentConnStatus == 'online'){
        if($scope.showMultiplayerOptions == false){
          $scope.showMultiplayerOptions = true;
        }else{
          $scope.showMultiplayerOptions = false;
        }
      }else{
        errService.showErrSimple('Connect to internet to play multiplayer.');
      }
    }
    AuthService.get().then(function (data) {
        $scope.loggedinuser = data.data.user;
       if(data.data.error){
       }else{
           // socket.emit('joinRoom', {roomId : $scope.gameId});        
       }
    });
    $scope.changeClass = function(a){
          if(a == 'game-325'){
            var req = {};
            if(Session.name && Session.type != 'local'){
                console.log(Session);
                $scope.showLoggedInOptions = true;
            }else{
              startGameService.start(req).then(function(res){
                $state.go('game/:id', {id : res.data.roomId, type : res.data.type});      
              });
            }
          }
        }
    $scope.startGame = function(e){
        if(e == 'bots'){
          $state.go('game325');
        }else{
          var req = {};
          startGameService.start(req).then(function(res){
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
    $scope.loginWIthFB = function () {
      //window.location.href = "http://teendopaanch.in/auth/facebook"
      // FacebookInAppBrowser.login({
      //     send: function() {
      //         console.log('login opened');
      //     },
      //     success: function(access_token) {
      //         console.log('done, access token: ' + access_token);
      //     },
      //     denied: function() {
      //         console.log('user denied');
      //     },
      //     timeout: function(){
      //         console.log('a timeout has occurred, probably a bad internet connection');
      //     },
      //     complete: function(access_token) {
      //         console.log('window closed');
      //         if(access_token) {
      //             console.log(access_token);
      //         } else {
      //             console.log('no access token');
      //         }
      //     },
      //     userInfo: function(userInfo) {
      //         if(userInfo) {
      //             console.log(JSON.stringify(userInfo));
      //         } else {
      //             console.log('no user info');
      //         }
      //     }
      // });
      console.log('Login with fb')
    }
    $scope.toggleRoomOptions = function () {
        if($scope.joinGameRoomId.length == 0){
          $scope.roomText = 'Create Private Room';
        }else{
          $scope.roomText = 'Join';
        }
    }
    $scope.joinGame = function(){
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
        $scope.profile.image = 'android_asset/www/assets/img/avatars.png';
        $scope.profile.backgroundPosition = 45*Session.image+'px 0px';
      }else{
        $scope.profile.image = Session.image;
        $scope.profile.backgroundPosition = '50% 50%';
      }  
      $scope.loggedIn = $rootScope.loggedIn;
    }
    $scope.checkLogin();
    $scope.showProfile = function(){
      // var id = $cookieStore.get('userId');
      var id = localStorage.getItem('userId');
      id = JSON.parse(id);
      if(id.type == 'local'){
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
    $scope.$on(AUTH_EVENTS.loginSuccess, $scope.checkLogin);
    $scope.$on('DEVICE_OFFLINE', $scope.deactivateMultiplayer);
    $scope.$on('DEVICE_ONLINE', $scope.activateMultiplayer);
}]);

game325.controller('errDialogController',['$rootScope', '$scope', '$mdDialog', '$state', '$mdToast', function($rootScope, $scope, $mdDialog, $state, $mdToast){
    $scope.closeDialog = function(){
        $mdDialog.hide();
    };
    $scope.goToHome = function(){
      $mdDialog.hide();
      $state.go('cover');
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
    $scope.profile.image = 'android_asset/www/assets/img/avatars.png';
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
  $scope.showLoggedInOptions  = false;
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
          localStorage.setItem('showLoggedInOptions', true);
        }else{
          // $cookieStore.put('showLoggedInOptions', false);
          localStorage.setItem('showLoggedInOptions', false);
        }
    // $scope.showLoggedInOptions = $cookieStore.get('showLoggedInOptions');
    $scope.showLoggedInOptions = localStorage.getItem('showLoggedInOptions');
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
    $scope.profile.image = 'android_asset/www/assets/img/avatars.png';
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
