(function () {
    'use strict';

    newsApp.controller('SearchController', function ($scope, $rootScope, $routeParams, postData, MAX_PAGINATION_PAGES, ITEMS_PER_PAGE) {
        $scope.itemsPerPage = ITEMS_PER_PAGE;
        $scope.pages = MAX_PAGINATION_PAGES;
        $scope.isPost = true;
        $scope.isUser = false;

        $scope.getPage = function (currentPage) {
            $rootScope.getActiveState();
            $scope.currentPage = currentPage ? currentPage : $scope.currentPage;
            var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
            postData.search(skip, ITEMS_PER_PAGE, $routeParams.word).then(function (data) {
                $scope.collection = data.posts;
                $scope.totalItems = data.count;
            });

            $scope.isHome = true;
        };

        $scope.getPage(1);
    });
}());