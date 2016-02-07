(function () {
    'use strict';

    newsApp.controller('UserController', function ($scope, $routeParams, $rootScope, userData) {
        $rootScope.title = $routeParams.username;

        userData.getUser($routeParams.username).then(function (data) {
            $scope.user = data;
        });
    });
}());