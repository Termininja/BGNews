(function () {
    'use strict';

    newsApp.controller('PostsController', function ($scope, $routeParams, $rootScope, postData, CATEGORIES, MAX_PAGINATION_PAGES, ITEMS_PER_PAGE) {
        $scope.itemsPerPage = ITEMS_PER_PAGE;
        $scope.pages = MAX_PAGINATION_PAGES;
        $scope.isUser = false;
        $scope.isPost = true;

        $scope.getPage = function (currentPage) {
            $scope.currentPage = currentPage ? currentPage : $scope.currentPage;
            var skip = (currentPage - 1) * ITEMS_PER_PAGE;
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

        $scope.getPage(1);
    });
}());