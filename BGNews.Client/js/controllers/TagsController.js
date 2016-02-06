'use strict';

newsApp.controller('TagsController', function ($scope, $routeParams, $rootScope, postData, ITEMS_PER_PAGE) {
    $rootScope.title = 'Tag ' + $routeParams.tag;
    $scope.itemsPerPage = ITEMS_PER_PAGE;
    $scope.isPost = true;
    $scope.isUser = false;
    $scope.currentPage = 1;
    $scope.pages = 5;

    $scope.getPage = function () {
        var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
        postData.getByTag(skip, ITEMS_PER_PAGE, $routeParams.tag).then(function (data) {
            $scope.collection = data.posts;
            $scope.totalItems = data.count;
        });

        $scope.isHome = true;
    };

    $scope.getPage();
});
