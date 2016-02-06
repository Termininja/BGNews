'use strict';

newsApp.directive('userThumbnail', function () {
    return {
        restrict: 'A',
        templateUrl: '/templates/directives/user-thumbnail.html',
        replace: false
    }
});