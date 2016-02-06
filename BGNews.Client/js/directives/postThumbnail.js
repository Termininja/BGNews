'use strict';

newsApp.directive('postThumbnail', function () {
    return {
        restrict: 'A',
        templateUrl: '/templates/directives/post-thumbnail.html',
        replace: false
    }
});