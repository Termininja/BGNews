(function () {
    'use strict';

    newsApp.factory('postData', function ($rootScope, $q, $sce, CATEGORIES, DEFAULT_IMAGE) {
        return {
            getCategory: function (skip, limit, category) {
                var subCategories;
                $.each(CATEGORIES, function (group) {
                    if (category === group && CATEGORIES[group].length > 1) {
                        category = group;
                        subCategories = CATEGORIES[group];
                        return false;
                    }
                });

                if (!subCategories && category) {
                    subCategories = [category];
                }

                var defer = $q.defer();
                function deferCategory(pointers) {
                    var countQuery = new Parse.Query($rootScope.Post);
                    if (subCategories) countQuery.containedIn('category', pointers);
                    countQuery.count({
                        success: function (count) {
                            var postsQuery = new Parse.Query($rootScope.Post).skip(skip).limit(limit).descending('createdAt');
                            if (subCategories) postsQuery.containedIn('category', pointers);
                            postsQuery.include('user', 'category');
                            postsQuery.find({
                                success: function (data) {
                                    var posts = [];
                                    data.forEach(function (post) {
                                        posts.push({
                                            id: post.id,
                                            createdAt: post.createdAt,
                                            user: post.get('user').get('username'),
                                            title: post.get('title'),
                                            image: post.get('image'),
                                            category: post.get('category').get('name'),
                                            content: $sce.trustAsHtml(post.get('content'))
                                        });
                                    });

                                    defer.resolve({
                                        count: count,
                                        posts: posts
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
                }

                if (subCategories) {
                    var categoryCountQuery = new Parse.Query($rootScope.Category);
                    categoryCountQuery.containedIn('name', subCategories);
                    categoryCountQuery.find({
                        success: function (categoryCount) {
                            var pointers = [];
                            categoryCount.forEach(function (pointer) {
                                pointers.push({ __type: 'Pointer', className: 'Category', objectId: pointer.id });
                            });

                            deferCategory(pointers);
                        }
                    });
                }
                else {
                    deferCategory(null);
                }

                return defer.promise;
            },

            getPost: function (id) {
                var defer = $q.defer();
                var postQuery = new Parse.Query($rootScope.Post);
                postQuery.include('user', 'category', 'tags');
                postQuery.get(id, {
                    success: function (data) {
                        var image = data.get('image');
                        var bigImage = image.replace('_big_', '_verybig_');
                        var category = data.get('category').get('name');

                        var bigImageExists = function (url, callback) {
                            var img = new Image();
                            img.onload = function () { callback(true); };
                            img.onerror = function () { callback(false); };
                            img.src = url;
                        };

                        bigImageExists(bigImage, function (exists) {
                            defer.resolve({
                                createdAt: data.createdAt,
                                user: data.get('user').get('username'),
                                title: data.get('title'),
                                image: exists ? bigImage : image,
                                category: category,
                                categoryLink: category.toLowerCase().replace(/ /g, '_'),
                                content: $sce.trustAsHtml(data.get('content')),
                                tags: $.map(data.get('tags'), function (tag) {
                                    return tag.get('name');
                                })
                            });
                        });
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            getByTag: function (skip, limit, tag) {
                var defer = $q.defer();
                var tagQuery = new Parse.Query($rootScope.Tag);
                tagQuery.equalTo("name", tag);
                tagQuery.first({
                    success: function (tagData) {
                        var countQuery = new Parse.Query($rootScope.Post);
                        countQuery.equalTo("tags", { __type: 'Pointer', className: 'Tag', objectId: tagData.id });
                        countQuery.count({
                            success: function (count) {
                                var postsQuery = new Parse.Query($rootScope.Post).skip(skip).limit(limit).descending('createdAt');
                                postsQuery.equalTo("tags", { __type: 'Pointer', className: 'Tag', objectId: tagData.id });
                                postsQuery.include('user', 'category');
                                postsQuery.find({
                                    success: function (data) {
                                        var posts = [];
                                        data.forEach(function (post) {
                                            posts.push({
                                                id: post.id,
                                                createdAt: post.createdAt,
                                                user: post.get('user').get('username'),
                                                title: post.get('title'),
                                                image: post.get('image'),
                                                category: post.get('category').get('name'),
                                                content: $sce.trustAsHtml(post.get('content'))
                                            });
                                        });

                                        defer.resolve({
                                            count: count,
                                            posts: posts
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
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            getComments: function (postId) {
                var defer = $q.defer();
                var postQuery = new Parse.Query($rootScope.Comment);
                postQuery.include('user', 'post', 'comment');
                postQuery.equalTo('post', { __type: 'Pointer', className: 'Post', objectId: postId });
                postQuery.find({
                    success: function (result) {
                        var comments = [];
                        result.forEach(function (data) {
                            var avatar = data.get('user').get('image');
                            var comment = data.get('comment');
                            comments.push({
                                id: data.id,
                                createdAt: data.createdAt,
                                content: data.get('content'),
                                username: data.get('user').get('username'),
                                commentId: comment ? comment.id : undefined,
                                avatar: avatar ? avatar.url() : DEFAULT_IMAGE
                            });
                        });

                        function extractComments(id) {
                            var subComments = [];
                            comments.forEach(function (comment) {
                                if (comment.commentId === id) {
                                    comment.comments = extractComments(comment.id);
                                    subComments.push(comment);
                                }
                            });

                            return subComments;
                        }

                        var results = [];
                        comments.forEach(function (comment) {
                            if (!comment.commentId) {
                                comment.comments = extractComments(comment.id);
                                results.push(comment);
                            }
                        });

                        defer.resolve(results);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            addPost: function (post) {
                var categoryQuery = new Parse.Query($rootScope.Category);
                categoryQuery.equalTo('name', post.category);
                categoryQuery.first({
                    success: function (category) {
                        if (category.get('name') === post.category) {
                            var newPost = new $rootScope.Post();
                            newPost.set('user', Parse.User.current());
                            newPost.set('category', category);
                            newPost.set('title', post.title);
                            newPost.set('image', post.image);
                            newPost.set('content', post.content);
                            newPost.set('tags', []);                //post.tags.split(/[, ]+/)   => tags are pointers
                            newPost.save({
                                success: function () {
                                    $rootScope.navigateTo('/');
                                }
                            });
                        }
                    }
                });
            },

            addComment: function (comment, postId, commentId) {
                var defer = $q.defer();
                var newComment = new $rootScope.Comment();
                newComment.set('user', Parse.User.current());
                newComment.set('content', comment);
                newComment.set('post', new $rootScope.Post({ objectId: postId }));

                if (commentId) {
                    newComment.set('comment', new $rootScope.Comment({ objectId: commentId }));
                }

                newComment.save({
                    success: function () {
                        defer.resolve(true);
                    },
                    error: function (data, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            deleteComment: function (commentId) {
                var defer = $q.defer();
                var postQuery = new Parse.Query($rootScope.Comment);
                postQuery.get(commentId, {
                    success: function (data) {
                        data.destroy({
                            success: function () {
                                defer.resolve(true);
                                console.info('comment deleted');
                            },
                            error: function (error) {
                                defer.reject(error);
                            }
                        });
                    },
                    error: function (data, error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            search: function (skip, limit, word) {
                var defer = $q.defer();
                var countQuery = new Parse.Query($rootScope.Post).limit(1000);
                countQuery.matches("content", '.*' + word + '.*');
                countQuery.count({
                    success: function (count) {
                        var postsQuery = new Parse.Query($rootScope.Post).skip(skip).limit(limit).descending('createdAt');
                        postsQuery.matches("content", '.*' + word + '.*');
                        postsQuery.include('user', 'category');
                        postsQuery.find({
                            success: function (data) {
                                var posts = [];
                                data.forEach(function (post) {
                                    posts.push({
                                        id: post.id,
                                        createdAt: post.createdAt,
                                        user: post.get('user').get('username'),
                                        title: post.get('title'),
                                        image: post.get('image'),
                                        category: post.get('category').get('name'),
                                        content: $sce.trustAsHtml(post.get('content'))
                                    });
                                });

                                defer.resolve({
                                    count: count,
                                    posts: posts
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


            getRecentComments: function (limit) {
                var defer = $q.defer();
                var query = new Parse.Query($rootScope.Comment).limit(limit).descending('createdAt');
                query.include('user', 'post');
                query.find({
                    success: function (data) {
                        var comments = [];
                        data.forEach(function (comment) {
                            comments.push({
                                id: comment.id,
                                createdAt: comment.createdAt,
                                user: comment.get('user').get('username'),
                                postId: comment.get('post').id,
                                content: comment.get('content'),
                            });
                        });

                        defer.resolve(comments);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            getRecentPosts: function (limit) {
                var defer = $q.defer();
                var query = new Parse.Query($rootScope.Post).limit(limit).descending('createdAt');
                query.include('user', 'post');
                query.find({
                    success: function (data) {
                        var posts = [];
                        data.forEach(function (post) {
                            var avatar = post.get('user').get('image');
                            posts.push({
                                id: post.id,
                                createdAt: post.createdAt,
                                title: post.get('title'),
                                user: post.get('user').get('username'),
                                avatar: avatar ? avatar.url() : DEFAULT_IMAGE
                            });
                        });

                        defer.resolve(posts);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            getPopularPosts: function (limit) {
                var defer = $q.defer();
                var query = new Parse.Query($rootScope.Comment).limit(1000);
                query.include('user', 'post');
                query.find({
                    success: function (data) {
                        var grouped = {};
                        $.map(data, function (comment) {
                            var postId = comment.get('post').id;
                            if (postId in grouped) grouped[postId]++;
                            else grouped[postId] = 1;
                        });

                        var sorted = [];

                        $.each(grouped, function (id) {
                            sorted.push({
                                postId: id,
                                count: grouped[id]
                            });
                        });
                        console.warn(sorted);
                        sorted.sort(function (a, b) {
                            return b.count - a.count;
                        });

                        var limited = sorted.slice(0, limit);

                        var queries = [];
                        limited.forEach(function (obj) {
                            var query = new Parse.Query($rootScope.Post).equalTo('objectId', obj.postId);
                            queries.push(query);
                        });

                        if (queries.length > 0) {
                            var postQuery = Parse.Query.or.apply(this, queries);
                            postQuery.include('user', 'post');
                            postQuery.find({
                                success: function (data) {
                                    var posts = [];
                                    limited.forEach(function (obj) {
                                        data.forEach(function (post) {
                                            if (obj.postId === post.id) {
                                                var avatar = post.get('user').get('image');
                                                posts.push({
                                                    id: post.id,
                                                    createdAt: post.createdAt,
                                                    title: post.get('title'),
                                                    user: post.get('user').get('username'),
                                                    avatar: avatar ? avatar.url() : DEFAULT_IMAGE
                                                });

                                                return;
                                            }
                                        });
                                    });

                                    defer.resolve(posts);
                                },
                                error: function (error) {
                                    defer.reject(error);
                                }
                            });
                        }
                        else {
                            defer.resolve([]);
                        }
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });

                return defer.promise;
            },

            getRandomPosts: function (limit) {
                var defer = $q.defer();
                function getAll(count) {
                    new Parse.Query($rootScope.Post).limit(1000).skip(count).count().then(function (result) {
                        if (result != 1000) {
                            var totalPost = count + result;
                            var query = new Parse.Query($rootScope.Post);
                            query.skip(Math.floor((Math.random() * totalPost) + 1)).limit(limit);
                            query.include('user', 'post');
                            query.find({
                                success: function (data) {
                                    var posts = [];
                                    data.forEach(function (post) {
                                        var avatar = post.get('user').get('image');
                                        posts.push({
                                            id: post.id,
                                            createdAt: post.createdAt,
                                            title: post.get('title'),
                                            user: post.get('user').get('username'),
                                            avatar: avatar ? avatar.url() : DEFAULT_IMAGE
                                        });
                                    });

                                    defer.resolve(posts);
                                },
                                error: function (error) {
                                    defer.reject(error);
                                }
                            });

                            return;
                        }
                        getAll(count + result);
                    });
                }

                getAll(0);

                return defer.promise;
            },

            getRelatedPosts: function (tags, limit) {
                var defer = $q.defer();
                var queries = [];
                tags.forEach(function (tag) {
                    var query = new Parse.Query($rootScope.Tag).equalTo('name', tag);
                    queries.push(query);
                });

                var tagQuery = Parse.Query.or.apply(this, queries);
                tagQuery.find({
                    success: function (tagsData) {
                        var postQueries = [];
                        tagsData.forEach(function (tag) {
                            var query = new Parse.Query($rootScope.Post);
                            query.equalTo('tags', { __type: 'Pointer', className: 'Tag', objectId: tag.id });
                            postQueries.push(query);
                        });

                        var postQuery = Parse.Query.or.apply(this, postQueries).limit(limit);
                        postQuery.include('user', 'post');
                        postQuery.find({
                            success: function (data) {
                                var posts = [];
                                data.forEach(function (post) {
                                    var avatar = post.get('user').get('image');
                                    posts.push({
                                        id: post.id,
                                        createdAt: post.createdAt,
                                        title: post.get('title'),
                                        user: post.get('user').get('username'),
                                        avatar: avatar ? avatar.url() : DEFAULT_IMAGE
                                    });
                                });

                                defer.resolve(posts);
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
            }
        };
    });
}());