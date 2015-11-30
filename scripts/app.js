/* The MIT License (MIT)

 * Copyright (c) 2015 Skoth

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function refreshCodeEditor(lang) {
	window.codeEditor = ace.edit("codeEditor");
	window.codeEditor.setTheme("ace/theme/monokai");
	window.codeEditor.getSession().setMode("ace/mode/" + lang);
}

function refreshMathJax() {
	MathJax.Hub.Typeset();
}

function pasteTextFormatter(txt) {
	return txt.replace(/\n\n.+/gi, '');
}

(function () {
	var app = angular.module('Vulcan', ['ngRoute', 'ngSanitize', 'textAngular']);
	// test new system
	app.config(function ($routeProvider, $locationProvider) {
		// Removes hash from routing (?)
		// $locationProvider.html5Mode(true);
		
		$routeProvider
			.when('/', {
				templateUrl: 'Base.html',
				controller: 'mainController'
			})
			.when('/quiz', {
				templateUrl: 'components/QNAs.html',
				controller: 'mainController',
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
	app.config(function ($provide) {
		$provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
			// Code entry toolbar button
			taRegisterTool('Ace', {
				iconclass: 'fa fa-terminal',
				action: function () {
					var self = this;
					if ($('#codeModal').length === 0) {
						$('body').append('' +
							'<div id="codeModal" class="modal fade">' +
							'<div class="modal-dialog">' +
							'<div class="modal-content">' +
							'<div class="modal-header">' +
							'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
							'<h4 class="modal-title text-center">Code Preview</h4>' +
							'<select id="languages" class="form-control"></select>' +
							'</div>' +
							'<div class="modal-body">' +
							'<div id="codeEditor" style="width:100%; height: 350px;"></div>' +
							'</div>' +
							'<div class="modal-footer">' +
							'<button id="cancelCodeBtn" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
							'<button id="insertCodeBtn" type="button" class="btn btn-primary" data-dismiss="modal">Insert</button>' +
							'</div>' +
							'</div>' +
							'</div>' +
							'</div>' +
							'');
						//$('#languages').append('herro!');
						$('#codeModal').modal({
							show: false,
							keyboard: true
						});


						$('#insertCodeBtn').on('click', function () {
							var html = self.$editor().html;
							self.$editor().html = html + $('#codeEditor')[0].outerHTML;
						});
					}
					$('#codeModal').modal('show');

					var siHash = null;

					$('#codeModal').on('shown.bs.modal', function () {
						if (typeof ace !== 'undefined') {
							refreshCodeEditor($('select.languages').val());
							
							// Hideous hack to negate blur bug after first character entry on
							// ace (also mandates focus on ace--as opposed to textAngular--when 
							// the modal is displayed)
							siHash = setInterval(function() {
								console.log('focus');
								$('#codeEditor textarea').focus();
							}, 200);
						}
						else {
							console.log('Error loading ace');
						}
						console.log('Code modal displayed.');
						// $('#codeEditor').focus();
					});
					
					$('#codeModal').on('hide.bs.modal', function() {
						clearInterval(siHash);
					});
				}
			});
			taOptions.toolbar[2].push('Ace');
			
			// Math entry toolbar button
			taRegisterTool('MathJax', {
				iconclass: 'fa fa-superscript',
				action: function () {
					window.self = self;
					var self = this;
					if ($('#mathModal').length === 0) {
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
							'<div class="pull-left"><input id="inlineEqn" type="checkbox" /> Inline Equation </div>' +
							'<button id="cancelCodeBtn" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>' +
							'<button id="insertEqnBtn" type="button" class="btn btn-primary" data-dismiss="modal">Insert</button>' +
							'</div>' +
							'</div>' +
							'</div>' +
							'</div>' +
							'');
						$('#mathModal').modal({
							show: false,
							keyboard: true
						});


						$('#insertEqnBtn').on('click', function () {
							var eqn = document.getElementById('eqnTextInput').value;
							var html = self.$editor().html;
							var isInline = document.getElementById('inlineEqn').checked;
							self.$editor().html = (isInline) ? html + "$$" + eqn + "$$" : html + "$" + eqn + "$";
							self.$editor.focussed = true;
							// TODO: use rangy/selection API to insert math content back in text-angular
						});

						$('#eqnTextInput').on('keyup', function () {
							$('#renderedEqn').text('$$' + $(this).val().trim() + '$$');
							refreshMathJax();
						});
					}
					self.$editor.focussed = false;
					$('#mathModal').modal('show');
					$('*:focus').blur();

					$('#mathModal').on('shown.bs.modal', function () {
						console.log('Math modal displayed.');
					})

					// self.$editor().wrapSelection('forecolor', 'azure');
				}
			});
			taOptions.toolbar[2].push('MathJax');

			return taOptions;
		}]);
	});
	
	// IndexedDB Factory Service
	app.factory('qnasDBFactory', ['$q', function ($q) {
		var QNASDB = null,
			self = this;

		self.OpenDB = function () {
			var deferred = $q.defer(),
				version = 1;
			var openRequest = indexedDB.open('QNASDB_' + version, version);

			openRequest.onupgradeneeded = function (e) {
				QNASDB = e.target.result;
				e.target.transaction.onerror = indexedDB.onerror;
				
				// TODO: backup for data existing before upgrade
				// (instead of completely deleting)??
				if (QNASDB.objectStoreNames.contains('qnas')) {
					QNASDB.deleteObjectStore('qnas');
				}
				if (QNASDB.objectStoreNames.contains('topics')) {
					QNASDB.deleteObjectStore('topics');
				}

				QNASDB.createObjectStore('qnas', { autoIncrement: true });
				QNASDB.createObjectStore('topics', { autoIncrement: true });
			};

			openRequest.onsuccess = function (e) {
				QNASDB = e.target.result;
				deferred.resolve(e);
			}

			openRequest.onerror = function () {
				deferred.reject(e);
			}

			return deferred.promise;
		};
		
		/*
		self.Select = function(topic) {
			var deferred = $q.defer();
			
			if (QNASDB === null) deferred.reject('Error: indexedDB unavailable');
			else {
				var transaction = QNASDB.transaction(['qnas'], 'readonly');
				var qnasStore = transaction.objectStore('qnas');
				var qnas = [];
				
				var keyRange = IDBKeyRange.lowerBound(0);
				var qnasRequest = qnaStore.openCursor(keyRange);
				
				qnasRequest.onsuccess = function(e) {
					var qnasCursor = e.target.result;
					if (typeof qnasCursor === 'undefined' || qnasCursor === null)
						console.log('qnasCursor conditional');
					else {
						qnas.push({ })
					}
				}
			}
		}
		*/

		self.SelectAll = function () {
			var deferred = $q.defer();

			if (QNASDB === null) deferred.reject('Error: indexedDB unavailable.');
			else {
				// test if qnas & topics combined in array yields results of both
				var transaction = QNASDB.transaction(['qnas', 'topics'], 'readonly');
				var qnasStore = transaction.objectStore('qnas');
				var topicsStore = transaction.objectStore('topics');
				var netData = { qnas: [], topics: {} };

				var keyRange = IDBKeyRange.lowerBound(0);
				// IDBObjectStore.openCursor() returns IDBRequest object
				var qnasRequest = qnasStore.openCursor(keyRange);
				var topicsRequest = topicsStore.openCursor(keyRange);

				qnasRequest.onsuccess = function (e) {
					var qnasCursor = e.target.result;
					if (typeof qnasCursor === 'undefined' || qnasCursor === null)
						console.log('qnasCursor conditional'); 
					//deferred.resolve(topics, qnas);
					else {
						netData.qnas.push({ 'key': qnasCursor.key, 'data': qnasCursor.value });
						qnasCursor.continue();
					}
				};

				qnasRequest.onerror = function (e) {
					console.log('qnasRequest error: ', e.value);
					deferred.reject('qnasRequest error!');
				};

				topicsRequest.onsuccess = function (e) {
					var topicsCursor = e.target.result;
					if (typeof topicsCursor === 'undefined' || topicsCursor === null) {
						console.log('topicsCursor conditional');
						deferred.resolve(netData);
					} else {
						netData.topics[topicsCursor.key] = topicsCursor.value;
						topicsCursor.continue();
					}
				};

				topicsRequest.onerror = function (e) {
					console.log('topicsRequest error: ', e.value);
					deferred.reject('topicsRequest error!');
				}
			}
			return deferred.promise;
		};
		self.InsertQNA = function (qna) {
			var deferred = $q.defer();

			if (QNASDB === null) deferred.reject('Error: Database unavailable.');
			else {
				// IDBTransaction (handlers: oncomplete, onabort, onerror)
				var transaction = QNASDB.transaction(['qnas'], 'readwrite');
				var store = transaction.objectStore('qnas');
				var addRequest = store.add(qna); // returns IDBRequest (handlers: onsuccess, onerror)
				
				addRequest.onsuccess = function (e) {
					deferred.resolve(e);
				}
				addRequest.onerror = function (e) {
					deferred.reject(e);
				}
			}
			return deferred.promise;
		};
		self.UpdateQNA = function (key, qna) {
			var deferred = $q.defer();

			if (QNASDB === null) deferred.reject('Error: Database unavailable.');
			else {
				var transaction = QNASDB.transaction(['qnas'], 'readwrite');
				var store = transaction.objectStore('qnas');
				var getRequest = store.get(key);

				getRequest.onsuccess = function (e) {
					var updateTarget = e.target.result;
					if (typeof updateTarget !== 'undefined') {

					}
				}
			}
		}

		return self;
	}]);

	app.directive('navMenu', function () {
		return {
			restrict: 'E',
			templateUrl: 'components/Menu.html',
			controller: function ($scope) {
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
				$scope.topicMenuBuilder = function (obj) {
					var str = '';
					for (var prop in obj) {
						if (typeof obj[prop] === 'string')
							str += '<li><a style="cursor:pointer">' + obj[prop] + '</a></li>';
						else if (typeof obj[prop] === 'object')
							str += '<li class="dropdown-submenu"><a style="cursor:pointer">' + prop + '</a><ul class="dropdown-menu">' +
							$scope.topicMenuBuilder(obj[prop]) + '</ul></li>';
						else
							throw ': Invalid property type';
					} return str;
				}
				$scope.selectedTopic = 'All Topics';

				var topicsDropdown = '<ul class="dropdown-menu" role="menu">' +
					$scope.topicMenuBuilder($scope.topics) + '</ul>';
				$(topicsDropdown).insertAfter('.navbar-left li.dropdown a');

				$('ul.dropdown-menu li.dropdown-submenu a').click(function () {
					console.log($(this).text());
					$('a.dropdown-toggle').html($(this).text().trim() +
						' <span class="caret"></span>').data('topic', $(this).text());
				});
			}
		};
	});

	app.controller('mainController', function ($scope, $route, qnasDBFactory) {

		$scope.$route = $route;

		$scope.netData;

		$scope.updateMode = false;
		
		// <indexedDB-interface-code>
		$scope.getData = function () {
			qnasDBFactory.SelectAll().then(function (result) {
				$scope.netData = result;
				window.$netData = result;
			}, function (error) {
				console.log(error);
			});
		};

		$scope.selectedTopic = null;

		$scope.addQNA = function (qnaMdlVal) {
			console.log('addQNA()');
			var date = new Date();
			var qna = {
				content: qnaMdlVal,
				insertDate: date,
				mostRecentModificationDate: date,
				topic: [$scope.selectedTopic],
				source: null
			};

			qnasDBFactory.InsertQNA(qna).then(function (result) {
				window.ress = result;
				console.log(result);
			}, function (error) {
				console.log(error);
			});
		};

		function init() {
			qnasDBFactory.OpenDB().then(function () {
				//refresh
				$scope.getData();
			});
		}
		// </indexedDB-interface-code>
		
		
		
		init();
	});

	app.directive('qnas', function () {
		return {
			restrict: 'E',
			templateUrl: 'components/QNAs.html',
			link: function ($scope, $elem, attrs) {

			},
			controller: function ($scope, qnasDBFactory) {
				$scope.loc = $scope.$route;
				$scope.$watch('loc', function (newVal, oldVal) {
					console.log(newVal, oldVal);
				});
				$scope.qnaSet = [];
				$scope.selectedQNA = {
					qna: null,
					prev: function () {

					},
					next: function () {

					},
					reset: function () {

					}
				};

				$scope.changeQNA = function (dir) {
					switch (dir) {
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
						icon: 'record',
						panel: 'default'
					}, correct: {
						icon: 'ok-circle',
						panel: 'success'
					}, wrong: {
						icon: 'remove-circle',
						panel: 'danger'
					}
				};

				$scope.States = { Unanswered: 'unanswered', Correct: 'correct', Wrong: 'wrong' };

				$scope.changeState = function (qna, newState) {
					qna.state = newState;
				};
				
				$scope.updateQNAList = function() {
					console.log('updateQNAList');
					qnasDBFactory.SelectAll().then(function (result) {
						if(result.hasOwnProperty('qnas') && Array.isArray(result.qnas)) {
							$scope.qnaSet = result.qnas;
						}
						window.ress = result;
						console.log(result);
					}, function(error) {
						console.error(error);
					});
				};
			}
		};
	});

	app.directive('topicSelector', function() {
		return {
			restrict: 'E',
			scope: {
				'mainController': '@main'
			},
			templateUrl: 'components/TopicSelector.html',
			link: function($scope, $elem, attrs) {
				
			},
			controller: function ($scope, $compile, $route, qnasDBFactory) {
				$scope.newTopicEntry = function($event) {
					window.newDataThing = $event.currentTarget;
					var newTopicButton = $event.currentTarget.parentElement;
					var txtTopicEntry = $event.currentTarget.parentElement;
					var newTopicButton = txtTopicEntry.cloneNode(true);
					txtTopicEntry.innerHTML = '';
					var txtInputTopic = '<input class="form-control" focuser="focusInput" ng-focus="true" ng-keyup="$event.keyCode == 13 && submitTopicEntry($event)" />'
					var cmplResult = $compile(txtInputTopic)($scope);
					angular.element(txtTopicEntry).append(cmplResult);
					txtTopicEntry.parentElement.appendChild(newTopicButton);
					$compile(newTopicButton)($scope);
				};
				
				$scope.submitTopicEntry = function($event) {
					var txtTopicEntry = $event.currentTarget;
					txtTopicEntry.parentElement.classList.add('column');
					txtTopicEntry.parentElement.classList.remove('lastEntry', 'text-center');
					txtTopicEntry.setAttribute('draggable', 'true');
					var topic = txtTopicEntry.value;
					txtTopicEntry.outerHTML = '<a href="#">' + topic + '</a>';
				};
				
				$scope.selectedTopic = '';
				
				$scope.initAddTopic = function(lastElem, elem) {
					if (typeof $scope.initAddTopic.myVar === 'undefined' && lastElem) {
						window.firstLastThing = elem;
						$scope.initAddTopic.myVar = 1;
					} else {
						return false;
					}
				};
				
				$scope.updateTopic = function($event) {
					console.log($event.currentTarget.innerText + 'topic updated!');
					$scope.selectedTopic = $event.currentTarget.innerText;
					console.log($scope.selectedTopic);
				};
				
				$scope.topics = {
					name: 'Topics', // Main "super topic" based on which all others are subtopics
					subtopics: [
						{ 
							name: 'Physics',
							subtopics: []
						},
						{
							name: 'Chemistry',
							subtopics: []
						},
						{
							name: 'ECE',
							subtopics: [
								{
									name: 'Digital Logic',
									subtopics: []
								},
								{
									name: 'Communications',
									subtopics: [
										{
											name: 'Digital Communications',
											subtopics: []
										},
										{
											name: 'Analog Communications',
											subtopics: [
												{
													name: 'Amplitude Modulation',
													subtopics: []
												},
												{
													name: 'Angle Modulation',
													subtopics: []
												}
											]
										}
									]
								}
							]
						},
					]
				};
				
				$scope.focusInput = true;
			}
		};
	});

	app.directive('focuser', function($timeout) {
		return {
			link: function($scope, elem, attrs) {
				$scope.$watch(attrs.focuser, function(val) {
					if(val === true) {
						console.log('value=', val);
						elem[0].focus();
						$scope[attrs.focuser]
					}
				});
			}
		};
	});

	app.directive('addQna', function () {
		return {
			restrict: 'E',
			templateUrl: 'components/AddQNA.html',
			link: function ($scope, $elem, attrs) {
				
			},
			controller: 'mainController'
		};
	});
	
	app.directive('draggableTopic', function($compile) {
		return {
			restrict: 'A',
			scope: {
				dragging: '&'
			},
			link: function($scope, $elem, $attrs, $ctrl) {
				angular.element($elem).attr('draggable', 'true');
				
				// $scope.$watch($attrs.draggableTopic, function(html) {
				// 	$elem.html(html);
				// 	$compile($elem.contents())($scope);
				// })
				
				//??
				$('.dropdown-menu .lastEntry').click(function(e) {
					e.stopPropagation();
				});
				
				var dragSrcEl = null;

				function handleDragStart(e) {
					dragSrcEl = this;
					if($(dragSrcEl).next().length) {
						// $(dragSrcEl).next().prop('disabled', true);
						$(dragSrcEl).next().slideUp();
					}
					
					e.dataTransfer.effectAllowed = 'move';
					
					e.dataTransfer.setData('text/html', this.innerHTML); 
					this.classList.add('moving');
				}
				
				// MDN: The dragover event is fired when an element or text selection is being dragged 
				// over a valid drop target (every few hundred milliseconds).
				function handleDragOver(e) {
					// if(e.preventDefault) {
					// 	e.preventDefault();
					// }
					
					// if(this.dataset.order && this.dataset.order.indexOf(dragSrcEl.dataset["order"]) > -1) { 
					// 		console.log('Invalid target!');
					// } else {
					// 	console.log('Valid target!');
					// }
					//console.log('dragover: x = ' + e.x + ', y = ' + e.y);
					//console.log(this.innerHTML) // Do we get the dragInitiator or the over-element?
					e.dataTransfer.dropEffect = 'move';
					
					return false;
				}
				
				// MDN: The dragenter event is fired when a dragged element or text selection enters a 
				// valid drop target.
				function handleDragEnter(e) {
					// if within 3/5 boundary, add sub category parameter list or eat 
					//console.log('dragenter: x = ' + e.x + ', y = ' + e.y);
					//console.log(this.innerHTML) // Do we get the dragInitiator or the over-element?
					this.classList.add('over');
				}
				
				function handleDragLeave(e) {
					this.classList.remove('over');
				}
				
				function handleDrop(e) {
					// if(e.stopPropagation) {
					// 	e.stopPropagation();
					// }
					e.preventDefault();
					this.classList.remove('over');
					
					if(dragSrcEl != this) {
						$(dragSrcEl).parent().html(this.innerHTML);
						$(this).html(e.dataTransfer.getData('text/html'));
						// dragSrcEl.innerHTML = this.innerHTML;
						// this.innerHTML = e.dataTransfer.getData('text/html');
					}
					// Insert Topics Data Structure into IndexedDB here
					return false;
				}
				
				function handleDragEnd(e) {
					if($(dragSrcEl).next().length) {
						// $(dragSrcEl).next().prop('disabled', false);
						$(dragSrcEl).next().slideDown();
					}
					[].forEach.call(cols, function(col) {
						col.classList.remove('over');
						col.classList.remove('moving');
					});
				}
				
				var cols = document.querySelectorAll('#topics a[draggable-topic]');
				[].forEach.call(cols, function(col) {
					col.addEventListener('dragstart', handleDragStart, false);
					col.addEventListener('dragenter', handleDragEnter, false);
					col.addEventListener('dragover', handleDragOver, false);
					col.addEventListener('dragleave', handleDragLeave, false);
					col.addEventListener('drop', handleDrop, false);
					col.addEventListener('dragend', handleDragEnd, false);
				});
			}
		};
	});
	
	app.directive('d3jsGraph', function() {
		return {
			restrict: 'E',
			templateUrl: 'components/D3JSGraph.html',
			link: function($scope, $elem, $attrs) {
				var data = [
					{
						'day':'3',
						'tasks':'6'
					},
					{
						'day':'5',
						'tasks':'2'
					},
					{
						'day':'9',
						'tasks':'13'
					},
					{
						'day':'10',
						'tasks':'3'
					},
					{
						'day':'12',
						'tasks':'4'
					},
					{
						'day':'17',
						'tasks':'15'
					},
					{
						'day':'18',
						'tasks':'11'
					},
					{
						'day':'20',
						'tasks':'8'
					},
					{
						'day':'22',
						'tasks':'4'
					},
					{
						'day':'25',
						'tasks':'6'
					},
					{
						'day':'28',
						'tasks':'7'
					},
				];
					
				var w = 800, h = 600
				var margin = {
					top:15, right: 15, bottom: 15, left: 15
				};
				
				var xScale = d3.scale.linear()
					.domain([0, d3.max(data, function(d) { return d['day']; })])
					.range([margin.left, w - margin.right]);
				var yScale = d3.scale.linear()
					.domain([0, d3.max(data, function(d) { return d['tasks']; })])
					.range([h - margin.top, margin.bottom]);
				var xAxis = d3.svg.axis().scale(xScale);
				var yAxis = d3.svg.axis().scale(yScale); 
				
				var svg = d3.select('#d3Container').append('svg')
					.attr('width', w)
					.attr('height', h)
					.append('g')
						.attr('transform', 'translate(' + w - margin.left + ',' + h - margin.bottom + ')');
						
				// X-Axis
				svg.append('g')
			},
			controller: function($scope) {
				
			}
		};
	})
})();