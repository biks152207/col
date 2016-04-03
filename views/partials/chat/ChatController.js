angular.module('uomcollab').controller('ChatController',[
	'$scope',
	'$http',
	'APIRestangular',
	'config',
	'mySocket',
	'$rootScope',
	function($scope,$http,APIRestangular,config,mySocket,$rootScope){
		$scope.config = config;
		$scope.chat = {};
		$scope.isChat = false;
		//console.log(mySocket);
		//$scope.socket = mySocket.connect("http://localhost:3000");
		$scope.users = {};
		APIRestangular.all('users').getList({}).then(function(response){
			$scope.users = response;
		});
		// Starting the chat with user
		// 1) Create new chat if none exists
		// 2) Search for chat id with from and to username (vice versa)
		$scope.startChat = function(user){
			// search for chat from both ends
			$('#btn_new_'+user.username).css('display','none');
			$('#btn_new_'+config.username).css('display','none');
			APIRestangular.all('chats').getList({"from_username":config.username,"to_username":user.username}).then(function(response){
				if(response.length > 0){
					$scope.chat = response[0];
					$scope.isChat = true;
				}else{
					APIRestangular.all('chats').getList({"from_username":user.username,"to_username":config.username}).then(function(resp){
						if(resp.length > 0){
							$scope.chat = resp[0];
							$scope.isChat = true;
						}else{
							$scope.createChat(user);
						}
					})
				}
			});
		}

		//Creating chat with doesn't exists
		$scope.createChat = function(user){
			var chat = {};
			chat.from_username = config.username;
			chat.from_name = config.name;
			chat.to_username = user.username;
			chat.to_name = user.name;
			chat.message = [];
			chat.time = Date.now();
			APIRestangular.all('chats').post(chat).then(function(response){
				console.log(response);
				APIRestangular.all('chats').get(response.ops[0]._id).then(function(response){
					console.log(response);
					$scope.chat = response;
					$scope.isChat = true;
				});
				
			});
		}

		$scope.updateChat = function(message,event){
			var mess = {
				"from":config.name,
				"from_username":config.username,
				"message":message
			}

			// Alter chat model by switching 'from' and 'to' 
			
			// check if from data is current data

			if($scope.chat.from_username != $scope.config.username){
				$scope.chat.to_username = $scope.chat.from_username;
				$scope.chat.to_name = $scope.chat.from_name;
				$scope.chat.from_username = $scope.config.username;
				$scope.chat.from_name = $scope.config.name;
			}

			// Pushing current message to chat
			$scope.chat.message.push(mess);
			
			$scope.chat.put().then(function(response){
				// Socket sends data
				var socketdata = {
					"from_username":config.username,
					"chat_id":$scope.chat._id,
					"to_username":$scope.chat.to_username
				}
				mySocket.emit('chatUpdate',socketdata);

				// Send Notification
				var notification = {
					from_id: $scope.config.userid,
			    	from_name: $scope.config.name,
			    	from_username: $scope.config.username,
			    	type: 'chat',
			    	seen: 'false',
			    	to_username : $scope.chat.to_username,
			    	chat_id: $scope.chat._id
				}
				APIRestangular.all('chatnotifications').post(notification).then(function(response){
					console.log(response);
				});


				// Emptying the textarea
				event.message = null;
			})

			/*
			if($scope.chat.to_username == $scope.config.username){
				var temp;
				temp = $scope.chat.to_username;
				$scope.chat.to_username = $scope.chat.from_username;
				$scope.chat.from_username = temp;
			}else{
				$scope.chat.time = Date.now();
				$scope.chat.message.push(mess);
				console.log($scope.chat);
				$scope.chat.put().then(function(response){
					
					var socketdata = {
						"from_username":config.username,
						"chat_id":$scope.chat._id
					}
					
					if(config.username == $scope.chat.from){
						socketdata.to_username = $scope.chat.to_username;
					}else{
						socketdata.to_username = $scope.chat.from_username;
					}
					
					var notification = {
						from_id: $scope.config.userid,
				    	from_name: $scope.config.name,
				    	from_username: $scope.config.username,
				    	type: 'chat',
				    	seen: 'false',
				    	to_username : $scope.chat.to_username,
				    	chat_id: $scope.chat._id
					}
					APIRestangular.all('chatnotifications').post(notification).then(function(response){
						console.log(response);
					});
						
					mySocket.emit('chatUpdate',socketdata);
					event.message = null;
				});
			}*/
			
		}

		mySocket.on('chatUpdate',function(data){
			if(data.from_username == config.username || data.to_username == config.username){
				APIRestangular.all('chats').get(data.chat_id).then(function(response){
					$scope.chat.message = response.message;
				});
				$('#btn_new_'+data.from_username).css('display','inline');
				if($scope.config.username == data.to_username){
					$rootScope.chatUpdated = true;
				}
				$rootScope.getAllData();
				$scope.$apply();
			}
		});

		$scope.updateRead = function(chat){
			$('#btn_new_'+$scope.chat.to_username).css('display','none');
			$('#btn_new_'+$scope.chat.from_username).css('display','none');
			APIRestangular.all('chatnotifications').getList({"chat_id":chat._id}).then(function(response){
				console.log(response);
				if($scope.config.username == response[0].to_username){
					response[0].seen = 'true';
					response[0].remove().then(function(response){
						$rootScope.getAllData();
					})
				}
			});
		}
		
	}
]).directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown", function(e) {
            if(e.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'e': e});
                });
                e.preventDefault();
            }
        });
    };
});