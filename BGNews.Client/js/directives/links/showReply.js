﻿(function () {
    'use strict';

    newsApp.directive('showReply', function (LEVEL_OF_NESTED_COMMENTS) {
        return {
            restrict: 'A',
            link: function (scope) {
                scope.showReplyLink = ++scope.commentLevel < LEVEL_OF_NESTED_COMMENTS;
            }
        };
    });
}());