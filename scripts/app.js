(function() {
	var app = angular.module('Vulcan', ['ngRoute', 'ngSanitize', 'textAngular']);

	app.config(function($routeProvider, $locationProvider) {
		// Removes hash from routing (?)
		// $locationProvider.html5Mode(true);
		
		$routeProvider
			.when('/', {
				templateUrl: 'Base.html',
				controller: 'mainController'
			})
			.when('/quiz', {
				templateUrl: 'components/QNAs.html',
				controller:'mainController',
				activeTab: 'quiz'
			})
			.when('/add-qna', {
				templateUrl: 'components/AddQNA.html',
				controller: 'mainController',
				activeTab: 'add-qna'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
	
	// Math Toolbar Button
	app.config(function($provide) {
		$provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
			// Code entry toolbar button
			taRegisterTool('colourRed', {
				iconclass:'fa fa-terminal',
				action: function() {
					this.$editor().wrapSelection('forecolor', 'red');
				}
			});
			taOptions.toolbar[2].push('colourRed');
			
			// Math entry toolbar button
			taRegisterTool('colourAzure', {
				iconclass:'fa fa-superscript',
				action: function() {
					var self = this;
					if($('.modal').length === 0) {
						$('body').append('' +
							'<div id="mathModal" class="modal fade">' + 
								'<div class="modal-dialog">' + 
									'<div class="modal-content">' + 
										'<div class="modal-header">' + 
											'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
											'<h4 class="modal-title text-center">Equation Preview</h4>' + 
										'</div>' + 
										'<div class="modal-body">' +
											'<p><div id="renderedEqn"></div></p>' + 
											'<p><input id="eqnTextInput" type="text" class="form-control" /></p>' + 
										'</div>' + 
										'<div class="modal-footer">' + 
											'<input id="#inlineEqn" type="checkbox" /> Inline Equation ' +
											'<button id="insertEqnBtn" type="button" class="btn btn-primary" data-dismiss="modal">Insert</button>' + 
										'</div>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'');	
						$('#mathModal').modal({
							show:false,
							keyboard:true
						});
						
						
						$('#insertEqnBtn').on('click', function() {
							window.selectTest = self.$editor();
							// TODO: use rangy/selection API to insert math content back in text-angular
							console.log('Insert math content into editor');
						});
						
						$('#eqnTextInput').on('keyup', function() {
							$('#renderedEqn').text('$$' + $(this).val().trim() + '$$');
							MathJax.Hub.Typeset();
						});
					}
					$('#mathModal').modal('show');
					
					$('#mathModal').on('shown.bs.modal', function() {
						console.log('Math modal displayed.');
					})
					
					self.$editor().wrapSelection('forecolor', 'azure');
				}
			});
			taOptions.toolbar[2].push('colourAzure');
			
			return taOptions;
		}]);
	});
	
	// IndexedDB Factory Service
	app.factory('qnaDBFactory', function() {
		
	});

	app.directive('navMenu', function() {
		return {
			restrict: 'E',
			templateUrl: 'components/Menu.html',
			controller: function($scope) {
				$scope.topics = {
					'All Topics': {
						'Engineering': {
							'ECE': {
								'Signals': 'Signals and Systems',
								'Communications': 'Communications',
								'Electrical': {
									'Circuits': 'Circuits',
									'Microelectronics': 'Microelectronics'
								},
								'Computer': {
									'Computer Architecture': 'Computer Architecture',
									'VLSI': 'VLSI'
								}
							},
							'Software': {
								'ASP.NET': 'ASP.NET',
								'C#': 'C#',
								'JavaScript': 'JavaScript',
								'SQL': 'SQL',
								'AngularJS': 'AngularJS',
								'Joomla!': 'Joomla!',
								'WordPress': 'WordPress'
							},
							'Probability': 'Probability'
						},
						'Mathematics': {
							'Calculus': 'Calculus',
							'Differential Equations': 'Differential Equations'
						},
						'Physics': {
							'Classical Mechanics': 'Classical Mechanics',
							'Wave Mechanics': 'Wave Mechanics',
							'Thermodynamics': 'Thermodynamics',
							'Electromagnetism': 'Electromagnetism',
							'Optics': 'Optics',
							'Relativity': 'Relativity',
							'Quantum Mechanics': 'Quantum Mechanics'
						},
						'Chemistry': {
							'Molecules': 'Molecules'
						}
					}
				};
				$scope.topicMenuBuilder = function(obj) {
					var str = '';
					for(var prop in obj) {
						if(typeof obj[prop] === 'string')
							str += '<li><a style="cursor:pointer">' + obj[prop] + '</a></li>';
						else if(typeof obj[prop] === 'object')
							str += '<li class="dropdown-submenu"><a style="cursor:pointer">' + prop + '</a><ul class="dropdown-menu">' + 
								$scope.topicMenuBuilder(obj[prop]) + '</ul></li>';
						else
							throw ': Invalid property type';
					}					return str;
				}
				$scope.selectedTopic = 'All Topics';
				
				var topicsDropdown = '<ul class="dropdown-menu" role="menu">' + 
					$scope.topicMenuBuilder($scope.topics) + '</ul>';
				$(topicsDropdown).insertAfter('.navbar-left li.dropdown a');

				$('ul.dropdown-menu li.dropdown-submenu a').click(function() {
					console.log($(this).text());
					$('a.dropdown-toggle').html($(this).text().trim() + 
						' <span class="caret"></span>').data('topic', $(this).text());
				});
			}
		};
	});

	app.controller('mainController', function($scope, $route) {
		$scope.$route = $route;
		
		$scope.QNASDB = new IDB('QNASDB', [], 1, { qnas:'qnas', topics:'topics' });
		$scope.QNASDB.OpenDatabase('qnas', function() {
			console.log('qnas Store opened');
		});
		$scope.QNASDB.OpenDatabase('topics', function() {
			console.log('topics Store opend');
		});
		window.db = $scope.QNASDB;
	});

	app.directive('qnas', function() {
		return {
			restrict: 'E',
			templateUrl: 'components/QNAs.html',
			link: function($scope, $elem, attrs) {
				
			},
			controller: function($scope) {
				$scope.loc = $scope.$route;
				$scope.$watch('loc', function(newVal, oldVal) {
					console.log(newVal, oldVal);
				});
				$scope.qnaSet = ['a', 'b', 'c'];
				$scope.selectedQNA = {
					qna: null,
					prev: function() {
						
					},
					next: function() {
						
					},
					reset: function() {
						
					}
				};
				
				$scope.changeQNA = function(dir) {
					switch(dir) {
						case 'up':
							$scope.selectedQNA.prev();
							break;
						case 'down':
							$scope.selectedQNA.next();
							break;
						// Topic changed, reset selected qna
						case 'out':
							$scope.selectedQNA.reset();
							break;
						// Do nothing if not recognized
						default:
							break;
					}
				}
				
				$scope.ResponseResult = { 
					unanswered: {
						icon:'record',
						panel:'default'
					}, correct: {
						icon:'ok-circle',
						panel:'success'
					}, wrong: {
						icon:'remove-circle',
						panel:'danger'
					}
				};
				
				$scope.States = { Unanswered: 'unanswered', Correct: 'correct', Wrong: 'wrong' };
				
				$scope.changeState = function(qna, newState) {
					qna.state = newState;
				};
			}
		};
	});

	app.directive('addQna', function() {
		return {
			restrict: 'E',
			templateUrl: 'components/AddQNA.html',
			link: function($scope, $elem, attrs) {
				
			},
			controller: function($scope) {
				$scope.qnaContent;
				
				$scope.addQNA = function() {
					var date = new Date();
					var qna = {
						content: $scope.qnaContent,
						insertDate: date,
						mostRecentModificationDate: date,
						topic: null,
						source: null
					};
					$scope.QNASDB.Insert('qnas', qna, function(key) {
						if(typeof key !== 'undefined') {
							console.log('QNA-' + key, ' added.');
							console.log(qna.content);
						} else { console.log('QNA Insertion Error occurred!'); }
					});
				}
			}
		};
	});
})();