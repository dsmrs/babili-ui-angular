(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiMembershipsNewController", function ($scope, $modalInstance, babiliUser,
                                                            room, user, users) {
    $scope.users            = users;
    $scope.selectedUsers    = room.users;
    $scope.selectedUser     = null;
    $scope.newSelectedUsers = [];
    $scope.room             = room;
    $scope.user             = user;

    $scope.submit = function () {
      var selectedUserBabiliIds;
      selectedUserBabiliIds = _.map($scope.newSelectedUsers, function (selectedUser) {
        return selectedUser.babiliId;
      });

      if (selectedUserBabiliIds.length > 0) {
        babiliUser.addUserToRoom(room, selectedUserBabiliIds[0]).then(function () {
          $modalInstance.close();
        });
      } else {
        $modalInstance.close();
      }
    };

    $scope.userSelected = function (item, model) {
      $scope.selectedUsers.push(model);
      $scope.newSelectedUsers.push(model);
      $scope.selectedUser = null;
    };

    $scope.removeSelectedUser = function (user) {
      var index;
      index = $scope.newSelectedUsers.indexOf(user);
      if (index > -1) {
        $scope.newSelectedUsers.splice(index, 1);
      }
    };

    $scope.cancel = function (event) {
      $modalInstance.dismiss();
      event.preventDefault();
    };
  });
}());
