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
    .module('<%= appName %>', ["ngSanitize","NeteaseNewsappJsBridge",<%= angularModules %>])<% if (angularModules.indexOf('ngRoute') >= 0) { %>
        .config(['$routeProvider',function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'views/main.html',
                    controller: 'MainCtrl'
                })
                .otherwise({redirectTo: '/'});
        }])<% } %>;
