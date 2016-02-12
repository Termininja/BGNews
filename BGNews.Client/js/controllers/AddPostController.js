(function () {
    'use strict';

    newsApp.controller('AddPostController', function ($rootScope, $scope, postData) {
        $rootScope.getActiveState();
        if ($rootScope.currentUser && $rootScope.currentUser.role === 'Administrator') {
            $scope.isAdmin = true;
            $scope.addPost = function (post) {
                postData.addPost(post);
            };

            $scope.cancel = function () {
                $rootScope.reloadTo('/');
            };
        }
        else {
            $scope.isAdmin = false;
            $rootScope.reloadTo('/');
        }
    });
}());