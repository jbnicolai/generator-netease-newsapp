'use strict';
angular
    .module('<%= appName %>')
        .controller('BodyCtrl', ['$scope',function ($scope) {
            function render(){
                $scope.start = true;
            }
            function defineFunctions(){
            }
            function init(){
                render();
                defineFunctions();
            }
            init();
        }]);
