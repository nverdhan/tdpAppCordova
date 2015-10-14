// var game325 = angular.module('game325', ['ng','ui.router','ngAria','ngMaterial','ngAnimate','btford.socket-io','ngAnimate','alAngularHero']);
// if(!window.location.origin) {
//   window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
// }
window.location.origin = 'http://www.teendopaanch.in';
var host = 'http://www.teendopaanch.in';

var game325 = angular.module('game325', ['ng','ui.router','ngAria','ngMaterial','ngAnimate','btford.socket-io','ngAnimate', 'ngCookies','ngTouch']);
// var game325 = angular.module('game325', ['ng','ui.router','ngAria','ngMaterial','ngAnimate','btford.socket-io','ngAnimate', 'ngCookies']);

game325.constant('AUTH_EVENTS', {
    loginSuccess    :   'auth-login-success',
    loginFailed     :   'auth-login-failed',
    logoutSuccess   :   'auth-logout-success',
    SessionTimeout  :   'auth-session-timeout',
    notAuthenticated    :   'auth-not-authenticated',
    notAuthorized   :   'auth-not-authorized',
    internalServerError : 'internal-server-error'
});
game325.constant('USER_ROLES', {
    all     :   '*',
    admin   :   'admin',
    editor  :   'editor',
    guest   :   'guest'
});
// game325.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
//     $locationProvider.html5Mode(true).hashPrefix('!');
// }]);
game325.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
game325.factory('socket', ['socketFactory', function(socketFactory){
    return socketFactory({ioSocket : io.connect(host)});
}]);
game325.run(['$rootScope', '$state', 'socket', '$mdDialog','$location', function($rootScope, $state, socket, $mdDialog, $location){
    // console.log('ng bootstrapped');
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        var pageUrl = $location.path();
        // ga('send', 'pageview', pageUrl);
        window.analytics.trackView(pageUrl);
        // console.log(window.analytics);
        if(fromState.name == 'game/:id'){
            socket.emit('leaveRoom', {'roomId' : fromParams.id});
        }
        if(fromState.name == 'game325'){
            $mdDialog.hide()
        }
    });
}]);
game325.factory('delayService', ['$q', '$timeout', function ($q, $timeout){
    var _fact = {};
    var _initvalue = 1;
    var waitPromise = $q.when(true);
    var _asyncTask = function(time, fn){
        waitPromise = waitPromise.then(function (){
            return $timeout(function (){
                fn();
            }, time);
        });
        return waitPromise;
    }
    _fact.asyncTask = _asyncTask;
    return _fact;
}])
game325.controller('gameCtrl', ['$rootScope', '$scope', '$http', '$state', 'AuthService', 'Session', '$cookieStore','$mdDialog','AUTH_EVENTS','errService','$mdToast', function ($rootScope, $scope, $http, $state, AuthService, Session, $cookieStore, $mdDialog, AUTH_EVENTS, errService, $mdToast){
    // Game should work only in Landscape Mode
    angular.element('.ifPortrait').append(
            "<div>"+
            "<h2 style = 'color: #383838; z-index: 2; font-family: \"Roboto Slab\", serif; font-style: normal; font-size: 1.4em;   font-weight: 400;"+
            "width: 70%; margin: 0 auto; padding-top: 80px; padding-bottom: 20px; text-align: center'>"+
            "<img style ='margin:0 auto; width: 80px; height: 80px ' src=\"assets/img/325_cardsgame80x80.png\">"+
            "<br>"+
            "Hey, thanks for visiting us! <br><br>"+
            "The game best works best when viewed in landscape mode. <br> Please flip your device/resize your window to proceed."+
            "<br><br>"+
            // "<img style ='margin:0 auto; width: 120px; height: 103px ' src=\"assets/img/rotate_icon_thumb.png\">"+
            "<a class='nav-icon href-custom' target='_blank' href='https://www.facebook.com/325game' style='color: #3b5998;'>"+
            "<br><br>"+
            "<i class='fa fa-facebook-square fa-2x' title='Facebook'></i>"+
            "</a>"+
            "</h2>"+
            "</div>");
    $scope.previousOrientation = window.orientation;
    $scope.checkOrientationChange = function(){
        if(window.orientation !== $scope.previousOrientation){
            $scope.previousOrientation = window.orientation;
            $scope.showOrientationMsg();        
        }
    }
    window.addEventListener("resize", $scope.checkOrientationChange, false);
    window.addEventListener("orientationchange", $scope.checkOrientationChange, false);
    setInterval($scope.checkOrientationChange, 2000);
    $scope.checkOrientation = function(){
        if(false){ //mobile and Tablet check
            if(getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE){
                $scope.isLandscape = true;
            }else if(getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT){
                $scope.isLandscape = false;
            }
        }else if(window.innerHeight > window.innerWidth){
            $scope.isLandscape = false;
        }else{
            $scope.isLandscape = true;
        }
    }
    $(window).resize(function() {
        $scope.showOrientationMsg();
    });
    $scope.showOrientationMsg = function(){
        $scope.checkOrientation();
        if($scope.isLandscape){
            angular.element('.ifPortrait').css('display', 'none');    
        }else{
            angular.element('.ifPortrait').css('display', 'block');    
        }
    }
    $scope.showOrientationMsg();

    //Internet Connectivity Cordova
    if(navigator.connection.type == "none"){
        $rootScope.currentConnStatus = 'offline';    
    }else{
        $rootScope.currentConnStatus = 'online';
    }
    document.addEventListener("offline", onOffline, false);
    document.addEventListener("online", onOnline, false);
    $scope.handleNetworkConnection = function(statusnow){
        if($rootScope.currentConnStatus != statusnow){
            $rootScope.currentConnStatus = statusnow;
            if(statusnow == 'online'){
                errService.showToast('Connected to internet','green');
                $rootScope.$broadcast('DEVICE_ONLINE');
            }else if(statusnow == 'offline'){
                errService.showToast('No internet connection','red');
                $rootScope.$broadcast('DEVICE_OFFLINE');
            }else{
                console.log('weird');   
            }
        }else{
            // console.log('repeated status');
        }
    }
    function onOffline(){
        $scope.handleNetworkConnection('offline');
    }
    function onOnline(){
        $scope.handleNetworkConnection('online');
    }
    // Back button behavior
    function onBackKeyDown(e) {
        if($state.current.name == 'cover'){
        //     alert('set a dialog here for exit app?');
        //     navigator.app.exitApp();
        // }else{
        //     history.go(-1);
        //     navigator.app.backHistory();
        // }
        var msg = 'Exit Game?'
        $mdDialog.show({
              template:
                '<md-dialog>' +
                '  <md-content> <h2 class="md-title"> Exit Game? </h2> <p> '+
                 '  <div class="md-actions">' +
                 '<md-button ng-click="exitGame()" aria-label="exitGame"> Yes </md-button>'+
                 '<md-button ng-click="cancelExit()" aria-label="closeDialog"> No </md-button>'+
                 '  </div>' +
                '</md-content></md-dialog>',
                clickOutsideToClose : false,
                escapeToClose : false,
                controller: 'errDialogController'
            });
        }else if($state.current.name == 'game325'){
            $rootScope.$broadcast('EXIT_CURRENTGAME');
        }
        else{
            history.go(-1);
            navigator.app.backHistory();
        }
    }
    document.addEventListener("backbutton", onBackKeyDown, false);
    $scope.title = 'GameApp';
    var credentials = {
        //id : $cookieStore.get('userId')
        id : localStorage.getItem('userId')
    }
    if(!credentials.id){
        //$cookieStore.put('userId','anon');
        localStorage.setItem('userId','anon');
    }
    var authUserInfo = AuthService.getUserInfo();
    if(credentials.id && credentials.id != 'anon'){
        var user = JSON.parse(credentials.id);
        Session.create(user.id, user.name, user.image, user.type);
    }else if(authUserInfo){
        var user = {
                id: authUserInfo.id,
                name : authUserInfo.name,
                image : authUserInfo.image,
                type : 'fb'
            }
        Session.create(user.id, user.name, user.image, user.type);
        $scope.currentUser = user;
    }else{
        $scope.currentUser = null
        Session.destroy();
    }
    $scope.setCurrentUser = function (user){
        $scope.currentUser = user;
        // if($cookieStore.get('userId') == 'anon'){
        //     $cookieStore.put('userId',user.id);
        // }
        if(localStorage.getItem('userId') == 'anon'){
            localStorage.setItem('userId',user.id);
        }
    }
    $scope.signOut = function(){
        $scope.currentUser = null;
        //$cookieStore.put('userId','anon');
        localStorage.setItem('userId','anon');
        AuthService.logout().then(function(res){
            if($state.current.data.requiresAuth && (!$scope.currentUser.id)){
                $state.go('cover');
            }
            $scope.showLoginDialog = true;
        })
    }
    $scope.OverlayVisible = false;
    $scope.loginRequired = function(){
        $rootScope.loggedIn = false;
        $scope.OverlayVisible = true;
    }
    $scope.exitLogin = function(){
        // if($state.current.data.requiresAuth && (!$scope.currentUser.id)){
        //     $state.go('home');
        // }
        // console.log('exit login called');
        $rootScope.loggedIn = true;
        $scope.OverlayVisible = false;
    }
    // $scope.showLogin = function(){
    //  
    // }
    $scope.showLogin = function(){      
        console.log('show login called');
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        $scope.OverlayVisible = true;
    }
    $scope.uiRouterState = $state;
    $scope.$on(AUTH_EVENTS.internalServerError, $scope.showInternalServerError);
    $scope.$on(AUTH_EVENTS.notFound, $scope.shownotFound);
    $scope.$on(AUTH_EVENTS.notAuthenticated, $scope.loginRequired);
    $scope.$on(AUTH_EVENTS.sessionTimeout, $scope.loginRequired);
    $scope.$on(AUTH_EVENTS.loginSuccess, $scope.exitLogin);
    $scope.showSettings = function () {
        $rootScope.$broadcast('SHOW_SETTINGS');
        $scope.OverlayVisible = true;
    }
    $scope.hideOverlay = function(){
       $scope.OverlayVisible = false;
    }
    $scope.$on('HIDE_SETTINGS', $scope.hideOverlay);
    
}]);
game325.run( ['$rootScope', '$state', 'AUTH_EVENTS', 'AuthService', 'Session', '$location','$templateCache', function ($rootScope, $state, AUTH_EVENTS, AuthService, Session, $location, $templateCache){
    $rootScope.$on('$stateChangeStart', function (event, next, toState, toParams, fromState, fromParams){
        // console.log($state.current.name);
        var authorizedRoles = next.data.authorizedRoles;
        var requiresAuth = next.data.requiresAuth;
        var a = AuthService.isAuthenticated();
        if(requiresAuth == true && a == false){
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            event.preventDefault;
        }

    });
    $templateCache.removeAll();
}]);
game325.config(['$httpProvider', function ($httpProvider){
    $httpProvider.interceptors.push(['$injector', function ($injector){
        return $injector.get('AuthInterceptor');
    }]);
}]);
game325.factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function ($rootScope, $q, AUTH_EVENTS){
    return {
        responseError : function(response){
            $rootScope.$broadcast({
                401 : AUTH_EVENTS.notAuthenticated,
                404 : AUTH_EVENTS.notFound,
                403 : AUTH_EVENTS.notAuthorized,
                419 : AUTH_EVENTS.sessionTimeout,
                440 : AUTH_EVENTS.sessionTimeout,
                500 : AUTH_EVENTS.internalServerError
            }[response.status], response);
            return $q.reject(response);
        }
    }
}]);

game325.config(['$httpProvider', function ($httpProvider) {
    var $http;
    var interceptor = ['$q', '$injector', function ($q, $injector) {
            var notificationChannel;
            function success(response) {
                $http = $http || $injector.get('$http');
                // don't send notification until all requests are complete
                if ($http.pendingRequests.length < 1) {
                    // get requestNotificationChannel via $injector because of circular dependency problem
                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                    // send a notification requests are complete
                    notificationChannel.requestEnded();
                }
                return response;
            }
            function error(response) {
                // get $http via $injector because of circular dependency problem
                $http = $http || $injector.get('$http');
                // don't send notification until all requests are complete
                if ($http.pendingRequests.length < 1) {
                    // get requestNotificationChannel via $injector because of circular dependency problem
                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                    // send a notification requests are complete
                    notificationChannel.requestEnded();
                }
                return $q.reject(response);
            }
            return function (promise) {
                // get requestNotificationChannel via $injector because of circular dependency problem
                notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                // send a notification requests are complete
                notificationChannel.requestStarted();
                return promise.then(success, error);
            }
        }];

    $httpProvider.interceptors.push(interceptor);
}])
.factory('requestNotificationChannel', ['$rootScope', function($rootScope){
    // private notification messages
    var _START_REQUEST_ = '_START_REQUEST_';
    var _END_REQUEST_ = '_END_REQUEST_';
    // publish start request notification
    var requestStarted = function() {
        $rootScope.$broadcast(_START_REQUEST_);
        $rootScope.appLoading = true;
    }
    // publish end request notification
    var requestEnded = function() {
        $rootScope.$broadcast(_END_REQUEST_);
        $rootScope.appLoading = false;
    }
    // subscribe to start request notification
    var onRequestStarted = function($scope, handler){
        $scope.$on(_START_REQUEST_, function(event){
            handler();
        });
    }
    // subscribe to end request notification
    var onRequestEnded = function($scope, handler){
        $scope.$on(_END_REQUEST_, function(event){
            handler();
        });
    }
    return {
        requestStarted:  requestStarted,
        requestEnded: requestEnded,
        onRequestStarted: onRequestStarted,
        onRequestEnded: onRequestEnded
    }
}]);

game325.directive('showScores', ['$compile', function($compile){
    var a = function(content){
        var content = content.content;
        if(content.type == 'local' || content.type == 'bot' || content.type == 'you'){
                content.userPic = 'assets/img/avatars.png';
                content.backgroundPosition = 45*content.image+'px 0px';
            }else{
                content.userPic = content.image;
                content.backgroundPosition = '50% 50%';
            }
        var x = '<md-item>'+
        '<md-item-content>'+
          '<div class="md-tile-left ball" style="background: #fff url('+content.userPic+');background-position:'+content.backgroundPosition+'; background-size: cover; margin-right: 0;">'+
          '</div>'+
          '<div class="md-tile-content">'+
            '<div layout="horizontal">'+
            '<h3>'+content.name+'</h3>'+
            '<h4 class="total-score">Total '+content.handsMade+' out of '+content.totalHandsToMake+' hands made</h4>'+
            '</div>'+
            '<div flex layout="horizontal" class="progress-container" ng-repeat = "game in content.scores"'+
                'ng-class=\'{"red-theme":game.handsMade<game.handsToMake,"blue-theme":game.handsMade==game.handsToMake,"green-theme":game.handsMade>game.handsToMake}\'>'
        var y ='<md-progress-linear mode="determinate" value="{{game.handsMade/game.handsToMake*100}}" style="width:80%;">'+ 
                '</md-progress-linear>'
        var z ='<div class="fracscore">'+
            '{{game.handsMade}}/{{game.handsToMake}}'+
            '</div>'+
            '</div>'+
          '</div>'+
        '</md-item-content>'+
        '<md-divider></md-divider>'+
       '</md-item>';
        var w = x+y+z;
       return w;
    }
    var linker = function (scope, element, attrs){
        scope.$watch('content', function (argument) {
            element.html(a(scope)).show();
            $compile(element.contents())(scope);
        });
    }
    return {
        restrict : 'E',
        replace : true,
        link : linker,
        scope : {
            content : '='
        }
    }
}]);
game325.directive('profileInfo', ['$compile', function ($compile){
  var x = function(content){
    var content = content.content;
    if(content.type == 'local'){
        content.backgroundPosition = 45*content.image+'px 0px';
        content.image = 'assets/img/avatars.png';
    }else if(content.type == 'fb'){
        content.image = content.image;
        content.backgroundPosition = '50% 50%';
    }
    var y = '<div class="ball center" style="background-image:url('+content.image+'); background-position : '+ content.backgroundPosition+'; margin: 0 auto;"></div>'+
          '<h4 style="margin-top:0.3em;">'+content.name+'</h4>';
      return y;
  }
  var linker = function(scope, element, attrs){
    scope.$watch('content', function (argument){
      element.html(x(scope)).show();
      $compile(element.contents())(scope);
    })
  }
  return {
    restrict : 'E',
    replace : true,
    link : linker,
    scope : {
      content : '='
    }
  }
}]);
game325.directive('profileInfoHorz', ['$compile', function ($compile){
  var x = function(content){
    console.log(content);
    var y = '<a class="href-custom" href="/"><div ng-controller="registerCtrl" class="ball center" style="background-image:url('+content.image+'); background-position : '+ content.backgroundPosition+'; margin: 0 auto;">'+
          '<h4 class="cover-player-name">'+content.name+'</a></h4></div>';
      return y;
  }
  var linker = function(scope, element, attrs){
    scope.$watch('content', function (){
      element.html(x(scope.content)).show();
      $compile(element.contents())(scope);
    })
  }
  return {
    restrict : 'E',
    replace : true,
    transclude : true,
    link : linker,
    scope : {
      content : '='
    }
  }
}]);
game325.service('createPrivateRoomService', ['$http', function ($http){
    return {
        create : function (req) {
            return $http.post(apiPrefix+'create', {data : req});
        }
    }
}])
game325.service('joinPrivateRoomService', ['$http', function ($http){
    return {
        create : function (req) {
            return $http.post(apiPrefix+'create', {data : req});
        }
    }
}]);
game325.service('XPService', ['$http', '$rootScope', 'Session', function ($http, $rootScope, Session){
    return{
        update: function (req, callback) {
            if($rootScope.currentConnStatus == "online"){
                $http.post(apiPrefix + 'getXP', {data: req})
                        .then(function(data){
                            var points = data.data.points;
                            localStorage.setItem('points', JSON.stringify(points));
                            if(callback){
                                callback();
                            }
                        }) 
            }else{
                if(callback){
                    callback();
                }
            }
        },
        getXP: function(callback){
            if(Session.name && Session.type == "fb"){
                var id = Session.id;
                var points = localStorage.getItem('points');
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
                data = {
                    id: id,
                    points: points
                }
                this.update(data, callback);
            }
        }       
    }
}]);
$(function() {
    $('.toggle-nav').click(function() {
        $('body').toggleClass('show-nav');
        return false;
    });
});
$(document).keyup(function(e) {
    if (e.keyCode == 27) {
        $('body').toggleClass('show-nav');
    }
});
game325.controller('loginController',['$rootScope', '$location', '$scope', '$http','$window', function($rootScope, $location ,$scope, $http,$window){
    $scope.twitterAuth = function(){
        $window.location.href = "http://teendopaanch.in/auth/twitter"
    }
    $scope.facebookAuth = function(){
        FacebookInAppBrowser.login({
          send: function() {
              console.log('login opened');
          },
          success: function(access_token) {
              console.log('done, access token: ' + access_token);
          },
          denied: function() {
              console.log('user denied');
          },
          timeout: function(){
              console.log('a timeout has occurred, probably a bad internet connection');
          },
          complete: function(access_token) {
              console.log('window closed');
              if(access_token) {
                  console.log(access_token);
              } else {
                  console.log('no access token');
              }
          },
          userInfo: function(userInfo) {
              if(userInfo) {
                  console.log(JSON.stringify(userInfo));
              } else {
                  console.log('no user info');
              }
          }
      });
    }


    $scope.homepage = function(){
        $location.path('/');
    };
}]);
game325.directive('loginDialog', ['AUTH_EVENTS', function (AUTH_EVENTS) {
    var register = "'templates/register.html'";
  return {
    restrict: 'A',
    template: '<div ng-if="registerVisible" ng-include src="'+register+'"></div>',
    link: function (scope) {
      var showRegisterDialog = function () {
        scope.registerVisible = true;
      };
      var hideRegisterDialog = function () {
        scope.registerVisible = false;
      };
      scope.close = function(){
        scope.hideAll();
        scope.$parent.hideOverlay();
      }
      scope.hideAll = function(){
        scope.loginVisible = false;
        scope.registerVisible = false;
        scope.forgotPwdVisible = false;  
      }
      scope.hideAll();
      scope.$on(AUTH_EVENTS.notAuthenticated, showRegisterDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showRegisterDialog);
      scope.$on(AUTH_EVENTS.loginSuccess, hideRegisterDialog);
    }
  }
}]);
game325.directive('settingsDialog', ['AUTH_EVENTS', function (AUTH_EVENTS) {
    var template = "'templates/settings.html'";
    return {
        restrict : 'A',
        template : '<div ng-show="settingsVisible" ng-include src="'+template+'"></div>',
        link : function(scope){
            
            var showSettingsDialog = function () {
                scope.settingsVisible = true;
            }
            scope.close = function (argument){
                scope.$parent.hideOverlay();
            }
            scope.apply = function (settings){
                var a  = JSON.stringify(a);
                localStorage.setItem({'gameSettings': a});
            }
            var hideAll = function(){
                scope.settingsVisible = false;
            }
            scope.hideAll();
            scope.$on('SHOW_SETTINGS', showSettingsDialog);
            scope.$on('HIDE_SETTINGS', hideAll);
        }
    }
}]);
game325.controller('settingsCtrl',['$rootScope','$scope','AUTH_EVENTS','$state', function ($rootScope, $scope, AUTH_EVENTS, $state){
    $scope.selectBackgroundColor = function (color) {
        $scope.activeColor = color;
    }
    $scope.bgColors = globalVars.colors;
    $scope.cardBacks = globalVars.cardBack;
    $scope.cardFronts = globalVars.cardFront;
    var settings = localStorage.getItem('gameSettings');
    var x = JSON.parse(settings);
    if(x){
        var x = JSON.parse(settings);
        if(x.activeColor){
            $scope.settings = x;
            $scope.activeColor = $scope.settings.activeColor;
            $scope.front = $scope.settings.activeCardFront;
            $scope.activeCardBack = $scope.settings.activeCardBack;
            globalVars.backClass = $scope.settings.activeColor.name;
        }    
    }
    else{
        $scope.settings = {
            activeColor : $scope.bgColors[0]
        }
        $scope.activeColor = $scope.settings.activeColor;
        $scope.activeCardBack = 'cardBack1';
        $scope.front = 'cardFront2';
    }
    $scope.selectBackgroundColor = function(color) {
        $scope.activeColor = color;
    }
    $scope.backToLoginHome = function () {
        $state.go('cover');

    }
    $scope.sampleCards  =   [{
                                suit : 'S',
                                rank : 13,
                            },
                            {
                                suit : 'H',
                                rank : 12,
                            },
                            {
                                suit : 'C',
                                rank : 11,
                            },
                            {
                                suit : 'D',
                                rank : 10,
                            }];
    $scope.getSuitForHTML = function(card){
        if(card.suit == 'H')
            return 'hearts';
        if(card.suit == 'S')
            return 'spades';
        if(card.suit == 'D')
            return 'diams';
        if(card.suit == 'C')
            return 'clubs';
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
            return card.rank;
        }
    }
    $scope.backToLoginHome = function () {
        $state.go('cover');
        $rootScope.$broadcast('HIDE_SETTINGS');
    }
    $scope.activeSettingsTab = 'backgroundTab';
    $scope.changeTab = function (tab) {
        $scope.activeSettingsTab = tab;
    }
    $scope.getCardCSS = function(){
        return {
            position : 'absolute',
            width : gameCSSConstants.cardSize.x,
            height : gameCSSConstants.cardSize.y
        }
    }
    $scope.selectCardBack = function(cardBack){
        $scope.activeCardBack = cardBack;
    }
    $scope.getCardPic = function(card){
        console.log('get card pic called');
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
                    // backgroundImage : 'url(assets/img/cardpic.jpg)',
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
    $scope.selectFront = function (front) {
        $scope.front = front;
    }
    $scope.appySettings = function () {
        var settings = {
            activeColor : $scope.activeColor,
            activeCardBack : $scope.activeCardBack,
            activeCardFront : $scope.front
        }
        var a = JSON.stringify(settings);
        localStorage.setItem('gameSettings', a);
        globalVars.activeBgColor = settings.activeColor;
        globalVars.activeCardBack = $scope.activeCardBack;
        globalVars.activeCardFront = $scope.front;
        globalVars.backClass = settings.activeColor.name;
        $rootScope.$broadcast('HIDE_SETTINGS');
    }
    $scope.getColorClass = function (color, i) {
        var className = [];
        if(color == $scope.activeColor.color){
            className.push('activeBlock');
        }
        if (i%2!=0) {
            className.push('evenBlock');
        }
        return className;
    }
}])
game325.controller('registerCtrl', ['$rootScope', '$scope','$cookieStore','$window', 'AUTH_EVENTS','Session', 'errService', '$timeout', '$state', 'AuthService','$swipe', 'XPService', function ($rootScope, $scope, $cookieStore, $window, AUTH_EVENTS, Session, errService, $timeout, $state, AuthService, $swipe, XPService){
    // var id = $cookieStore.get('userId');
    $scope.pageClass = 'page-login';
    $scope.showLoggedInProfile = false;
    $scope.loginFB = true;
    $scope.loginAnon = false;
    $scope.deactivateFBLogin = function(){
        $scope.fbLoginBtnMsg = 'Connect to internet for FB Login';
    }
    $scope.activateFBLogin = function(){
        $scope.fbLoginBtnMsg = 'Login with Facebook';
    }
    if($rootScope.currentConnStatus == 'online'){
        $scope.activateFBLogin();
    }else{
        $scope.deactivateFBLogin();
    }
    $scope.user = {
        type : 'local',
        name : '',
        image : null,
        id: null
    }
    $scope.initLogin = function(){
        if(Session.name){
            $scope.showLoggedInProfile = true;
            $scope.user.name = Session.name;
            $scope.loginFB = false;
            $scope.loginAnon = false;
            if(Session.type == 'fb'){
                $scope.user.id = Session.id;
                $scope.user.image = Session.image;
                $scope.user.backgroundPosition = '50% 50%';
                XPService.getXP();
            }else if(Session.type == 'local'){
                $scope.user.id = Session.id;
                $scope.user.image = 'assets/img/avatars.png';
                $scope.user.backgroundPosition = 44*Session.image+'px 0px';
            }
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }else{
            $scope.showLoggedInProfile = false;
            $scope.loginFB = true;
            $scope.loginAnon = false;
        }
    }
    $scope.initLogin();
    $scope.startGame = function(){
        $scope.loginFB = false;
        var self = $scope;
        $timeout(function(){$scope.loginAnon = true}, 200); 
    }
    $scope.backToLoginHome = function(){
        $timeout(function(){$scope.loginFB = true}, 200); 
        $scope.loginAnon = false;
    }
    $scope.avatars = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    $scope.selectedimage = null;
    $scope.selectedImageRowIndex = 0;
    if(Session.image && Session.type != 'fb'){
        var x = Session.image+1;
        for (var i = 1; i <=4; i++) {
            if(x>=i*1 && x<=i*4){
                c=i;
            }
        }
        $scope.selectedImageRowIndex = c;
    }
    $scope.getImageRowStyle = function(){
        var c = $scope.selectedImageRowIndex;
        var l = 0-(c*4*72);
        return {
            display : 'inline-block',
            position : 'relative',
            left : l,
            width : '400%'
        }
    }
    $scope.twitterAuth = function(){
        $window.location.href = "http://teendopaanch.in/auth/twitter"
    }
    $scope.facebookAuth = function(){
        openFB.login(
            function(response) {
                if(response.status === 'connected') {
                    // console.log(response.authResponse.accessToken);
                    $scope.getFBData();
                    // alert('Facebook login succeeded, got access token: ' + response.authResponse.accessToken);
                } else {
                    // alert('Facebook login failed: ' + response.error);
                }
            }, {scope: 'email'}
        );
    }
    $scope.getFBData = function(){
        openFB.api({
            path: '/me',
            success: function(data){
                var user = {
                    id : data.id,
                    name : data.name,
                    image : 'http://graph.facebook.com/' + data.id + '/picture?type=small'
                }
                // AuthService.localRegister(user);
                AuthService.localRegister(user).then(function(res){
                    if(res){
                        // console.log(res);
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                        $scope.initLogin();
                        navigator.splashscreen.show();
                        window.location.reload();
                        $state.go('cover');
                        // document.location.href = 'file:///android_asset/www/index.html#/'
                    }else{
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    }
                })
                // angular.bootstrap(document, ['game325']);
                // $state.go('cover');
                // document.location.href = 'file:///index.html'
                // $scope.$apply($rootScope.$broadcast(AUTH_EVENTS.loginSuccess));
                
            },
            error: errorHandler});
    };
    $scope.homepage = function(){
        $location.path('/');
    };
    $scope.selectAvatar = function(index){
        $scope.showUserImageError = false;
        $scope.user.image = index;
    }
    $scope.getAvatar = function(index){
        return {
            'background-position' : index*64+'px 0px',
        }
    }
    $scope.shiftLeft = function () {
        if($scope.selectedImageRowIndex < 3){
            $scope.selectedImageRowIndex++;
        }
        // console.log($scope.selectedImageRowIndex);
    }
    $scope.shiftRight = function () {
        if($scope.selectedImageRowIndex > 0){
            $scope.selectedImageRowIndex--;    
        }
    }
    $scope.showNameTooltip = false;
    $scope.register = function (){
        $scope.showUserError = false;
        $scope.showUserImageError = false;
        if($scope.user.name.length == '' && $scope.avatars.indexOf($scope.user.image) != -1){
            $scope.showUserError = true;
            errService.showErrSimple('Please select a username!');
        }
        if($scope.avatars.indexOf($scope.user.image) == -1 && $scope.user.name.length != ''){
            $scope.showUserImageError = true;
            errService.showErrSimple('Please select an avatar!');
        }
        if($scope.avatars.indexOf($scope.user.image) == -1 && $scope.user.name.length == ''){
            $scope.showUserImageError = true;
            $scope.showUserError = true;
            errService.showErrSimple('Please select a username and an avatar!');
        }
        if($scope.showUserError || $scope.showUserImageError){
           return false; 
        }else{
            var user = JSON.stringify($scope.user);
            // $cookieStore.put('userId',user);
            localStorage.setItem('userId',user);
            Session.create($scope.user.id, $scope.user.name, $scope.user.image, 'local');
            // document.location.href = 'file:///index.html';
            $scope.initLogin();
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            navigator.splashscreen.show();
            window.location.reload();
            $state.go('cover');
            // $state.go('cover');
            // document.location.href = 'file:///android_asset/www/index.html#/'
        }
    }
    $scope.enterName = function(){
        if($scope.user.name.length > 0){
            $scope.showUserError = false;   
        }
    }
    $scope.removeLocalStorageItems = function(){
        var items = ['gameSettings','gameData','userInfo','showLoggedInOptions','points'];
        for (var i = 0; i < items.length; i++) {
            localStorage.removeItem(items[i]);
        }
    }
    $scope.logOut = function(){
        $rootScope.$broadcast('HIDE_SETTINGS');
        if(Session.type == 'fb'){
            // AuthService.logout().then(function(res){
            //     Session.destroy();
            //     localStorage.setItem('userId','anon');
            //     localStorage.setItem('showLoggedInOptions', false);
            //     if($state.current.data.requiresAuth && (!$scope.currentUser.id)){
            //         $state.go('cover');
            //     }
            //     $scope.showLoginDialog = true;
            // })
            AuthService.localLogout();
            Session.destroy();
            localStorage.setItem('userId','anon');
            localStorage.setItem('showLoggedInOptions', false);
            // $scope.showLoginDialog = true;
            // if($state.current.data.requiresAuth && (!$scope.currentUser.id)){
            //     document.location.href = 'file:///index.html'
            // }
        }else{
            Session.destroy();
            localStorage.setItem('userId','anon');
            localStorage.setItem('showLoggedInOptions', false);
            // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            // document.location.href = 'file:///index.html'

        }
        $scope.removeLocalStorageItems();
        initializeGlobalVars();
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        $scope.initLogin();
        $state.go('cover');
        // console.log(Session.type);
        
    }
    $scope.$on('DEVICE_OFFLINE', $scope.deactivateFBLogin);
    $scope.$on('DEVICE_ONLINE', $scope.activateFBLogin);
}]);




