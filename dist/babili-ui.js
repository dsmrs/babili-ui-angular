(function () {
  "use strict";

  var module = angular.module("babili-ui", []);

  module.config(["$stateProvider", "$locationProvider", function ($stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider

    .state("bu", {
      parent: "bw.babili-ui",
      abstract: true,
      template: "<ui-view />"
    })

    .state("bu.show", {
      url: "/:id",
      controller: "BabiliUiController",
      templateUrl: "src/babili_ui.html",
      resolve: {
        users: ["UserResource", function (UserResource) {
          return UserResource.query().$promise;
        }],
        user: ["UserResource", "$stateParams", function (UserResource, $stateParams) {
          return UserResource.get({
            id: $stateParams.id
          }).$promise;
        }],
        babiliUser: ["$rootScope", "user", "users", "babili", function ($rootScope, user, users, babili) {
          return babili.connect($rootScope, user.babiliToken);
        }]
      },
      onExit: ["babili", function (babili) {
        babili.disconnect();
      }]
    });
  }]);
}());

(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiController", ["$scope", "$rootScope", "$state", "$modal", "babiliUser", "user", "users", "UserResource", function ($scope, $rootScope, $state, $modal, babiliUser, user, users, UserResource) {
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
  }]);
}());

(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiMembershipsNewController", ["$scope", "$modalInstance", "babiliUser", "room", "user", "users", function ($scope, $modalInstance, babiliUser,
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
      index = $scope.selectedUsers.indexOf(user);
      if (index > -1) {
        $scope.selectedUsers.splice(index, 1);
      }
    };

    $scope.cancel = function (event) {
      $modalInstance.dismiss();
      event.preventDefault();
    };
  }]);
}());

(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiRoomsEditController", ["$scope", "$modalInstance", "room", "babiliUser", function ($scope, $modalInstance, room, babiliUser) {
    $scope.room = room;

    $scope.submit = function () {
      babiliUser.updateRoomName($scope.room).then(function () {
        $modalInstance.close(room);
      });
    };

    $scope.cancel = function (event) {
      $modalInstance.dismiss();
      event.preventDefault();
    };
  }]);
}());

(function () {
  "use strict";

  angular.module("babili-ui")
  .controller("BabiliUiRoomsNewController", ["$scope", "$modalInstance", "babiliUser", "users", "user", function ($scope, $modalInstance, babiliUser, users,
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
  }]);
}());

angular.module('babili-ui').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/babili_ui.html',
    "<div class=\"row babili-ui full-height\">\n" +
    "  <div class=\"col-md-3 rooms\">\n" +
    "    <h2>\n" +
    "      Rooms\n" +
    "      <small>\n" +
    "        <a href=\"#\" ng-click=\"createRoom()\" class=\"pull-right fa-big-link\"><i class=\"fa fa-plus-square-o\"></i></a>\n" +
    "      </small>\n" +
    "    </h2>\n" +
    "    <ul class=\"room-list\">\n" +
    "      <li ng-repeat=\"room in babiliUser.rooms\" ng-click=\"openRoom(room)\" ng-class=\"{active: openedRoom.id == room.id}\" class=\"room-list-item\">\n" +
    "        {{roomName(room)}}\n" +
    "        <table class=\"room-user-list\">\n" +
    "          <tbody>\n" +
    "            <tr ng-repeat=\"roomUser in room.users\" class=\"room-user-list-item\">\n" +
    "              <td class=\"room-user-name\">\n" +
    "                {{getUserFromBabiliId(roomUser.id).name}}\n" +
    "              </td>\n" +
    "              <td class=\"room-user-status\">\n" +
    "                <span ng-show=\"roomUser.status == 'online'\">\n" +
    "                  <i class=\"fa fa-circle\"></i>\n" +
    "                </span>\n" +
    "                <span ng-hide=\"roomUser.status == 'online'\">\n" +
    "                  <i class=\"fa fa-circle-o\"></i>\n" +
    "                </span>\n" +
    "              </td>\n" +
    "            </tr>\n" +
    "          </tbody>\n" +
    "        </table>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"col-md-9 no-room-selected-placeholder\" ng-hide=\"openedRoom\">\n" +
    "    <p>\n" +
    "      Hi {{user}},\n" +
    "      <br/>\n" +
    "      you need to select a room.\n" +
    "    </p>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"col-md-9 room\" ng-show=\"openedRoom\">\n" +
    "    <h2>\n" +
    "      {{roomName(openedRoom)}}\n" +
    "      <a href=\"#\" ng-click=\"editRoom(openedRoom)\" class=\"fa-big-link\">\n" +
    "        <i class=\"fa fa-pencil-square-o\"></i>\n" +
    "      </a>\n" +
    "      <small class=\"pull-right\">\n" +
    "        <a href=\"#\" ng-click=\"addUserToRoom(openedRoom)\" class=\"fa-big-link\">\n" +
    "          <i class=\"fa fa-user\"></i>\n" +
    "        </a>\n" +
    "\n" +
    "        <a href=\"#\" ng-click=\"closeRoom(openedRoom)\" class=\"fa-big-link\">\n" +
    "          <i class=\"fa fa-times-circle\"></i>\n" +
    "        </a>\n" +
    "      </small>\n" +
    "    </h2>\n" +
    "    <div class=\"room-messages\" scroll-bottom=\"openedRoom.messages\">\n" +
    "      <ul>\n" +
    "        <li ng-repeat=\"message in openedRoom.messages track by message.id\" ng-class=\"babiliUser.messageSentByMe(message)? 'message-sent':'message-received'\">\n" +
    "          <div>{{message.content}}</div>\n" +
    "          <div class=\"message-information\" ng-hide=\"isMessageSentByMe(message)\">\n" +
    "            Sent by {{message.senderId}} at {{message.createdAt}}\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"message-information\" ng-show=\"isMessageSentByMe(message)\">\n" +
    "            Sent by you at {{message.createdAt}}\n" +
    "          </div>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "    <div class=\"room-new-message\">\n" +
    "      <div class=\"row full-height\">\n" +
    "        <form name=\"form\" ng-submit=\"sendMessage(openedRoom)\">\n" +
    "          <div class=\"col-md-10 full-height\">\n" +
    "            <textarea class=\"form-control\" id=\"message\" ng-model=\"newMessage.content\" placeholder=\"Type your message\" required></textarea>\n" +
    "          </div>\n" +
    "          <div class=\"col-md-2 full-height\">\n" +
    "            <button type=\"submit\" class=\"btn btn-primary\">Send</button>\n" +
    "          </div>\n" +
    "        </form>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/memberships/new/new.html',
    "<div class=\"babili-ui\">\n" +
    "  <div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\">Add user to room</h3>\n" +
    "  </div>\n" +
    "  <form name=\"form\" ng-submit=\"submit()\">\n" +
    "    <div class=\"modal-body\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"user\">Select user to add</label>\n" +
    "        <input type=\"text\" class=\"form-control form-control-inverted\" ng-model=\"selectedUser\" typeahead=\"user as user.name for user in users | selectableUsers:$viewValue:selectedUsers:user\" typeahead-on-select=\"userSelected($item, $model, $label)\" typeahead-editable=\"false\">\n" +
    "      </div>\n" +
    "      <div class=\"form-group\" ng-show=\"newSelectedUsers.length > 0\">\n" +
    "        <label for=\"users\">Selected user</label>\n" +
    "        <ul class=\"selected-users\">\n" +
    "          <li ng-repeat=\"newSelectedUser in newSelectedUsers track by newSelectedUser.id\" class=\"selected-user\">\n" +
    "            {{newSelectedUser.name}}\n" +
    "            <span class=\"pull-right\">\n" +
    "              <a href=\"#\" ng-click=\"removeSelectedUser(newSelectedUser)\"><i class=\"fa fa-times\"></i></a>\n" +
    "            </span>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "    <div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "      <button class=\"btn btn-primary\" ng-click=\"cancel($event)\">Cancel</button>\n" +
    "      <input type=\"submit\" class=\"btn btn-primary\" value=\"Save\">\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/rooms/edit/edit.html',
    "<div class=\"babili-ui\">\n" +
    "  <div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\">Edit room</h3>\n" +
    "  </div>\n" +
    "  <form name=\"form\" ng-submit=\"submit()\">\n" +
    "    <div class=\"modal-body\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"name\">Name</label>\n" +
    "        <input type=\"text\" class=\"form-control form-control-inverted\" ng-model=\"room.name\" placeholder=\"Enter a room name\" required>\n" +
    "      </div>\n" +
    "    <div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "      <button class=\"btn btn-primary\" ng-click=\"cancel($event)\">Cancel</button>\n" +
    "      <input type=\"submit\" class=\"btn btn-primary\" value=\"Save\">\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/rooms/new/new.html',
    "<div class=\"babili-ui\">\n" +
    "  <div class=\"modal-header\">\n" +
    "    <h3 class=\"modal-title\">Create room</h3>\n" +
    "  </div>\n" +
    "  <form name=\"form\" ng-submit=\"submit()\">\n" +
    "    <div class=\"modal-body\">\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"name\">Name</label>\n" +
    "        <input type=\"text\" class=\"form-control form-control-inverted\" ng-model=\"room.name\" required>\n" +
    "      </div>\n" +
    "      <div class=\"form-group\">\n" +
    "        <label for=\"user\">Select user to add</label>\n" +
    "        <input type=\"text\" class=\"form-control form-control-inverted\" ng-model=\"selectedUser\" typeahead=\"user as user.name for user in users | selectableUsers:$viewValue:selectedUsers:user\" typeahead-on-select=\"userSelected($item, $model, $label)\" typeahead-editable=\"false\">\n" +
    "      </div>\n" +
    "      <div class=\"form-group\" ng-show=\"selectedUsers.length > 0\">\n" +
    "        <label for=\"users\">Selected users</label>\n" +
    "        <ul class=\"selected-users\">\n" +
    "          <li ng-repeat=\"selectedUser in selectedUsers track by selectedUser.id\" class=\"selected-user\">\n" +
    "            {{selectedUser.name}}\n" +
    "            <span class=\"pull-right\">\n" +
    "              <a href=\"#\" ng-click=\"removeSelectedUser(selectedUser)\"><i class=\"fa fa-times\"></i></a>\n" +
    "            </span>\n" +
    "          </li>\n" +
    "        </ul>\n" +
    "      </div>\n" +
    "    <div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "      <button class=\"btn btn-primary\" ng-click=\"cancel($event)\">Cancel</button>\n" +
    "      <input type=\"submit\" class=\"btn btn-primary\" value=\"Save\">\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );

}]);
