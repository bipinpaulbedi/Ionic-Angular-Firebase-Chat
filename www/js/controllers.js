angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, Auth, $state) {
  $scope.login = function(authMethod) {
    Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
        });
      } else {
        console.log(error);
      }
    });
  };

  Auth.$onAuth(function(authData) {
    // This will display the user's name in our view
    $scope.authData = authData;
    if(authData){
      $state.go('tab.getIt');
    }
  });

})

.controller('getItCtrl', function($scope, PersistentStorage, $state, Auth) {

  $scope.item = {
    itemName : '',
    itemLocation : '',
    authData : ''
  };

  $scope.item.authData = PersistentStorage.getAuth();

  $scope.addItem = function(){
    if($scope.item.authData){
      var itemReference  = PersistentStorage.child("Items");
      itemReference.push().set({item: $scope.item.itemName, location: $scope.item.itemLocation, user: $scope.item.authData.uid, userName: $scope.item.authData.facebook.displayName, userImgUrl: $scope.item.authData.facebook.profileImageURL, creationDate: Firebase.ServerValue.TIMESTAMP});
      $scope.item.itemName = '';
      $scope.item.itemLocation = '';
      $state.go('tab.items');
    }
  };

  $scope.logout = function(){
    Auth.$unauth();
    $state.go('login');
  };

  $scope.$watch("item.itemName", function(newValue, oldValue){
      if (newValue.length > 20){
          $scope.item.itemName = oldValue;
      }
  });

  $scope.$watch("item.itemLocation", function(newValue, oldValue){
      if (newValue.length > 20){
          $scope.item.itemLocation = oldValue;
      }
  });
})

.controller('ChatsCtrl', function($scope,PersistentStorage, $state, Auth, $ionicLoading) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.chats = [];
  $scope.items = {};
  $scope.authData = PersistentStorage.getAuth();
  var chatReference  = PersistentStorage.child("Chats/" + $scope.authData.uid);
  var itemReference  = PersistentStorage.child("Items");

  chatReference.on("child_added", function(chat){
    var chatPerProduct = chat.val();
    var productKey = chat.key();
    var userDisplayName = 'Gift something to yourself !!!';
    var userAction = 'Buy ';
    if($scope.items[productKey] != null){
      for(var chatPerUser in chatPerProduct){
        if($scope.items[productKey].user != $scope.authData.uid){
          userDisplayName = 'to ' + $scope.items[productKey].userName;
          userAction = 'Sell '
        }
        var chatObject = {key: productKey,user: chatPerUser, displayName: userDisplayName, url: $scope.items[productKey].userImgUrl, productdesc: userAction + $scope.items[productKey].item};
        $scope.chats.unshift(chatObject);
      }
    }
    else{
      itemReference.child(productKey).once("value", function(item){
        $scope.items[productKey] = item.val();
        for(var chatPerUser in chatPerProduct){
          if($scope.items[productKey].user != $scope.authData.uid){
            userDisplayName = 'to ' + $scope.items[productKey].userName;
            userAction = 'Sell '
          }
          var chatObject = {key: productKey,user: chatPerUser, displayName: userDisplayName, url: $scope.items[productKey].userImgUrl, productdesc: userAction + $scope.items[productKey].item};
          $scope.chats.unshift(chatObject);
        }
      });
    }
    $scope.$apply();
  });

  $scope.logout = function(){
      Auth.$unauth();
      $state.go('login');
  };
})

.controller('ChatDetailCtrl', function($scope,PersistentStorage, $stateParams, $ionicLoading) {

  $scope.chatData = {
    messages: [],
    authData: '',
    newMessage: '',
    chatUser: 'Waiting for reply from buyer !!!',
  };

  $scope.chatData.authData = PersistentStorage.getAuth();
  var chatMessageReferenceS  = PersistentStorage.child("Chats/" + $scope.chatData.authData.uid + "/" + $stateParams.itemId + "/" + $stateParams.userId);
  var chatMessageReferenceR  = PersistentStorage.child("Chats/" + $stateParams.userId + "/" + $stateParams.itemId + "/" + $scope.chatData.authData.uid);

  chatMessageReferenceS.on("child_added", function(item){
    var itemObj = item.val();
    itemObj.cssClass = "right";
    if(itemObj.senderId != $scope.chatData.authData.uid){
      itemObj.cssClass = "left";
      $scope.chatData.chatUser = 'Chat with ' + itemObj.senderName;
    }
    $scope.chatData.messages.unshift(itemObj);
    if(!$scope.$$phase)
      $scope.$apply();
  });

  $scope.sendMessage = function(){
    if($scope.chatData.authData){
      chatMessageReferenceS.push().set({senderId: $scope.chatData.authData.uid,senderName:  $scope.chatData.authData.facebook.displayName, message: $scope.chatData.newMessage});
      chatMessageReferenceR.push().set({senderId: $scope.chatData.authData.uid,senderName:  $scope.chatData.authData.facebook.displayName, message: $scope.chatData.newMessage});
      $scope.chatData.newMessage = '';
    }
  };

  $scope.$watch("chatData.newMessage", function(newValue, oldValue){
      if (newValue.length > 50){
          $scope.chatData.newMessage = oldValue;
      }
  });

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
  });
})

.controller('ItemsCtrl', function($scope, PersistentStorage, $state, Auth, $ionicLoading) {
  $scope.openItems = [];
  $scope.authData = PersistentStorage.getAuth();
  $ionicLoading.show({
    template: 'loading...'
  });
  var itemReference  = PersistentStorage.child("Items");

  itemReference.on("child_added", function(item){
    var itemObj = item.val();
    itemObj.key = item.key();
    $scope.openItems.unshift(itemObj);
    $ionicLoading.hide();
    $scope.$apply();
  });

  $scope.logout = function(){
    Auth.$unauth();
    $state.go('login');
  };
});
