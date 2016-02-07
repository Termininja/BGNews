(function () {
    'use strict';

    newsApp.controller('AddPostController', function ($rootScope, $scope, postData) {
        if ($rootScope.currentUser && $rootScope.currentUser.role === 'Administrator') {
            $scope.isAdmin = true;
            $scope.addPost = function (post) {
                postData.addPost(post);
            };

            $scope.cancel = function () {
                $rootScope.navigateTo('/');
            };
        }
        else {
            $scope.isAdmin = false;
            $rootScope.navigateTo('/');
        }
    });
}());