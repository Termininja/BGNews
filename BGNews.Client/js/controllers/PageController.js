'use strict';

newsApp.controller('PageController', function ($q, $window, $scope, $rootScope, DEFAULT_IMAGE) {
    $rootScope.navigateTo = function (path) {
        $window.location.assign(path);
    };

    $rootScope.login = function (user) {
        Parse.User.logIn(user.username, user.password, {
            success: function () {
                $rootScope.statusUpdate();
                $rootScope.navigateTo('/');
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
                $rootScope.navigateTo('/profile');
            },
            error: function (user, error) {
                console.log('Error: ' + error.code + ' ' + error.message);
            }
        });
    };

    $rootScope.logout = function () {
        Parse.User.logOut();
        $rootScope.statusUpdate();
        $rootScope.navigateTo('/');
    };

    $rootScope.search = function (word) {
        $rootScope.navigateTo('/search/' + word);
    }

    $rootScope.profileImageUpdate = function () {
        if ($rootScope.currentUser.showImage && $rootScope.currentUser.showImage != $rootScope.currentUser.image) {
            $rootScope.currentUser.showImage = $rootScope.currentUser.image;
        }
        else if ($rootScope.currentUser.image) {
            $rootScope.currentUser.showImage = $rootScope.currentUser.image.url();
        }
        else {
            $rootScope.currentUser.showImage = DEFAULT_IMAGE;
        }
    }

    $rootScope.statusUpdate = function () {
        $rootScope.currentUser = Parse.User.current();
        if ($rootScope.currentUser) {
            var defer = $q.defer();
            $rootScope.currentUser.get("role").fetch({
                success: function (role) {
                    defer.resolve(role.get("name"));
                }
            });

            defer.promise.then(function (role) {
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
            });
        }
    }

    $rootScope.statusUpdate();
});