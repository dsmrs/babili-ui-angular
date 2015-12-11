(function () {
  "use strict";

  var module = angular.module("babili-ui", []);

  module.config(function ($stateProvider, $locationProvider, babiliProvider) {
    babiliProvider.configure({
      apiUrl:    "https://babili-api.spin42.me",
      socketUrl: "https://babili-pusher.spin42.me"
    });
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
        users: function (UserResource) {
          return UserResource.query().$promise;
        },
        user: function (UserResource, $stateParams) {
          return UserResource.get({
            id: $stateParams.id
          }).$promise;
        },
        babiliUser: function ($rootScope, user, users, babili) {
          return babili.connect($rootScope, user.babiliToken);
        }
      },
      onExit: function (babili) {
        babili.disconnect();
      }
    });
  });
}());
