var app = angular.module('findMyFriend.constants', [ ]);

app.constant('AUTH_EVENTS', {notAutheticated : 'auth-not-authenticated'});

//app.constant('API_ENDPOINT',{url :'http://127.0.0.1:3000/'});

app.constant('API_ENDPOINT',{url :'https://findmyfr.herokuapp.com/'});

//For request to the api in a production use : url : https://XXXX.herokuapp.com/api/XXXXX/
