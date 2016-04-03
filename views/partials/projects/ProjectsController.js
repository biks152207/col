'use strict';

angular.module('uomcollab').controller('ProjectsController',[
	'$scope',
	'$http',
	'APIRestangular',
	'$compile',
	'uiCalendarConfig',
	'$filter',
	'config',
	'mySocket',
	function($scope,$http,APIRestangular,$compile,uiCalendarConfig,$filter,config,mySocket){
		
		console.log('projects controller');
		$scope.currentProject = {};
		$scope.currentProjectTasks = [];
		$scope.config = config;
		$scope.members = {};
		$scope.projects = [];
		$scope.firepad = false;
		var date = new Date();
	    var d = date.getDate();
	    var m = date.getMonth();
	    var y = date.getFullYear();
		// Rest call for Members
		var firebase_url_root = "https://uopcollab.firebaseIO.com";
		var firepad_div = document.getElementById('fpeditor');
		
		
		APIRestangular.all('users').get('').then(function(response){
			$scope.members = response;
		});

		APIRestangular.all('project_users').getList({"user_id":config.userid}).then(function(response){
			console.log(response);
			var idlist= [];
			response.forEach(function(project_user) { idlist.push((project_user.project_id) ); } );
	
								console.log(idlist)
					
					/*
			APIRestangular.all('projects').getList(data).then(function(p_response){
				console.log('Projects resp against _id');
				console.log(p_response);
				p_response.forEach(function(project) { $scope.projects.push(project); } );
				
					//p_response[i].stick = 'true';
					
		
		});*/
		
		APIRestangular.all('projects').getList().then(function (p_response){
			
			
			  console.log('Projects resp against _id');
				console.log(p_response);
				p_response.forEach(function(project) { 
					console.log(project._id);
					if(inArray(project._id,idlist)){
						$scope.projects.push(project); 
					}
					
					
				} 
				);
			}, function (err){
			  console.warn('oh no!', err);
		}
		);
	
		
				console.log('Projects :');
			console.log($scope.projects);
		});
		
	

	    /* alert on projectClick */
	    $scope.alertOnProjectClick = function(project){
	    //	alert(project);
	    	$scope.editProject(project);
	    };
	    $scope.editProject = function(date){
	    	$scope.showProject = true;
	    	console.log(date);
	    	$scope.currentProject = date;
	    	$scope.currentProjectTasks = $scope.currentProject.tasks;
	    	//$('#fpeditor').html('');
	    	if(!$scope.currentProject.firepad_id){
	    		var firepad_id = $scope.currentProject.title;
	    		firepad_id = firepad_id.replace(/\s+/g, '');
	    		firepad_id = firepad_id.toLowerCase();
	    		$scope.currentProject.firepad_id = firepad_id;
	    		
	    	}else{
	    		var firepad_id = $scope.currentProject.firepad_id;
	    	}
	    	$(firepad_div).html('');
	    	var code_mirror = CodeMirror(firepad_div, { lineWrapping: true });
	    	var firepad_ref = new Firebase(firebase_url_root+'/firepads/'+firepad_id);
	    	$scope.firepad = Firepad.fromCodeMirror(firepad_ref, code_mirror,
    					{ richTextShortcuts: true, richTextToolbar: true , userId:config.userid});
	    	console.log($scope.currentProjectTasks);
	    }
	    /* alert on Drop */
	    $scope.alertOnDrop = function(project, delta, revertFunc, jsProject, ui, view){
	       console.log(project.start.format());
	       console.log(project._id);
	       var startChanged = project.start.format();
	       APIRestangular.all('projects').get(project._id).then(function(response){
	       		console.log(response);	
	       		response.start = startChanged;
	       		response.put().then(function(resp){
	       			console.log(resp);
	       		})
	       });
	    };

	    /* alert on Resize */
	    $scope.alertOnResize = function(project, delta, revertFunc, jsProject, ui, view ){
	       var startChanged = project.start.format();
	       var endChanged = project.end.format();
	       APIRestangular.all('projects').get(project._id).then(function(response){
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
	    /* add custom project*/
	    $scope.addProject = function() {
	    
		    $scope.currentProject.username = config.username;
		    $scope.currentProject.owner_id = config.userid;
		    $scope.currentProject.stick = 'true';
		    $scope.currentProject.tasks = $scope.currentProjectTasks;
		    if($scope.currentProject.start && $scope.currentProject.title){
		    	APIRestangular.all('projects').post($scope.currentProject).then(function(response){
			    	console.log(response);
			    	var project_id = response.ops[0]._id;
			    	$scope.currentProject._id = project_id;
			    	APIRestangular.all('project_users').post({'project_id':project_id,'user_id':config.userid}).then(function(response){
			    		console.log('project_users +');	
			    	});
			    	if($scope.currentProject.members){
			    		for(var i=0;i<$scope.currentProject.members.length;i++){
					    	var notification = {
					    		time: Date.now(),
						    	from_id: config.userid,
						    	from_name: config.name,
						    	type: 'project',
						    	acknowledge: false,
						    	accept: false,
						    	to_id : $scope.currentProject.members[i].id,
						    	to_name : $scope.currentProject.members[i].name,
						    	event_id: project_id,
						    	event_title: $scope.currentProject.title,
						    	event_start: $scope.currentProject.start
						    }
					    	APIRestangular.all('notifications').post(notification).then(function(response){
					    		console.log(response);
					    	});
						}
			    	}
			    	$scope.projects.push($scope.currentProject);
			    	console.log('-----------');
			    	$scope.currentProject = {};
			    	$scope.currentProjectTasks = [];
			    });
		    }
		};
		
		$scope.addProjectTask = function(value){
			alert('task');
			if(value){
				var task = {};
				task.status= false;
				task.title = value;
				if($scope.currentProjectTasks.length == 0){
						$scope.currentProjectTasks = [];
				}
			
				$scope.currentProjectTasks.push(task);
			}
		}
		$scope.removeProjectTask = function(index){
			
			$scope.currentProjectTasks.splice(index,1);
			$('input#task-'+index).remove();
			console.log($scope.currentProjectTasks);
			
		}
		
		$scope.updateTaskStatus = function(index){
			if($scope.currentProjectTasks[index].status){
				$scope.currentProjectTasks[index].status= false ;
			}else{
				$scope.currentProjectTasks[index].status= true;
			}
		}
		$scope.updateProject = function(projects){
			console.log($scope.currentProject);
			var index;
			for(var i=0;i<$scope.projects.length;i++){
				if($scope.projects[i]._id==$scope.currentProject._id){
					index = i;
					$scope.projects.splice(index,1);
					console.log(projects);
					console.log($scope.currentProject);
					console.log($scope.currentProjectTasks);
					$scope.projects.push(projects);
					APIRestangular.all('projects').get($scope.currentProject._id).then(function(resp){
						console.log(resp);
						resp.title = $scope.currentProject.title;
						resp.color = $scope.currentProject.color;
						resp.members = $scope.currentProject.members;
						resp.tasks = $scope.currentProjectTasks;
						resp.save().then(function(response){
							console.log(response);
							$scope.currentProject = {};
							$scope.currentProjectTasks = [];
							$scope.showProject = false;
						})
					})
				}
			}
		}
		$scope.deleteProject = function(projects){
			console.log(projects);
			
			projects.remove().then(function(response){
				console.log(response);
				var index;
				for(var i=0;i<$scope.projects.length;i++){
					if($scope.projects[i]._id==projects._id){
						index = i;
						$scope.projects.splice(index,1);
						$scope.currentProject = {};
						$scope.currentProjectTasks = [];
						$scope.showProject = false;
					}
				}
				console.log(index);
			});
		}
	    $scope.cancelProject = function(){
	    	$scope.showProject = false;
	    	$scope.currentProject = {};
	    	$scope.currentProjectTasks = [];
	    }
	    
			 var textFile = null;
		  $scope.downloadFile = function () {
		  	window.open("data:html/json;charset=utf-8," + escape($scope.firepad.getHtml()));
		    
  		};
	    /* remove project */
	    $scope.remove = function(index) {
	      $scope.projects.splice(index,1);
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
	    $scope.projectRender = function( project, element, view ) { 
	        element.attr({'tooltip': project.title,
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
	        projectClick: $scope.alertOnProjectClick,
	        projectDrop: $scope.alertOnDrop,
	        projectResize: $scope.alertOnResize,
	        projectRender: $scope.projectRender
	      }
	    };

	    
	    /* project sources array*/
	    $scope.projectSources = [$scope.projects];

		$scope.addMember = function(member){
			console.log(member+' added');
	    	var notification = {
	    		from_id: config.userid,
	    		from_name: config.name
	    	};
	    	if(!$scope.currentProject.members){
	    		$scope.currentProject.members = [];
	    	}
	    	var mem = {
	    		id : member._id,
	    		name: member.name,
	    		accept: "false"
	    	}
	    	if($scope.currentProject.members.indexOf(mem) < 0){
	    		$scope.currentProject.members.push(mem);
	    	}
	    	console.log($scope.currentProject.members);
	    }

	    $scope.removeMember = function(member){
//	    	var memb = $filter('filter')($scope.currentProject.members,function(member){});
	    	var index = $scope.currentProject.members.indexOf(member);
	    	$scope.currentProject.members.splice(index,1);
	    	console.log(index);
	    	console.log($scope.currentProject);
	    }
	}
]);

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

