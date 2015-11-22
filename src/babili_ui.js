(function () {
  "use strict";

  var module = angular.module("babili-ui", []);

  module.config(function ($stateProvider, $locationProvider) {
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
        babiliUser: function ($rootScope, user, users, babiliHelper) {
          return babiliHelper.start($rootScope);
        }
      }
    });
  });
}());
