(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiController", function ($scope, $rootScope, $state, $modal, babiliUser, user, users, UserResource) {
    $scope.babiliUser   = babiliUser;
    $scope.user         = user;
    $scope.users        = users;
    $scope.openedRoomId = null;
    $scope.newMessage   = {};

    $scope.createRoom = function () {
      $modal.open({
        backdrop: "static",
        templateUrl: "src/components/rooms/new/new.html",
        controller: "BabiliUiRoomsNewController",
        resolve: {
          babiliUser: function () {
            return babiliUser;
          },
          users: function () {
            return UserResource.query().$promise;
          },
          user: function () {
            return $scope.user;
          }
        }
      });
    };

    $scope.editRoom = function (room) {
      return $modal.open({
        backdrop: "static",
        templateUrl: "src/components/rooms/edit/edit.html",
        controller: "BabiliUiRoomsEditController",
        resolve: {
          babiliUser: function () {
            return babiliUser;
          },
          room: function () {
            return angular.copy(room);
          }
        }
      });
    };
    $scope.addUserToRoom = function (room) {
      return $modal.open({
        backdrop: "static",
        templateUrl: "src/components/memberships/new/new.html",
        controller: "BabiliUiMembershipsNewController",
        resolve: {
          babiliUser: function () {
            return babiliUser;
          },
          room: function () {
            return angular.copy(room);
          },
          users: function () {
            return UserResource.query().$promise;
          },
          user: function () {
            return $scope.user;
          }
        }
      });
    };

    $scope.roomName = function (room) {
      if (room && room.name !== null) {
        return room.name;
      } else {
        return "Unnamed room";
      }
    };

    $scope.closeRoom = function (room) {
      if (room !== null) {
        babiliUser.closeRoom(room).then(function () {
          $scope.$apply(function () {
            $scope.openedRoomId = null;
          });
        });
      }
    };

    $scope.openRoom = function (room) {
      if (room.id !== $scope.openedRoomId) {
        babiliUser.openSingleRoom(room).then(function (openedRoom) {
          $scope.$apply(function () {
            $scope.openedRoomId = openedRoom.id;
            $(".room-messages").scrollTop($(".room-messages")[0].scrollHeight);
          });
        });
      }
    };

    $scope.openedRoom = function () {
      return babiliUser.openedRooms()[0];
    };

    $scope.getUserFromBabiliId = function (babiliId) {
      return _.find($scope.users, function (user) {
        return user.babiliId === babiliId;
      });
    };

    $scope.sendMessage = function (room) {
      if ($scope.newMessage.content !== null) {
        babiliUser.sendMessage(room, {
          content: $scope.newMessage.content,
          contentType: "text"
        }).then(function () {
          $scope.newMessage.content = null;
          $scope.$apply(function () {
          });
        });
      }
    };

    $scope.isMessageSentByMe = function (message) {
      return $scope.user.babiliId === message.senderId;
    };
  });
}());
