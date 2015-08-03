var apiPrefix  = 'http://www.teendopaanch.in/api/';

game325.factory('AuthService', ['$http','$rootScope', 'Session','$window','$cookieStore', function ($http, $rootScope, Session, $window, $cookieStore){
    var authService = {};
    authService.register = function(credentials){
    	return $http.post(apiPrefix+'register', credentials)
    				.then(function (res){
    					if(res.data.status == 'success'){
    						Session.create(res.data.user.id, res.data.user.name, res.data.user.img);
    					}
    					return res.data;
    				})
    }
    authService.login = function (credentials){
    	return $http.post(apiPrefix + 'login', credentials)
    				.then(function (res){
    					if(res.data.status == 'success'){
    						Session.create(res.data.user.id, res.data.user.name, res.data.user.img);
    					}
    					return res.data;	
    				})
    }
    authService.logout = function(){
    	return $http.post(apiPrefix+'logout');
    }
    authService.getCredentials = function (credentials){
    	return $http.post(apiPrefix + '/auth', credentials)
    				.then(function (res){
                        console.log(res);
    					var res = res.data;
    					return res;
    				})
    }
    authService.isAuthenticated = function(){
    	if(localStorage.getItem('userId') != 'anon'){    
    		return true;
    	}else{
    		return false;
    	}
    }
   	authService.get  =  function(){
        return $http.post(apiPrefix + 'auth');
    }
    authService.getUserInfo = function (argument) {
        var a = localStorage.getItem('userInfo');
        if(a){
            return JSON.parse(a);
        }
        return null;
    }
    authService.localRegister = function (user) {
        return $http.post(apiPrefix+'fblogin', user)
                    .then(function (res){
                        if(res.data.status == 'success'){
                            Session.create(res.data.user.id, res.data.user.name, res.data.user.img);
                        }
                        var a = JSON.stringify(user);
                        localStorage.setItem(a);
                        Session.create(user.id, user.name, user.img);
                        return res.data;
                    });
    }
    authService.localLogout = function () {
        localStorage.removeItem('userInfo');
        Session.destroy();
        return true;
    }
    return authService;
}]);
game325.service('Session', function (){
	this.create = function(name, image, type){
		this.name = name;
		this.image = image;
		this.type = type;
	}
	this.destroy = function(){
		this.name = null;
		this.image = null;
		this.type = null;	
	}
	return this;
})