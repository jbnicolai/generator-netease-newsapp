'use strict';

/**
 * @ngdoc overview
 * @name <%= appName %>
 * @description
 * # <%= appName %>
 *
 * Main module of the application.
 */
angular
    .module('<%= appName %>', <%= angularModules %>)<% if (angularModules.indexOf('ngRoute') >= 0) { %>
        .config(function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl'
                })
                .otherwise({redirectTo: '/'});
        })<% } %>;
