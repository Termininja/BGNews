﻿'use strict';

newsApp.controller('PostController', function ($scope, $routeParams, $rootScope, postData) {
    var LEVEL_OF_NESTED_COMMENTS = 3;
    $scope.levelOfNestedComments = LEVEL_OF_NESTED_COMMENTS;
    $scope.replyToPost = true;

    $scope.getAllComments = function () {
        postData.getComments($routeParams.postId).then(function (commentsData) {
            $scope.comments = commentsData;
        });
    }

    $scope.replyTo = function (commentId) {
        $scope.replyToCommentId = commentId;
        $scope.replyToPost = false;

        function resetAllReplies(root) {
            $.map(root.comments, function (comment) {
                comment.showReply = comment.id === commentId;
                resetAllReplies(comment);
            });
        }

        resetAllReplies($scope);
    }

    $scope.addComment = function (newComment) {
        postData.addComment(newComment, $routeParams.postId, $scope.replyToCommentId).then(function (done) {
            if (done) {
                $scope.getAllComments();
                $scope.replyToPost = true;
                $scope.newComment = '';
            }
        });
    }

    postData.getPost($routeParams.postId).then(function (data) {
        $rootScope.title = data.title;
        $scope.post = data;
        $scope.getAllComments();
    });
});