angular.module('uomcollab').controller('DashboardController',[
	'$scope',
	'$state',
	'$http',
	'APIRestangular',
	'config',
	'$rootScope',
	'mySocket',
	'$interval',
	function($scope,$state,$http,APIRestangular,config,$rootScope,mySocket,$interval){
		
		$scope.config = config;
		$rootScope.notifications = [];
		$rootScope.messages = [];
		$rootScope.chatsAll = [];
		$scope.participants = {};
		
		var socket = mySocket.connect("http://localhost:3000");
		
		mySocket.emit("userConnected",config);
		
		mySocket.on('participantsList',function(participants){
			$scope.participants = participants;
		});

		socket.on('disconnect',function(){
			mySocket.emit("userDisconnected",config);
		});

		$rootScope.isState = function(state){
			return (state==$state.current.name)?true:false;
		}
		

		$rootScope.getAllData = function(){
			APIRestangular.all('notifications').getList({"to_id":config.userid}).then(function(response){
				
				$rootScope.notifications = [];
				for(var i=0;i<response.length;i++){
					if(response[i].accept == false){
						$rootScope.notifications.push(response[i]);
					}
				}
			});

			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":config.userid,"draft":"false","trash":"false"}).then(function(response){
				
				$rootScope.messages = [];
				for(var i=0;i<response.length;i++){
					if(response[i].read == false){
						$rootScope.messages.push(response[i]);
					}
				}
			});

			APIRestangular.all('chatnotifications').getList({"to_username":config.username,"seen":"false"}).then(function(response){
				$rootScope.chatsAll = [];
				for(var i=0;i<response.length;i++){
					$rootScope.chatsAll.push(response[i]);
					//$("#btn_new_"+response[i].from_username).css("display","inline");
				}
				console.log($rootScope.chatsAll);
			});
		}
		// INitially get all the data
		$rootScope.getAllData();
		//Watch for updates every 10 secs
		$interval($rootScope.getAllData,10000);

		$rootScope.acceptInvitation = function(invitation){
			
			invitation.accept=true;
			invitation.acknowledge = true;
			if(invitation.type=='event'){
				APIRestangular.all('events').get(invitation.event_id).then(function(response){
				console.log(response);
				var event_details = response;
				event_details.username = config.username;
				event_details.userid = config.userid;
				event_details.isOwner = false;
				APIRestangular.all('events').post(event_details).then(function(response){
					console.log(response);
				});
			});
				
			}
			if(invitation.type=='project'){
				var project_user = {};
				project_user.project_id = invitation.event_id;
				project_user.user_id = config.userid;
			
				APIRestangular.all('project_users').post(project_user).then(function(response){
					console.log(response);
				});
			
				
			}
			
			invitation.put().then(function(response){
				
				$scope.getAllData();
			});
		}
		$rootScope.rejectInvitation = function(invitation){
			
			invitation.acknowledge = true;
			invitation.rejected = true;
			invitation.accept = false;
			invitation.put().then(function(response){
				
				$scope.getAllData();
			})
		}

		$rootScope.updateUserNotification = function(){
			console.log($rootScope.chatsAll);
			for(var i=0;i<$rootScope.chatsAll.length;i++){
				console.log($('#btn_new_'+$rootScope.chatsAll[i].from_username));
				$('#btn_new_'+$rootScope.chatsAll[i].from_username).css('display','inline');
				$rootScope.$apply();
			}	
		}
	}
]);