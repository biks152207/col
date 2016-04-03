'use strict';
angular.module('uomcollab',[
	'ui.router',
	'restangular',
	'ui.calendar',
	'uomcollab.appConfig',
	'btford.socket-io',
	'wysiwyg.module',
	'ngSanitize',
	'ui-notification'
]).config([
	'$stateProvider',
	'$urlRouterProvider',
	'RestangularProvider',
	'configProvider',
	'NotificationProvider',
	function($stateProvider,$urlRouterProvider,RestangularProvider,configProvider,NotificationProvider){
		$urlRouterProvider.otherwise('/dashboard');
		NotificationProvider.setOptions({
	      delay: 10000,
	      startTop: 20,
	      startRight: 10,
	      verticalSpacing: 20,
	      horizontalSpacing: 20,
	      positionX: 'center',
	      positionY: 'top'
	    });
	}
]).factory('APIRestangular',function(Restangular){
	var handler = Restangular.withConfig(function () {
  });
  handler.setRestangularFields({ id: '_id' });
  handler.setBaseUrl('api/');
  return handler;
}).factory('mySocket', function (socketFactory) {
	return socketFactory();
}).filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

angular.module('uomcollab').config([
	'$stateProvider',
	'configProvider',
	function($stateProvider,config){
		$stateProvider.state('dashboard',{
			url: '/dashboard',
			templateUrl: config.config.basePath +'partials/dashboard/dashboard.html',
			controllerAs: 'DashboardController'
		}).state('calendar',{
			url: '/calendar',
			templateUrl: config.config.basePath +'partials/calendar/calendar.html',
			controller: 'CalendarController'
		}).state('mail',{
			url:'/mail',
			templateUrl: config.config.basePath +'partials/mail/mail.html',
			controller: 'MailController'
		}).state('mail.list',{
			url:'/list',
			templateUrl: config.config.basePath +'partials/mail/list.html',
			controllerAs: 'MailController'
		}).state('mail.list.inbox',{
			url:'/inbox',
			templateUrl: config.config.basePath +'partials/mail/inbox.html',
			controllerAs: 'MailController'
		}).state('mail.list.label',{
			url:'/label/:label',
			templateUrl: config.config.basePath +'partials/mail/label.html',
			controller: 'MailController'
		}).state('mail.list.sent',{
			url:'/sent',
			templateUrl: config.config.basePath +'partials/mail/sent.html',
			controllerAs: 'MailController'
		}).state('mail.list.draft',{
			url:'/draft',
			templateUrl: config.config.basePath +'partials/mail/draft.html',
			controllerAs: 'MailController'
		}).state('mail.list.trash',{
			url:'/trash',
			templateUrl: config.config.basePath +'partials/mail/trash.html',
			controllerAs: 'MailController'
		}).state('mail.compose',{
			url:'/compose',
			templateUrl: config.config.basePath +'partials/mail/compose.html',
			controllerAs: 'MailController'
		}).state('mail.read',{
			url:'/read',
			templateUrl: config.config.basePath +'partials/mail/read.html',
			controllerAs: 'MailController'
		}).state('chat',{
			url: '/chat',
			templateUrl: config.config.basePath +'partials/chat/chat.html',
			controller: 'ChatController'
		}).state('tasks',{
			url: '/tasks',
			templateUrl: config.config.basePath +'partials/tasks/tasks.html',
			controller: 'TasksController'
		}).state('tasks.add',{
			url: '/add',
			templateUrl: config.config.basePath +'partials/tasks/add.html',
			controller: 'TasksController'
		}).state('projects',{
			url: '/projects',
			templateUrl: config.config.basePath +'partials/projects/projects.html',
			controller: 'ProjectsController'
		});
	}
]);