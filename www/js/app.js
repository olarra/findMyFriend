var app = angular.module('findMyFriend', ['ionic','angular-spinkit','ngMask','ngCordova','angular-spinkit','findMyFriend.controllers','findMyFriend.constants','findMyFriend.services','findMyFriend.directives']);

app.run(function($ionicPlatform,$rootScope, $state, authService, AUTH_EVENTS) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
   if (!authService.isAuthenticated()) {
     console.log(next.name);
     if (next.name !== 'login' && next.name !== 'signup') {
       event.preventDefault();
       $state.go('login');
     }
   }
 });
});

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'templates/login.html',
      controller : 'LoginCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller : 'SignupCtrl'
    })
    .state('configuration',{
        url: '/configuration',
        templateUrl : 'templates/configuration.html',
        controller : 'ConfigCtrl'
    })
    .state('tab', {
        url: '/tab',
        abstract : 'true',
        templateUrl: 'templates/tabs.html'
    })
    .state('tab.favoris', {
        url: '/favoris',
        views: {
          'tab-favoris': {
              templateUrl: 'templates/tab-favoris.html',
              controller: 'FavoirsCtrl'
            }
        }
    })
    .state('tab.favoris-detail', {
      url: '/favoris/:contactId',
      views: {
        'tab-favoris': {
          templateUrl: 'templates/favoris-detail.html',
          controller: 'ContactsDetailCtrl'
        }
      }
    })
    .state('tab.mesAmis', {
        url: '/mesAmis',
        views: {
          'tab-mesAmis': {
              templateUrl: 'templates/tab-mesAmis.html',
              controller: 'ContactsHomeCtrl'
            }
        }
    })
    .state('tab.mesAmis-detail', {
      url: '/mesAmis/:contactId',
      views: {
        'tab-mesAmis': {
          templateUrl: 'templates/mesAmis-detail.html',
          controller: 'ContactsDetailCtrl'
        }
      }
    })
    .state('tab.apropos', {
    url: '/apropos',
    views: {
      'tab-apropos': {
        templateUrl: 'templates/tab-apropos.html',
        controller: 'AproposCtrl'
      }
    }
  })
  .state('tab.profil', {
  url: '/profil',
  views: {
    'tab-profil': {
      templateUrl: 'templates/tab-profil.html',
      controller: 'ProfilCtrl'
      }
    }
  })
  .state('tab.myPositions', {
  url: '/positions',
  views: {
    'tab-profil': {
      templateUrl: 'templates/tab-positions.html',
      controller: 'PositionsCtrl'
    }
  }
  });

  $urlRouterProvider.otherwise("/");

});
