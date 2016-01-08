angular.module('starter.services', [])

.factory('Auth', function($firebaseAuth) {
    var endPoint = 'https://getmesomething.firebaseio.com/';
    var usersRef = new Firebase(endPoint);
    return $firebaseAuth(usersRef);
  })

.factory('PersistentStorage', function() {
    var endPoint = 'https://getmesomething.firebaseio.com/';
    var usersRef = new Firebase(endPoint);
    return usersRef;
  });
