(function () {
    'use strict';

    newsApp.controller('TagsController', function ($scope, $routeParams, $rootScope, postData, MAX_PAGINATION_PAGES, ITEMS_PER_PAGE) {
        $rootScope.title = 'Tag ' + $routeParams.tag;
        $scope.itemsPerPage = ITEMS_PER_PAGE;
        $scope.pages = MAX_PAGINATION_PAGES;
        $scope.isPost = true;
        $scope.isUser = false;

        $scope.getPage = function (currentPage) {
            $rootScope.getActiveState();
            $scope.currentPage = currentPage ? currentPage : $scope.currentPage;
            var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
            postData.getByTag(skip, ITEMS_PER_PAGE, $routeParams.tag).then(function (data) {
                $scope.collection = data.posts;
                $scope.totalItems = data.count;
            });

            $scope.isHome = true;
        };

        $scope.getPage(1);
    });
}());