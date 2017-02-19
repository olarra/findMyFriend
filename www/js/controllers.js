var app = angular.module('findMyFriend.controllers', []);

app.controller('LoginCtrl', function (authService,$scope,$state,$ionicPopup,$location) {

  $scope.user = {
    name: '',
    password: ''
  };

$scope.login = function () {
    authService.login($scope.user)
    .then(
      function(data)   {
        console.log(data.msg);
        console.log(data.token);
        console.log(data.connection);

        if(data.connection == 0)
        {
          $state.go('configuration');
        }
        else{
          $state.go('tab.mesAmis');
        }
      },
      function(errMsg) { $ionicPopup.alert({title : 'Login Failed!', template: errMsg }); }
    );
  };
});

app.controller('SignupCtrl', function(authService,$scope,$state,$ionicPopup) {
  $scope.newUser = {
    name: '',
    password: '',
    mail :'',
    telephone :'',
    date : '',
    sex : ''
  };

  $scope.signup = function() {
    authService.register($scope.newUser)
    .then(
      function(msg) {
          $state.go('login');
          $ionicPopup.alert({title: 'Register success!', template: msg});},
      function(errMsg) {
         $ionicPopup.alert({title: 'Register failed!', template: errMsg }); }
      );
    };
});


app.controller('AppCtrl', function($scope, $state, $ionicPopup, authService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    authService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
});

app.controller('ContactsHomeCtrl', function($scope,$cordovaContacts,authService,ContactManager,$state,$location,$ionicScrollDelegate) {

  var colorArray = ['#f1c40f', '#e74c3c'];
  $scope.loading= false;

  //send contact to the server to be normalized and formatted
  ContactManager.fetchContacts()
  .success(function(contacts){
    console.log("fetching contacts");
    $scope.normalized = contacts;
    $scope.fetch = true;
  });

  $scope.getColor = function (index) {
     return colorArray[index % 2];
  };

  $scope.logout = function() {
    authService.logout();
    $state.go('login');
  };

  $scope.updateAllContacts = function()
  {
      $scope.items=[];
      $scope.length = 0;
      $scope.loading = true;
      $scope.end = false;
      $scope.normalize = [];
      var item =[];

      $ionicScrollDelegate.scrollTop();

      $cordovaContacts.find({filter:'',multiple:true}).then(
        function(allContacts) {
          $scope.length = allContacts.length;
            for(var i=0; i < allContacts.length; i++)
            {
              item=allContacts[i];
              if(item.phoneNumbers == null){
              $scope.items.push({id:i,name:item.name.formatted,type:"Undefined",phone_no:"Undefined"});
              }
              else{
              $scope.items.push({id:i,name:item.name.formatted,type:item.phoneNumbers[0].type,phone_no:item.phoneNumbers[0].value});
              }
           }
           //send contact to the server to be normalized and formatted
           ContactManager.upadateContacts($scope.items)
           .then(
             function(succes) {
               ContactManager.fetchContacts()
                .success(function(contacts){ console.log(contacts); $scope.normalized = contacts; });
                $scope.loading = false;
                $scope.end = true;
             }
           );
      });

  }

});

app.controller('FavoirsCtrl', function($scope,authService,ContactManager,$state) {

  $scope.fetch = false;

  //send contact to the server to be normalized and formatted
  ContactManager.fetchContacts()
  .success(function(contacts){
    console.log("fetching contacts");
    $scope.normalized = contacts;
    $scope.fetch = true;
  });

  $scope.logout = function() {
    authService.logout();
    $state.go('login');
  };


});


app.controller('ContactsDetailCtrl', function($scope,$stateParams,authService,ContactManager,$state) {

  // gloal variables and map initizialisation
  $scope.map = L.map('myMap',{closePopupOnClick : false}).setView([49.18300,-0.36607], 12);


  // Custom Markers configuration
    var redIcon =  L.icon({
      iconUrl : "./img/red_marker.png",
      iconSize : [26,38],
    });

    var yellowIcon =  L.icon({
      iconUrl : "./img/yellow_marker.png",
      iconSize : [26,38]
    });


// LogOut Function
  $scope.logout = function() {
    authService.logout();
    $state.go('login');
  };



  $scope.reload = function(){
        $state.reload(true);
    };


$scope.$on('$ionicView.enter', function(e) {

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {

      meMarker =L.marker([position.coords.latitude, position.coords.longitude],{icon : redIcon}).addTo($scope.map);
      meMarker.bindPopup("<b>Me!</b><br>").openPopup();
      var origin = meMarker.getLatLng();
      console.log("origin latitude : " + origin.lat);
      console.log("origin longitude : " + origin.lng);
      $scope.origin = origin;

    });
  } else {
    console.warn('No geolocation available!')
  }


  var phone = $stateParams.contactId;


// Fetch selected contact posittions and display them (every time the controller gets activated.)
ContactManager.fetchDetails(phone)
  .success(function(details) {
      console.log("fetching Details");
      for(i=0; i<details.localisation.length; i++) {
        if(details.localisation[i] == null) {
            console.log("first element is null");
        } else {
            var marker = L.marker([details.localisation[i].latitude, details.localisation[i].longitude],{icon : yellowIcon}).addTo($scope.map);
            marker.on('click', onClick).addTo($scope.map);
            marker.bindPopup("<b>Date</b><br>" + details.localisation[i].date).openPopup();
            function onClick(e) {
              console.log($scope);

                $scope.destination = this.getLatLng();
                $scope.$apply();

              //$state.reload();
              console.log("destination latitude : " + $scope.destination.lat);
              console.log("destination longitude : " + $scope.destination.lng);
            }


        }

      }

    });


    $scope.getRoute = function () {
      L.Routing.control({
        waypoints: [
          L.latLng($scope.origin.lat, $scope.origin.lng),
          L.latLng($scope.destination.lat,$scope.destination.lng)
        ],
        createMarker: function () { return null }
      }).addTo($scope.map).hide();

      $scope.map.setView([origin.lat,origin.lng], 14);
    }

  });
});


app.controller('ConfigCtrl', function($scope, $state, $ionicSlideBoxDelegate,$cordovaContacts,GPSManager,ContactManager,$ionicScrollDelegate) {

  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('tab.mesAmis');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

  $scope.sendContacts = function()
  {
      $scope.items=[];
      $scope.length = 0;
      $scope.loading = true;
      $scope.end = false;
      var item =[];

      $ionicScrollDelegate.scrollTop();

      $cordovaContacts.find({filter:'',multiple:true}).then(
        function(allContacts) {
          $scope.length = allContacts.length;

            for(var i=0; i < allContacts.length; i++)
            {
              item=allContacts[i];
              if(item.phoneNumbers == null){
              $scope.items.push({id:i,name:item.name.formatted,type:"Undefined",phone_no:"Undefined"});
              }
              else{
              $scope.items.push({id:i,name:item.name.formatted,type:item.phoneNumbers[0].type,phone_no:item.phoneNumbers[0].value});
              }
           }
           //send contact to the server to be normalized and formatted

           ContactManager.upadateContacts($scope.items)
           .then(
             function(succes) {
               console.log("recuperation de contacts finie!");
                $scope.loading = false;
                $scope.end = true;
             }
           );
      });
  }

 $scope.updatePosition = function(){

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position);
        //send contact to the server to be normalized and formatted
        GPSManager.sendPosition(position)
        .then(
          function(succes) {
            console.log("position envoyé!");
          }
        );
      });
    }
  }

});

app.controller('AproposCtrl', function($scope,authService,$state) {
  $scope.logout = function() {
    authService.logout();
    $state.go('login');
  };
});

app.controller('PositionsCtrl', function($scope,authService,ContactManager,GPSManager,$state) {

  $scope.myPositions = [{}];
  var myPositions = [];

  $scope.logout = function() {
    authService.logout();
    $state.go('login');
  };

$scope.$on('$ionicView.enter', function(e) {

  $scope.remove = function(position,index) {
    console.log(position);
  GPSManager.removePosition(position);
  position.myvar = position.date;
  console.log(position.date);
  };

    authService.getProfil()
    .success(function(profil){
      console.log("getting profil");
      console.log(profil);
      var myprofil = profil;
      console.log("phone sent : " + myprofil.user.telephone);
      ContactManager.fetchDetails(myprofil.user.telephone)
        .success(function(details) {
            console.log("fetching Details");
            for(i=0; i<details.localisation.length; i++) {
              if(details.localisation[i] == null) {
                  console.log("first element is null");
              } else {
                  var tmp = {latitude : details.localisation[i].latitude, longitude : details.localisation[i].longitude, date : details.localisation[i].date}
                  myPositions.push(tmp);
              }
            }
            $scope.myPositions = myPositions;
            console.log($scope.myPositions);
          });
    });


   $scope.updatePosition = function(){
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          console.log(position);
          //send contact to the server to be normalized and formatted
          GPSManager.sendPosition(position)
          .then(
            function(succes) {
              console.log("position envoyé!");
            }
          );
        });
      }
      $state.reload();
  }


});


});



app.controller('ProfilCtrl', function($scope,authService,$state) {

  $scope.logout = function() {
    authService.logout();
    $state.go('login');
  };

  $scope.getProfil = function (){
    authService.getProfil()
    .success(function(profil){
      console.log("getting profil");
      $scope.profil = profil;
      var date = new Date(profil.user.date);
      $scope.date = (date.getDate()+1) + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
    });
}

    $scope.destroySession = function() {
      console.log("destroy");
        authService.logout();
      };


});
