(function () {
    'use strict';

    newsApp.controller('UsersController', function ($scope, userData, ITEMS_PER_PAGE) {
        $scope.itemsPerPage = ITEMS_PER_PAGE;
        $scope.isPost = false;
        $scope.isUser = true;
        $scope.currentPage = 1;
        $scope.pages = 5;

        $scope.getPage = function () {
            var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
            userData.getUsers(skip, ITEMS_PER_PAGE).then(function (data) {
                $scope.collection = data.users;
                $scope.totalItems = data.count;
            });

            $scope.isHome = true;
        };

        $scope.getPage();
    });
}());