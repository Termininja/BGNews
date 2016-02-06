'use strict';

newsApp.controller('SearchController', function ($scope, $routeParams, postData, ITEMS_PER_PAGE) {
    $scope.itemsPerPage = ITEMS_PER_PAGE;
    $scope.isPost = true;
    $scope.isUser = false;
    $scope.currentPage = 1;
    $scope.pages = 5;

    $scope.getPage = function () {
        var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
        postData.search(skip, ITEMS_PER_PAGE, $routeParams.word).then(function (data) {
            $scope.collection = data.posts;
            $scope.totalItems = data.count;
        });

        $scope.isHome = true;
    };

    $scope.getPage();
});
