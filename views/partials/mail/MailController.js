angular.module('uomcollab').controller('MailController',[
	'$scope',
	'$state',
	'$http',
	'APIRestangular',
	'config',
	'Notification',
	function($scope,$state,$http,APIRestangular,config,Notification){
		
		$scope.config = config;
		$scope.inbox,$scope.sent,$scope.draft,$scope.trash = {};
		$scope.mail = {};
		$scope.mail.from_id = $scope.config.userid;
		$scope.mail.from_username = $scope.config.username;
		$scope.mail.from_name = $scope.config.name;
		$scope.mail.from_email = $scope.config.useremail;
		$scope.mail.label = 'important';
		$scope.mail.read = false;
		$scope.mailRead = {};
		$scope.mail.draft = "false";
		$scope.mail.trash = "false";

		$scope.email_selected = [];
		$scope.unread = 0;
		$scope.filtered={};

		
		if($state.params.label){
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"draft":"false","trash":"false","label":$state.params.label}).then(function(response){
				$scope.filtered = response;
			});
		}

		if($state.current.name == 'mail.read'){
			$state.go('mail.list.inbox');
		}

		$scope.getDetails = function(){
			//Getting inbox
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"draft":"false","trash":"false"}).then(function(response){
				$scope.inbox = response;
				for(var i=0;i<$scope.inbox.length;i++){
					if($scope.inbox[i].read == false){
						$scope.unread = $scope.unread + 1;
					}
				}
			});

			//Getting outbox
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"from_id":$scope.config.userid,"draft":"false","trash":"false"}).then(function(response){
				
				$scope.sent = response;
			});

			//Getting drafts
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"from_id":$scope.config.userid,"draft":"true"}).then(function(response){
				$scope.draft = response;
			});

			//Getting Trash
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"trash":"true"}).then(function(response){
				$scope.trash = response;
			});
		}
		
		$scope.getDetails();

		// Functions for Mail Composition starts here 
		$scope.draftMail = function(){
			if($scope.mail.to_email && $scope.mail.subject && $scope.mail.body){
				APIRestangular.all('users').getList({"email":$scope.mail.to_email}).then(function(resp){
					var response = resp[0];
					$scope.mail.time = Date.now();
					$scope.mail.draft = "true";
					$scope.mail.trash = "false";
					if(resp.length > 0){
						
						$scope.mail.to_id = response._id;
						$scope.mail.to_username = response.username;
						$scope.mail.to_name = response.name;
						$scope.mail.member = "true";
						APIRestangular.all('emails').post($scope.mail).then(function(response){
							
							Notification.warning("Email Saved to Draft Successfully");
							$state.go('mail.list.inbox');
							$scope.mail = {};
							$scope.getDetails();
						});		
					}else{
						$scope.mail.member = "false";
						APIRestangular.all('emails').post($scope.mail).then(function(response){
							
							Notification.warning("Email Saved to Draft Successfully");
							$state.go('mail.list.inbox');
							$scope.mail = {};
							$scope.getDetails();
						});	
					}
				});
					
			}
		}

		$scope.sendMail = function(){
			if($scope.mail.to_email && $scope.mail.subject && $scope.mail.body){
				APIRestangular.all('users').getList({"email":$scope.mail.to_email}).then(function(resp){
					var response = resp[0];
					$scope.mail.time = Date.now();
					if(resp.length > 0){
						
						$scope.mail.to_id = response._id;
						$scope.mail.to_username = response.username;
						$scope.mail.to_name = response.name;
						$scope.mail.member = "true";
						$scope.mail.owner_username = $scope.config.username;
						APIRestangular.all('emails').post($scope.mail).then(function(response){
							$scope.mail.owner_username = $scope.mail.to_username;
							APIRestangular.all('emails').post($scope.mail).then(function(response){
								Notification.warning("Email Sent Successfully");
								$state.go('mail.list.inbox');
								$scope.mail = {};
								$scope.getDetails();
							});	
						});	

						

					}else{
						$scope.mail.member = "false";
						APIRestangular.all('emails').post($scope.mail).then(function(response){
							Notification.warning("Email Sent Successfully");
							$state.go('mail.list.inbox');
							$scope.mail = {};
							$scope.getDetails();
						});	
					}
				});
					
			}
		}

		$scope.cancelMail = function(){
			$scope.mail = {};
			$state.go('mail.list.inbox');
		}


		// Reading the mail

		$scope.readMail = function(mail){
			$scope.mailRead = mail;
			if(mail.to_id == $scope.config.userid){
				mail.read = true;
				mail.put().then(function(response){
					
					$state.go('mail.read');
				});
			}
			
		}

		$scope.readDraft = function(mail){
			$scope.mail = mail;
			$state.go('mail.compose');
		}

		$scope.sendDraftMail = function(mail){
			mail.draft = "false";
			mail.save().then(function(response){
				Notification.warning('Email Sent');
				$scope.getDetails();
			})
		}
		// Updating mail with labels

		$scope.updateMail = function(mail){
			
			mail.put().then(function(response){
				
				$scope.getDetails();
			});
		}

		// Controlling the mail list - trash, forward, reply

		$scope.trashMail = function(mail){
			
			mail.trash = 'true';
			mail.save().then(function(response){
				
				$scope.getDetails();
			})
		}

		$scope.deletePermanent = function(mail){
			mail.remove().then(function(response){
				Notification.warning('Email Deleted');
				$scope.getDetails();
			})
		}

		$scope.replyMail = function(mail){
			mail.to_email = mail.from_email;
			mail.to_id = mail.to_id;
			mail.to_name = mail.to_name;
			mail.to_username = mail.to_username;
			mail.from_email = $scope.config.useremail;
			mail.from_id = $scope.config.userid;
			mail.from_name = $scope.config.name;
			mail.from_username = $scope.config.username;
			mail.body = '';
			$scope.mail = mail;
			$state.go('mail.compose');
		}
		$scope.forwardMail = function(mail){
			mail.to_email = '';
			mail.from_email = $scope.config.useremail;
			mail.from_id = $scope.config.userid;
			mail.from_name = $scope.config.name;
			mail.from_username = $scope.config.username;
			$scope.mail = mail;
			$state.go('mail.compose');
		}

		$scope.trashAllMail = function(box){
			if(box == 'inbox'){
				console.log('inbox deletion');
				APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"draft":"false","trash":"false"}).then(function(response){
					var inbox = {};
					inbox = response;
					for(var i=0;i<inbox.length;i++){
						$scope.inbox[i].remove();
					}
					$scope,getDetails();
				});
			}
			if(box == 'sent'){
				APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"from_id":$scope.config.userid,"draft":"false","trash":"false"}).then(function(response){
					var outbox = {};
					outbox = response;
					for(var i=0;i<outbox.length;i++){
						$scope.outbox[i].remove();
					}
					$scope,getDetails();
				});
			}
			if(box == 'draft'){
				APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"draft":"true","trash":"false"}).then(function(response){
					var draft = {};
					draft = response;
					for(var i=0;i<draft.length;i++){
						$scope.draft[i].remove();
					}
					$scope,getDetails();
				});

			}
		}
		$scope.deleteAllTrashMail = function(){
			APIRestangular.all('emails').getList({"owner_username":$scope.config.username,"to_id":$scope.config.userid,"trash":"true"}).then(function(){
				var trash = {};
				trash = response;
				for(var i=0;i<trash.length;i++){
					$scope.draft[i].remove();
				}
				$scope,getDetails();
			});
		}
	}
]);