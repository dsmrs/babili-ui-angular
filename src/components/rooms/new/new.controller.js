(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiRoomsNewController", function ($scope, $modalInstance, babiliUser, users,
                                                      user) {
    $scope.users         = users;
    $scope.user          = user;
    $scope.selectedUsers = [];
    $scope.selectedUser  = null;
    $scope.room          = {
      name: ""
    };

    $scope.submit = function () {
      var selectedUserBabiliIds;
      selectedUserBabiliIds = _.map($scope.selectedUsers, function (selectedUser) {
        return selectedUser.babiliId;
      });

      if (selectedUserBabiliIds.length > 0) {
        babiliUser.createRoom($scope.room.name, selectedUserBabiliIds).then(function () {
          $modalInstance.close();
        });
      } else {
        $modalInstance.close();
      }
    };

    $scope.userSelected = function (item, model) {
      $scope.selectedUsers.push(model);
      $scope.selectedUser = null;
    };

    $scope.removeSelectedUser = function (user) {
      var index;
      index = $scope.selectedUsers.indexOf(user);
      if (index > -1) {
        $scope.selectedUsers.splice(index, 1);
      }
    };

    $scope.cancel = function (event) {
      $modalInstance.dismiss();
      event.preventDefault();
    };
  });
}());
