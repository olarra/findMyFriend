var app = angular.module('findMyFriend.services', []);

app.factory('ContactManager', function ($q,$http,API_ENDPOINT) {

  var upadateContacts = function(allContacts) {


    return $q(function(resolve, reject) {

    $http.post(API_ENDPOINT.url + 'api/saveContacts',{allContacts: allContacts})
        .success(
            function(success){
              resolve (success);
            })
        .error(
            function(error){
                console.log(error)
            });
          });
 };

 var fetchDetails = function(phone) {
  return $http.get(API_ENDPOINT.url + 'api/fetchDetails/' + phone );
 };

 var fetchContacts = function() {
  return $http.get(API_ENDPOINT.url + 'api/fetchContacts');
};




  return {
    upadateContacts : upadateContacts,
    fetchContacts : fetchContacts,
    fetchDetails: fetchDetails,
  }

});


app.factory('GPSManager', function ($q,$http,API_ENDPOINT) {

  var sendPosition = function(position) {
    console.log("esto estas enviando : " + position);

   return $q(function(resolve, reject) {

     $http.post(API_ENDPOINT.url + 'api/savePosition',{position : position})
    //$http.post(API_ENDPOINT.url + 'api/savePosition',{longitude: position.coords.longitude, latitude : position.coords.latitude, timestamp: position.timestamp})
        .success(
            function(success){
              resolve (success);
            })
        .error(
            function(error){
                console.log(error)
            });
          });
 }


 var getPosition = function() {
  return $http.get(API_ENDPOINT.url + 'api/getPosition');
}

  var removePosition = function(position) {
  $http.delete(API_ENDPOINT.url + 'api/deletePosition/' + position.date );
}

  return {
    sendPosition : sendPosition,
    getPosition  : getPosition,
    removePosition  : removePosition,
  }

});





app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});

app.factory('authService', function ($q,$http,API_ENDPOINT) {

  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var isAuthenticated = false;
  var authToken;


 var login = function(user) {
   return $q(function(resolve, reject) {
     $http.post(API_ENDPOINT.url + 'api/login', {name : user.name, password : user.password})
      .then(function(result) {
           if(result.data.success) {
              storeUserCredentials(result.data.token);
              resolve(result.data);
           }
           else {
              reject(result.data.msg);
            }
         })
      .catch(function(error) { console.log(error) });
  });
};


var getProfil= function() {
 return $http.get(API_ENDPOINT.url + 'api/getProfil');
}

var register = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + 'api/signup', {username : user.name, password : user.password, mail : user.mail, telephone : user.telephone, date : user.date, sex : user.sex}).then(function(result) {
        if (result.data.success) {
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };


var logout = function() {

  destroyUserCredentials();

};


    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        isAuthenticated = true;
        authToken = token;
        $http.defaults.headers.common.Authorization = authToken;
      }
    }


   function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      isAuthenticated = true;
      authToken = token;
      $http.defaults.headers.common.Authorization = authToken;
  }

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }

loadUserCredentials();

return {
  login : login,
  register: register,
  logout: logout,
  getProfil : getProfil,
  isAuthenticated: function() {return isAuthenticated;}
}

});
