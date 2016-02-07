var newsApp = angular.module('newsApp', ['ngRoute', 'ui.bootstrap']);

(function () {
    'use strict';

    newsApp
       .config(function ($routeProvider, $locationProvider) {
           $locationProvider.html5Mode(true);
           $routeProvider
               .when('/', {
                   title: 'Home',
                   templateUrl: 'templates/collection.html',
                   controller: 'PostsController'
               })
               .when('/category/:categoryName', {
                   templateUrl: 'templates/collection.html',
                   controller: 'PostsController',
               })
               .when('/search/:word', {
                   title: 'Search',
                   templateUrl: 'templates/collection.html',
                   controller: 'SearchController',
               })
               .when('/tags/:tag', {
                   templateUrl: 'templates/collection.html',
                   controller: 'TagsController',
               })
               .when('/post/:postId', {
                   templateUrl: 'templates/post.html',
                   controller: 'PostController'
               })
               .when('/login', {
                   title: 'Login',
                   templateUrl: 'templates/login.html',
               })
               .when('/signup', {
                   title: 'Signup',
                   templateUrl: 'templates/signup.html',
               })
               .when('/users', {
                   title: 'Users',
                   templateUrl: 'templates/collection.html',
                   controller: 'UsersController',
               })
               .when('/profile', {
                   title: 'Profile',
                   templateUrl: 'templates/profile.html',
                   controller: 'ProfileController',
               })
               .when('/users/:username', {
                   templateUrl: 'templates/user.html',
                   controller: 'UserController',
               })
               .when('/new-post', {
                   title: 'New Post',
                   templateUrl: 'templates/add-post.html',
                   controller: 'AddPostController'
               })
               .when('/help', {
                   title: 'Help',
                   templateUrl: 'templates/help.html'
               })
               .otherwise({ redirectTo: '/' });
       })
       .constant('ITEMS_PER_PAGE', 6)
       .constant('LEVEL_OF_NESTED_COMMENTS', 3)
       .constant('DEFAULT_IMAGE', 'http://s15.postimg.org/j9x15yxxj/user.jpg')
       .constant('SCHEME_COLORS', ['Black', 'Brown', 'Gray', 'Red', 'Turquoise'])
       .constant('CATEGORIES', {
           Business: ["Finance", "Energy", "Industry", "Properties", "Tourism"],
           Politics: ["Diplomacy", "Defense", "Bulgaria in EU", "Domestic"],
           World: ["EU", "Southeast Europe", "Russia", "Ukraine", "International Business"],
           Society: ["Environment", "Education", "Culture", "Health", "Incidents"],
           Sports: ['Sports'],
           Crime: ['Crime']
       })
       .run(['$rootScope', function ($rootScope) {
           Parse.initialize("U3XywIHqzfU4KD8FEV57PRmMZPpmuDOwflN6itSy", "PA0TnuPtd3ktVSscE4BECVlYr7y7TPNRfxGRe5eb");
           $rootScope.Post = Parse.Object.extend('Post');
           $rootScope.Comment = Parse.Object.extend('Comment');
           $rootScope.Category = Parse.Object.extend('Category');
           $rootScope.Tag = Parse.Object.extend('Tag');

           $rootScope.$on('$routeChangeSuccess', function (event, current) {
               $rootScope.title = current.title;
           });
       }]);
}());