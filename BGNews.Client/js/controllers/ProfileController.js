'use strict';

newsApp.controller('ProfileController', function ($scope, $rootScope, userData, SCHEME_COLORS) {
    if ($rootScope.currentUser) {
        $scope.isLogged = true;
        $scope.hello = 'Hello ' + $rootScope.currentUser.username;
        $scope.colors = SCHEME_COLORS;

        $scope.updateProfile = function (user) {
            userData.updateProfile(user);
        };

        $scope.deleteProfile = function () {
            userData.deleteProfile();
        }
    }
    else {
        $scope.isLogged = false;
        $rootScope.navigateTo('/');
    }
});
