var app = angular.module('findMyFriend.directives', []);

app.directive('myMap', [ function () {
  return {
    restrict: 'A',
    scope: true,
    bindToController : true,
    controller: function ($scope) {
        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        }).addTo($scope.map);
    }
  }
}]);
