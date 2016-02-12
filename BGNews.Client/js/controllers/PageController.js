(function () {
    'use strict';

    newsApp.controller('PageController', function ($q, $location, $window, $scope, $rootScope, postData, userData, CATEGORIES, DEFAULT_PROFILE_IMAGE) {
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

        $rootScope.getActiveState = function () {
            $('.navbar-nav').children().removeClass('active');
            switch ($location.path()) {
                case '/':
                    $('.navbar-nav li:first()').addClass('active');
                    break;
                case '/category/business':
                case '/category/finance':
                case '/category/energy':
                case '/category/industry':
                case '/category/properties':
                case '/category/tourism':
                    $('.navbar-nav li:nth-child(2)').addClass('active');
                    break;
                case '/category/politics':
                case '/category/diplomacy':
                case '/category/defense':
                case '/category/bulgaria_in_eu':
                case '/category/domestic':
                    $('.navbar-nav li:nth-child(3)').addClass('active');
                    break;
                case '/category/world':
                case '/category/eu':
                case '/category/southeast_europe':
                case '/category/russia':
                case '/category/ukraine':
                case '/category/international_business':
                    $('.navbar-nav li:nth-child(4)').addClass('active');
                    break;
                case '/category/society':
                case '/category/environment':
                case '/category/education':
                case '/category/culture':
                case '/category/health':
                case '/category/incidents':
                    $('.navbar-nav li:nth-child(5)').addClass('active');
                    break;
                case '/category/sports':
                    $('.navbar-nav li:nth-last-child(2)').addClass('active');
                    break;
                case '/category/crime':
                    $('.navbar-nav li:last()').addClass('active');
                    break;
                default: break;
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
                    $rootScope.csFooter = 'cs-footer-black';
                    $rootScope.csSearch = 'cs-search-black';
                    $rootScope.csDropdown = 'cs-dropdown-black';
                    break;
                case 'Brown':
                    $rootScope.csHtml = 'cs-html-brown';
                    $rootScope.csFooter = 'cs-footer-brown';
                    $rootScope.csSearch = 'cs-search-brown';
                    $rootScope.csDropdown = 'cs-dropdown-brown';
                    break;
                case 'Gray':
                    $rootScope.csHtml = 'cs-html-gray';
                    $rootScope.csFooter = 'cs-footer-gray';
                    $rootScope.csSearch = 'cs-search-gray';
                    $rootScope.csDropdown = 'cs-dropdown-gray';

                    $rootScope.csLeftArrow = 'cs-left-arrow-black';
                    $rootScope.csRightArrow = 'cs-right-arrow-black';
                    break;
                case 'Red':
                    $rootScope.csHtml = 'cs-html-red';
                    $rootScope.csFooter = 'cs-footer-red';
                    $rootScope.csSearch = 'cs-search-red';
                    $rootScope.csDropdown = 'cs-dropdown-red';
                    break;
                case 'Turquoise':
                    $rootScope.csHtml = 'cs-html-turquoise';
                    $rootScope.csFooter = 'cs-footer-turquoise';
                    $rootScope.csSearch = 'cs-search-turquoise';
                    $rootScope.csDropdown = 'cs-dropdown-turquoise';
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

        $rootScope.categoryToLink = function (category) {
            return category.toLowerCase().replace(/ /g, '_');
        };

        $rootScope.categories = CATEGORIES;
        $rootScope.statusUpdate();
        $rootScope.getActiveState();
        $rootScope.getPostsInFooter();

        $('.navbar-nav > li.dropdown').hover(function () {
            $('ul.dropdown-menu', this).stop(true, true).slideDown('fast');
            $(this).addClass('open');
        }, function () {
            $('ul.dropdown-menu', this).stop(true, true).slideUp('fast');
            $(this).removeClass('open');
        });
    });
}());