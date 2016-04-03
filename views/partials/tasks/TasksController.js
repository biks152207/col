angular.module('uomcollab').controller('TasksController',[
	'$scope',
	'$state',
	'$http',
	'APIRestangular',
	'config',
	'Notification',
	function($scope,$state,$http,APIRestangular,config,Notification){
		
		$scope.config = config;
		$scope.projects = {};//,$scope.sent,$scope.draft,$scope.trash = {};
		$scope.task = {};
	//	$scope.project.user_id = $scope.config.userid;
		//$scope.project.status = 'pending';
	//	$scope.project.complete = false;
		
		$scope.project_selected = [];
		$scope.filtered={};

		
		if($state.params.label){
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"draft":"false","trash":"false","label":$state.params.label}).then(function(response){
				$scope.filtered = response;
			});
		}

		if($state.current.name == 'mail.read'){
			$state.go('mail.list.inbox');
		}

		$scope.getProjects = function(){
			//Getting inbox
			APIRestangular.all('project_users').getList({"user_id":$scope.config.userid}).then(function(response){
			//debug(response);
				$scope.projects = response;
			});
		}
		
		$scope.getProjects();
		
		$scope.addProject = function() {
		  
		    $scope.currentProject.owner_id = config.userid;
		    $scope.currentProject.title = 'true';
		    if($scope.currentEvent.start && $scope.currentEvent.title){
		    	APIRestangular.all('events').post($scope.currentEvent).then(function(response){
			    	console.log(response);
			    	var event_id = response.ops[0]._id;
			    	$scope.currentEvent._id = event_id;
			    	if($scope.currentEvent.members){
			    		for(var i=0;i<$scope.currentEvent.members.length;i++){
					    	var notification = {
					    		time: Date.now(),
						    	from_id: config.userid,
						    	from_name: config.name,
						    	type: 'event',
						    	acknowledge: false,
						    	accept: false,
						    	to_id : $scope.currentEvent.members[i].id,
						    	to_name : $scope.currentEvent.members[i].name,
						    	event_id: event_id,
						    	event_title: $scope.currentEvent.title,
						    	event_start: $scope.currentEvent.start
						    }
					    	APIRestangular.all('notifications').post(notification).then(function(response){
					    		console.log(response);
					    	});
						}
			    	}
			    	$scope.events.push($scope.currentEvent);
			    	$scope.currentEvent = {};
			    });
		    }
		};
	}
]);