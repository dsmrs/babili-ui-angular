(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiRoomsEditController", function ($scope, $modalInstance, room, babiliUser) {
    $scope.room = room;

    $scope.submit = function () {
      babiliUser.updateRoom($scope.room).then(function () {
        $modalInstance.close(room);
      });
    };

    $scope.cancel = function (event) {
      $modalInstance.dismiss();
      event.preventDefault();
    };
  });
}());
