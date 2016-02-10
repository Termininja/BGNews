(function () {
    'use strict';

    newsApp.controller('PageController', function ($q, $location, $window, $scope, $rootScope, postData, userData, DEFAULT_PROFILE_IMAGE) {
        $rootScope.navigateTo = function (path) {
            $location.path(path);
            $rootScope.$apply();
        };

        $rootScope.reloadTo = function (path) {
            $window.location.assign(path);
        };

        $rootScope.login = function (user) {
            Parse.User.logIn(user.username, user.password, {
                success: function () {
                    $rootScope.statusUpdate();
                    $rootScope.reloadTo('/');
                },
                error: function (user, error) {
                    console.log('Error: ' + error.code + ' ' + error.message);
                }
            });
        };

        $rootScope.signup = function (user) {
            var USER_ROLE_ID = '2IPQes1NcD';
            var newUser = new Parse.User();
            newUser.set('username', user.username);
            newUser.set('password', user.password);
            newUser.set('email', user.email);
            newUser.set('colorScheme', 'Black');
            newUser.set('role', { __type: 'Pointer', className: '_Role', objectId: USER_ROLE_ID });
            newUser.signUp(null, {
                success: function () {
                    $rootScope.reloadTo('/profile');
                },
                error: function (user, error) {
                    console.log('Error: ' + error.code + ' ' + error.message);
                }
            });
        };

        $rootScope.logout = function () {
            Parse.User.logOut();
            $rootScope.statusUpdate();
            $rootScope.reloadTo('/');
        };

        $rootScope.profileImageUpdate = function () {
            if ($rootScope.currentUser.showImage && $rootScope.currentUser.showImage != $rootScope.currentUser.image) {
                $rootScope.currentUser.showImage = $rootScope.currentUser.image;
            }
            else if ($rootScope.currentUser.image) {
                $rootScope.currentUser.showImage = $rootScope.currentUser.image.url();
            }
            else {
                $rootScope.currentUser.showImage = DEFAULT_PROFILE_IMAGE;
            }
        };

        $rootScope.statusUpdate = function () {
            $rootScope.currentUser = Parse.User.current();
            if ($rootScope.currentUser) {
                userData.getUserRole().then(function (role) {
                    $rootScope.currentUser.role = role;
                    $rootScope.currentUser.username = $rootScope.currentUser.get('username');
                    $rootScope.currentUser.email = $rootScope.currentUser.get('email');
                    $rootScope.currentUser.firstName = $rootScope.currentUser.get('firstName');
                    $rootScope.currentUser.lastName = $rootScope.currentUser.get('lastName');
                    $rootScope.currentUser.website = $rootScope.currentUser.get('website');
                    $rootScope.currentUser.gender = $rootScope.currentUser.get('gender');
                    $rootScope.currentUser.aboutMe = $rootScope.currentUser.get('aboutMe');
                    $rootScope.currentUser.colorScheme = $rootScope.currentUser.get('colorScheme');
                    $rootScope.currentUser.image = $rootScope.currentUser.get('image');

                    $rootScope.profileImageUpdate();
                    $rootScope.colorSchemeUpdate();
                });
            }
            else {
                $rootScope.colorSchemeUpdate();
            }
        };

        $rootScope.colorSchemeUpdate = function () {

            $rootScope.csLeftArrow = 'cs-left-arrow-white';
            $rootScope.csRightArrow = 'cs-right-arrow-white';

            switch ($rootScope.currentUser ? $rootScope.currentUser.colorScheme : undefined) {
                default:    // 'Black'
                    $rootScope.csHtml = 'cs-html-black';
                    break;
                case 'Brown':
                    $rootScope.csHtml = 'cs-html-brown';
                    break;
                case 'Gray':
                    $rootScope.csHtml = 'cs-html-gray';
                    $rootScope.csLeftArrow = 'cs-left-arrow-black';
                    $rootScope.csRightArrow = 'cs-right-arrow-black';
                    break;
                case 'Red':
                    $rootScope.csHtml = 'cs-html-red';
                    break;
                case 'Turquoise':
                    $rootScope.csHtml = 'cs-html-turquoise';
                    break;
            }
        };

        $rootScope.getPostsInFooter = function () {
            postData.getRecentPosts(5).then(function (recentPosts) {
                $rootScope.recentPosts = recentPosts;
            });

            postData.getRecentComments(5).then(function (recentComments) {
                $rootScope.recentComments = recentComments;
            });

            postData.getPopularPosts(5).then(function (popularPosts) {
                $rootScope.popularPosts = popularPosts;
            });
        };

        $rootScope.statusUpdate();
        $rootScope.getPostsInFooter();
    });
}());