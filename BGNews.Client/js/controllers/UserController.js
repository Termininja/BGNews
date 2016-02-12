(function () {
    'use strict';

    newsApp.controller('UserController', function ($scope, $routeParams, $rootScope, userData) {
        $rootScope.title = $routeParams.username;
        $rootScope.getActiveState();

        userData.getUser($routeParams.username).then(function (data) {
            $scope.user = data;
        });
    });
}());