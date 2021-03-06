game325.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider){
//$locationProvider.html5mode(true).hashPrefix('!');
    // if(window.mobileAndTabletcheck() == true){
       if(false){
        // console.log(window.mobileAndTabletcheck());
        $stateProvider
        .state('mobileBrowser', {
            url: '/home',
            templateUrl : 'templates/mobileBrowser.html',
            data : {
                        requiresAuth : false
                    }
        })
        $urlRouterProvider.otherwise("/");
    }else{
        $stateProvider
            // .state('login', {
            //     url: '/',
            //     controller: 'loginController',
            //     templateUrl: 'app/templates/login.html',
            //         data: {
            //             requiresAuth: true
            //         }
            // })
            .state('home', {
                url : '/home', // this was / nv
                controller : 'startController',
                templateUrl : 'templates/homenew2.html',
                    data : {
                        requiresAuth : true
                    }
                })
            .state('cover', {
                url : '/', // this was / nv
                controller : 'startController',
                templateUrl : 'templates/homenew2.html',
                    data : {
                        requiresAuth : true
                    }
                })
            // .state('cover', {
            //     url : '/', // this was / nv
            //     controller : 'coverController',
            //     templateUrl : 'app/templates/cover.html',
            //         data : {
            //             requiresAuth : true
            //         }
            //     })
            .state('blog', {
                url : '/blog', // this was / nv
                controller : 'blogController',
                templateUrl : 'templates/blog.html',
                    data : {
                        requiresAuth : true
                    }
                })
            .state('leaderboard', {
                url: '/leaderboard',
                controller: 'leaderBoardController',
                templateUrl : 'templates/leaderboard.html',
                    data : {
                        requiresAuth : false
                    }
            })
            .state('start', {
                url : '/start',
                controller : 'startController',
                templateUrl : 'templates/start.html',
                    data : {
                        requiresAuth : true
                    }
                
            })
            .state('create', {
                url : '/create',
                controller : 'startController',
                templateUrl : 'templates/start.html',
                    data : {
                        requiresAuth : true
                    }
                
            })
            .state('join', {
                url : '/join',
                controller : 'startController',
                templateUrl : 'templates/start.html',
                    data : {
                        requiresAuth : true
                    }
                
            })
            .state('game/:id', {
                url : '/game/:id',
                controller : 'gameReactController',
                templateUrl : 'templates/gameReact.html',
                    data : {
                        requiresAuth : false
                    }
            })
            .state('game325', {
                url : '/game325',
                controller : 'gameReactController',
                templateUrl : 'templates/gameReact.html',
                    data : {
                        requiresAuth : false
                    }
            })
            .state('game/:id/:type', {
                url : '/game/:id/:type',
                controller : 'gameReactController',
                templateUrl : 'templates/gameReact.html',
                    data : {
                        requiresAuth : true
                    }
            })
            .state('info', {
                url : '/info',
                controller : 'infoController',
                templateUrl  : 'templates/info.html',
                data : {
                    requiresAuth : false
                }
            });
         $urlRouterProvider.otherwise("/");
    }

    $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
    });
    $locationProvider.hashPrefix("");

}]);