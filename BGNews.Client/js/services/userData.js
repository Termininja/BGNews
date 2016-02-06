'use strict'

newsApp.factory('userData', function ($q, $log, $rootScope, DEFAULT_IMAGE) {
    return {
        getUsers: function (skip, limit) {
            var defer = $q.defer();
            var countQuery = new Parse.Query(Parse.User);
            countQuery.count({
                success: function (count) {
                    var usersQuery = new Parse.Query(Parse.User).skip(skip).limit(limit).descending('createdAt');
                    usersQuery.include('role')
                    usersQuery.find({
                        success: function (data) {
                            var users = [];
                            data.forEach(function (user) {
                                var avatar = user.get('image');
                                users.push({
                                    username: user.get('username'),
                                    createdAt: user.createdAt,
                                    image: avatar ? avatar.url() : DEFAULT_IMAGE,
                                    //email: user.get('email'),
                                    //firstName: user.get('firstName'),
                                    //lastName: user.get('lastName'),
                                    //website: user.get('website'),
                                    gender: user.get('gender'),
                                    aboutMe: user.get('aboutMe'),
                                    //colorScheme: user.get('colorScheme'),
                                    role: user.get('role').get('name')
                                });
                            });

                            defer.resolve({
                                count: count,
                                users: users
                            });
                        },
                        error: function (error) {
                            defer.reject(error);
                        }
                    });
                },
                error: function (error) {
                    defer.reject(error);
                }
            });

            return defer.promise;
        },

        getUser: function (username) {
            var defer = $q.defer();
            var userQuery = new Parse.Query(Parse.User);
            userQuery.equalTo('username', username);
            userQuery.include('role');
            userQuery.first({
                success: function (data) {
                    var avatar = data.get('image');
                    defer.resolve({
                        username: data.get('username'),
                        createdAt: data.createdAt,
                        image: avatar ? avatar.url() : DEFAULT_IMAGE,
                        email: data.get('email'),
                        firstName: data.get('firstName'),
                        lastName: data.get('lastName'),
                        website: data.get('website'),
                        gender: data.get('gender'),
                        aboutMe: data.get('aboutMe'),
                        colorScheme: data.get('colorScheme'),
                        role: data.get('role').get('name')
                    });
                },
                error: function (error) {
                    defer.reject(error);
                }
            });

            return defer.promise;
        },

        updateProfile: function (user) {
            user.set('firstName', user.firstName);
            user.set('lastName', user.lastName);
            user.set('website', user.website);
            user.set('gender', user.gender);
            user.set('aboutMe', user.aboutMe);
            user.set('colorScheme', user.colorScheme);

            if (user.get('image') != user.image) {
                var file = new Parse.File(user.id + '.jpg', { base64: user.image });
                file.save().then(function (image) {
                    user.set('image', image);
                    user.save({
                        success: function () {
                            $rootScope.statusUpdate();
                            $rootScope.navigateTo('/profile');
                        },
                        error: function (user, error) {
                            console.info(error);
                        }
                    });
                });
            }
            else {
                user.save({
                    success: function () {
                        $rootScope.statusUpdate();
                        $rootScope.navigateTo('/profile');
                    },
                    error: function (error) {
                        console.info(error);
                    }
                });
            }
        },

        deleteProfile: function () {
            if (confirm("Your profile will be permanently deleted and cannot be recovered. Are you sure?")) {
                Parse.User.current().destroy({
                    success: function () {
                        console.info('deleted');
                        $rootScope.logout();
                    },
                    error: function (error) {
                        console.info(error);
                    }
                });
            }
            else {
                console.log('not deleted');
            }
        }
    };
});