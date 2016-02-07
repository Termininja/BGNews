(function () {
    'use strict';

    newsApp.directive('addComment', function () {
        return {
            restrict: 'A',
            templateUrl: '/templates/directives/add-comment.html',
            replace: false
        };
    });
}());