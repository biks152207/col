angular.module('login',[
	'ui.router',
	'restangular',
	'satellizer',
	'ui-notification'
]).config([
	'$stateProvider',
	'$urlRouterProvider',
	'RestangularProvider',
	'$authProvider',
	'NotificationProvider',
	function($stateProvider,$urlRouterProvider,RestangularProvider,$authProvider,NotificationProvider){
		$urlRouterProvider.otherwise('/');
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
]);

angular.module('login').controller('LoginController',[
	'$scope',
	'$http',
	'$auth',
	'$window',
	'Notification',
	function($scope,$http,$auth,$window,Notification){
		console.log('Login Controoler works');
		$scope.userRegister = {};
		$scope.userLogin = {};

		$scope.login = function(validity){
			if (validity){
				$auth.login($scope.userLogin).then(function(response){
					//console.log(response);
					$window.location.reload();
				}, function(err){
					Notification.warning('Invalid username or password');

				});
			}
		}

		$scope.register = function(validity){
			if (validity){
				$auth.signup($scope.userRegister).then(function(response){
					console.log(response);
					if (response.data == 'User Already Exists'){
						Notification.warning(response.data);
						return;
					}
					// $scope.userRegister = {};
					Notification.warning("You have successfully registered. Please login with your credentials");
					//$window.location.reload();
				})
			}
		}
	}
]);
