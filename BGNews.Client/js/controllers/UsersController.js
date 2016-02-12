(function () {
    'use strict';

    newsApp.controller('UsersController', function ($scope, $rootScope, userData, MAX_PAGINATION_PAGES, ITEMS_PER_PAGE) {
        $scope.itemsPerPage = ITEMS_PER_PAGE;
        $scope.pages = MAX_PAGINATION_PAGES;
        $scope.isPost = false;
        $scope.isUser = true;

        $scope.getPage = function (currentPage) {
            $rootScope.getActiveState();
            $scope.currentPage = currentPage ? currentPage : $scope.currentPage;
            var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
            userData.getUsers(skip, ITEMS_PER_PAGE).then(function (data) {
                $scope.collection = data.users;
                $scope.totalItems = data.count;
            });

            $scope.isHome = true;
        };

        $scope.getPage(1);
    });
}());