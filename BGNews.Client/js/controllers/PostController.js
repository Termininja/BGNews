(function () {
    'use strict';

    newsApp.controller('PostController', function ($scope, $routeParams, $rootScope, postData) {
        $scope.replyToPost = true;
        $scope.tabPostsShow = [true, false, false];

        $scope.getAllComments = function () {
            postData.getComments($routeParams.postId).then(function (commentsData) {
                $scope.comments = commentsData;
            });
        };

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
        };

        $scope.addComment = function (newComment) {
            postData.addComment(newComment, $routeParams.postId, $scope.replyToCommentId).then(function (done) {
                if (done) {
                    $scope.getPost();
                    $scope.getAllComments();
                    $scope.replyToPost = true;
                    $scope.replyToCommentId = undefined;
                    $scope.newComment = '';
                }
            });
        };

        $scope.deleteComment = function (commentId) {
            postData.deleteComment(commentId).then(function (done) {
                if (done) {
                    $scope.getAllComments();
                }
            });
        };

        $scope.getTabPosts = function () {
            postData.getRecentPosts(5).then(function (recentPosts) {
                $scope.recentPosts = recentPosts;
                postData.getPopularPosts(4).then(function (popularPosts) {
                    postData.getRandomPosts(4).then(function (randomPosts) {
                        $scope.tabPosts = [recentPosts.slice(0, -1), popularPosts, randomPosts];
                    });
                });
            });
        };

        $scope.toggleTab = function (tab) {
            $scope.tabPostsShow = new Array(3);
            $scope.tabPostsShow[tab] = true;
        };

        $scope.getPost = function () {
            postData.getPost($routeParams.postId).then(function (data) {
                $rootScope.title = data.title;
                $scope.post = data;
                $scope.getAllComments();

                postData.getRecentComments(5).then(function (recentComments) {
                    $scope.recentComments = recentComments;
                });

                postData.getRelatedPosts($routeParams.postId, $scope.post.tags, 5).then(function (relatedPosts) {
                    $scope.relatedPosts = relatedPosts;
                });
            });
        };

        $scope.getPost();
        $scope.getTabPosts();
    });
}());