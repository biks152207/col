'use strict';

angular.module('uomcollab').controller('CalendarController',[
	'$scope',
	'$http',
	'APIRestangular',
	'SearchRestangular',
	'$compile',
	'uiCalendarConfig',
	'$filter',
	'config',
	'mySocket',
	'moment',
	function($scope,$http,APIRestangular,SearchRestangular,$compile,uiCalendarConfig,$filter,config,mySocket,moment){
		console.log('calendar controller');
		$scope.currentEvent = {};
		$scope.config = config;
		$scope.members = {};
		$scope.events = [];
		$scope.membersBusy = [];

		var date = new Date();
	    var d = date.getDate();
	    var m = date.getMonth();
	    var y = date.getFullYear();
		// Rest call for Members


		APIRestangular.all('users').get('').then(function(response){
			$scope.members = response;
		});

		APIRestangular.all('events').getList({"username":config.username}).then(function(response){
			console.log(response);
			for(var i=0;i<response.length;i++){
				response[i].stick = 'true';
				$scope.events.push(response[i]);
			}
		});


	    /* alert on eventClick */
	    $scope.alertOnEventClick = function( date, jsEvent, view){
	    	$scope.editEvent(date);
	    };
	    $scope.editEvent = function(date){
	    	$scope.showEvent = true;
	    	console.log(date);
	    	$scope.currentEvent = date;
	    }
	    /* alert on Drop */
	    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
	       console.log(event.start.format());
	       console.log(event._id);
	       var startChanged = event.start.format();
	       APIRestangular.all('events').get(event._id).then(function(response){
	       		console.log(response);
	       		response.start = startChanged;
	       		response.put().then(function(resp){
	       			console.log(resp);
	       		})
	       });
	    };

	    /* alert on Resize */
	    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
	       var startChanged = event.start.format();
	       var endChanged = event.end.format();
	       APIRestangular.all('events').get(event._id).then(function(response){
	       		response.start = startChanged;
	       		response.end = endChanged;
	       		response.put().then(function(resp){
	       			console.log(resp);
	       		})
	       });
	    };

	    $scope.fetchId = function (resp) {
	      var headers = resp.headers();
	      if (headers.location) {
	        var items = headers.location.split('/');
	        var newId = items[items.length - 1];
	        return newId;
	      }
	      return 0;
	    };
	    /* add custom event*/
	    $scope.addEvent = function() {
		    $scope.currentEvent.username = config.username;
		    $scope.currentEvent.owner_id = config.userid;
		    $scope.currentEvent.stick = 'true';
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
		$scope.updateEvent = function(events){
			console.log($scope.currentEvent);
			var index;
			for(var i=0;i<$scope.events.length;i++){
				if($scope.events[i]._id==$scope.currentEvent._id){
					index = i;
					$scope.events.splice(index,1);
					console.log(events);
					console.log($scope.currentEvent);
					$scope.events.push(events);
					APIRestangular.all('events').get($scope.currentEvent._id).then(function(resp){
						console.log(resp);
						resp.title = $scope.currentEvent.title;
						resp.color = $scope.currentEvent.color;
						resp.members = $scope.currentEvent.members;
						resp.save().then(function(response){
							console.log(response);
							$scope.currentEvent = {};
							$scope.showEvent = false;
						})
					})
				}
			}
		}
		$scope.deleteEvent = function(events){
			console.log(events);

			events.remove().then(function(response){
				console.log(response);
				var index;
				for(var i=0;i<$scope.events.length;i++){
					if($scope.events[i]._id==events._id){
						index = i;
						$scope.events.splice(index,1);
						$scope.currentEvent = {};
						$scope.showEvent = false;
					}
				}
				console.log(index);
			});
		}
	    $scope.cancelEvent = function(){
	    	$scope.showEvent = false;
	    	$scope.currentEvent = {};
	    }
	    /* remove event */
	    $scope.remove = function(index) {
	      $scope.events.splice(index,1);
	    };
	    /* Change View *
	    $scope.changeView = function(view,calendar) {
	      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
	      console.log('change view');
	    };
	    /* Change View *
	    $scope.renderCalender = function(calendar) {
	      if(uiCalendarConfig.calendars[calendar]){
	        uiCalendarConfig.calendars[calendar].fullCalendar('render');
	        console.log('change view if');
	      }
	      console.log('change view');
	    };*/
	     /* Render Tooltip *
	    $scope.eventRender = function( event, element, view ) {
	        element.attr({'tooltip': event.title,
	                     'tooltip-append-to-body': true});
	        $compile(element)($scope);
	    };
	    /* config object */
	    $scope.uiConfig = {
	      calendar:{
	        height: 450,
	        editable: true,
	        header:{
	          left: 'title',
	          center: 'month basicWeek basicDay agendaWeek agendaDay',
	          right: 'today prev,next'
	        },
	        eventClick: $scope.alertOnEventClick,
	        eventDrop: $scope.alertOnDrop,
	        eventResize: $scope.alertOnResize,
	        eventRender: $scope.eventRender
	      }
	    };


	    /* event sources array*/
	    $scope.eventSources = [$scope.events];

		$scope.addMember = function(member){
	    	var notification = {
	    		from_id: config.userid,
	    		from_name: config.name
	    	};
	    	if(!$scope.currentEvent.members){
	    		$scope.currentEvent.members = [];
	    	}
	    	var mem = {
	    		id : member._id,
	    		name: member.name,
	    		accept: "false"
	    	}
	    	if($scope.currentEvent.members.indexOf(mem) < 0){
	    		$scope.currentEvent.members.push(mem);
	    	}
	    }

	    $scope.removeMember = function(member){
//	    	var memb = $filter('filter')($scope.currentEvent.members,function(member){});
	    	var index = $scope.currentEvent.members.indexOf(member);
	    	$scope.currentEvent.members.splice(index,1);
	    	console.log(index);
	    	console.log($scope.currentEvent);
	    }
/*
	    $scope.checkAvailableMembers = function(start,end){
	    	console.log(start);
	    	console.log($scope.members);
	    	$scope.availableMembers = {};
	    	/*
	    	APIRestangular.all('getavailableusers').getList({'date':date}).then(function(response){
	    		console.log(response);
	    	})
	    	SearchRestangular.all('events').getList({'start':start,'end':end}).then(function(response){
	    		console.log(response);
	    	})
	    	*

	    	for(var i=0;i<$scope.members.length;i++){
	    		SearchRestangular.all('checkAvailability').getList({'start':start,'end':end,'username':$scope.members[i].username}).then(function(response){
	    			console.log(response);
	    		})
	    	}
	    }
	    */
	    $scope.checkAvailableMembers = function(start,end){
	    	$scope.membersBusy = [];
	    	if(!end){
	    		for(var i=0;i<$scope.members.length;i++){
		    		APIRestangular.all('events').getList({'username':$scope.members[i].username}).then(function(response){
		    			console.log(response);
		    			for(var j=0;j<response.length;j++){
		    				// check if start state matches the start
		    				moment(response[j].start).utc().format();
		    				moment(start);
		    				if(response[j].end){
		    					moment(response[j].end).utc().format();
		    					if(moment(start).isSame(response[j].end,'day') || moment(start).isBetween(response[j].start,response[j].end,'day')){
		    						if($scope.membersBusy.indexOf(response[j].username) == -1){
		    							$scope.membersBusy.push(response[j].username);
		    						}
		    					}
		    				}else{
		    					if(moment(start).isSame(response[j].start,'day')){
		    						if($scope.membersBusy.indexOf(response[j].username) == -1){
		    							$scope.membersBusy.push(response[j].username);
		    						}
		    					}
		    				}
		    			}
		    		})
		    	}
	    	}else{
	    		for(var i=0;i<$scope.members.length;i++){
	    			APIRestangular.all('events').getList({'username':$scope.members[i].username}).then(function(response){
	    				for(var j=0;j<response.length;j++){
	    					moment(response[j].start).utc().format();
		    				moment(start);
		    				moment(end);
		    				if(response[j].end){
		    					moment(response[j].end).utc().format();
		    					// check start date
		    					if(moment(start).isSame(response[j].end,'day') || moment(start).isBetween(response[j].start,response[j].end,'day')){
		    						if($scope.membersBusy.indexOf(response[j].username) == -1){
		    							$scope.membersBusy.push(response[j].username);
		    						}
		    					}
		    					// check end date
		    					if(moment(end).isSame(response[j].end,'day') || moment(end).isBetween(response[j].start,response[j].end,'day')){
		    						if($scope.membersBusy.indexOf(response[j].username) == -1){
		    							$scope.membersBusy.push(response[j].username);
		    						}
		    					}
		    				}else{
		    					if(moment(start).isSame(response[j].start,'day')){
		    						if($scope.membersBusy.indexOf(response[j].username) == -1){
		    							$scope.membersBusy.push(response[j].username);
		    						}
		    					}
		    					if(moment(end).isSame(response[j].start,'day')){
		    						if($scope.membersBusy.indexOf(response[j].username) == -1){
		    							$scope.membersBusy.push(response[j].username);
		    						}
		    					}
		    				}
	    				}
	    			})
	    		}
	    	}

	    }
	}
]);
