(function () {
    'use strict';

    newsApp.controller('PostsController', function ($scope, $routeParams, $rootScope, postData, CATEGORIES, ITEMS_PER_PAGE) {
        $scope.itemsPerPage = ITEMS_PER_PAGE;
        //$log.error(data);
        $scope.isUser = false;
        $scope.isPost = true;
        $scope.currentPage = 1;
        $scope.pages = 5;

        $scope.getPage = function () {
            var skip = ($scope.currentPage - 1) * ITEMS_PER_PAGE;
            var category = $routeParams.categoryName;

            if (category) {
                category = category.replace(/_/g, ' ');
                $scope.isHome = true;
            }
            else {
                $scope.isHome = false;
            }

            var getRealCategoryName = function () {
                var categoryName;
                if (category) {
                    $.each(CATEGORIES, function (group) {
                        if (group.toLowerCase() === category.toLowerCase()) {
                            categoryName = group;
                            return false;
                        }
                        else {
                            $.each(CATEGORIES[group], function (index) {
                                var subCategory = CATEGORIES[group][index];
                                if (subCategory.toLowerCase() === category.toLowerCase()) {
                                    categoryName = subCategory;
                                    return false;
                                }
                            });
                        }
                    });
                }

                return categoryName;
            };

            category = getRealCategoryName();
            postData.getCategory(skip, ITEMS_PER_PAGE, category).then(function (data) {
                $scope.collection = data.posts;
                $scope.totalItems = data.count;
                if (category) $rootScope.title = category;
            });
        };

        $scope.getPage();
    });
}());