'use strict';

newsApp.directive('fileReader', function ($q, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            element.bind('change', function (e) {
                readFile().then(function (data) {
                    ngModel.$setViewValue(data);
                    $rootScope.profileImageUpdate();
                });

                function readFile() {
                    var deferred = $q.defer();
                    var reader = new FileReader()
                    reader.onload = function (data) {
                        deferred.resolve(data.target.result);
                    }
                    reader.readAsDataURL(e.target.files[0]);

                    return deferred.promise;
                }
            });
        }
    };
});