(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiController", function ($scope, $rootScope, $state, $modal, babiliUser, user, users, UserResource) {
    $scope.babiliUser   = babiliUser;
    $scope.user         = user;
    $scope.users        = users;
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
      babiliUser.closeRoom(room).then(function () {
        $scope.$apply(function () {
          $scope.openedRoom = null;
        });
      });
    };

    $scope.openRoom = function (room) {
      babiliUser.openRoomAndCloseOthers(room).then(function (openedRoom) {
        if (openedRoom) {
          $scope.$apply(function () {
            $scope.openedRoom = openedRoom;
            setTimeout(function () {
              $(".room-messages").scrollTop($(".room-messages")[0].scrollHeight);
            }, 4);
          });
        }
      });
    };

    $scope.getUserFromBabiliId = function (babiliId) {
      return _.find($scope.users, function (user) {
        return user.babiliId === babiliId;
      });
    };

    $scope.sendMessage = function (room) {
      babiliUser.sendMessage(room, {
        content: $scope.newMessage.content,
        contentType: "text"
      }).then(function () {
        $scope.newMessage.content = null;
        $scope.$apply(function () {
        });
      });
    };
  });
}());
