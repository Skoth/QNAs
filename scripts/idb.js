// idb.js: generalized wrapper for IndexedDB
// Author: Keith Johnson
// Date:   03/21/2015
// Inspired by Craig Shoemaker's "HTML5 Web Storage, IndexedDB and File System"
// course on PluralSight
// Example initialization:
// var todoDB = new IDB('TODODB', 1, { tasks:'tasks' });
// todoDB.OpenDatabase('tasks');

function IDB(dbName, indexes, versionNum, dbStoreNames) {
	var db = {
		name: dbName,
		version: versionNum,
		instance: {},
		storeNames: dbStoreNames,
		indexes: indexes,
		defaultErrorHandler: function(e) {
			console.log(e);
		},
		setDefaultErrorHandler: function(request) {
			if('onerror' in request) {
				request.onerror = this.defaultErrorHandler
			}
			if('onblocked' in request) {
				request.onblocked = this.defaultErrorHandler;
			}
		}
	};

	var ReadyForTransaction = false;

	this.OpenDatabase = function(storeName, initCallback) {
		var openRequest = window.indexedDB.open(db.name, db.version);
			
		// For non-existent database, onupgradeneeded event fired:
		openRequest.onupgradeneeded = function(e) {
			console.log('Upgrade Needed');
			var newVersion = e.target.result;
			
			if(!newVersion.objectStoreNames.contains(db.storeNames[storeName])) {
				console.log('Creating ' + storeName + ' store');
				var store = newVersion.createObjectStore(db.storeNames[storeName], { autoIncrement: true });
				db.indexes.forEach(function(index) {
					store.createIndex(index.name, index.on, index.specs);
				});
			}
		};
		
		db.setDefaultErrorHandler(openRequest);
		openRequest.onsuccess = function(e) {
			db.instance = e.target.result;
			console.log('The "' + db.name + '" database opened successfully');
			ReadyForTransaction = true;
			initCallback();
		};
	};

	this.SearchAgainstIndex = function(storeName, indexName, query, callback) {
		var transaction = db.instance.transaction([db.storeNames[storeName]], 'readonly');
		var store = transaction.objectStore(db.storeNames[storeName]);
		var index = store.index(indexName);
		var request = index.get(query);

		request.onsuccess = function() {
			callback(request.result);
		}
	};

	this.TransactionFail = function(err) {
		if(!ReadyForTransaction)
			console.log('Database not ready for transaction to occur.');
		console.log(err);
	};

	this.Import = function() {
		
	};
	
	this.Export = function() {
		
	}

	// SELECT
	this.Select = function(storeName, key, callback) {
		if(ReadyForTransaction) {
			var transaction = db.instance.transaction([db.storeNames[storeName]], 'readonly');
			
			var store = transaction.objectStore(db.storeNames[storeName]);
			var getRequest = store.get(key);
			
			db.setDefaultErrorHandler(getRequest);
			
			getRequest.onsuccess = function(e) {
				var tuple = e.target.result;
				if(typeof tuple !== 'undefined') {
					callback(tuple);
				} else {
					console.log('A ' + storeName + ' with key ' + key + ' does not exist.');
				}
			};
			
		} else this.TransactionFail('SELECT failed');
	};

	// SELECT *
	this.SelectAll = function(storeName, callback) {
		if(ReadyForTransaction) {
			var transaction = db.instance.transaction(db.storeNames[storeName], 'readonly');
			var store = transaction.objectStore(db.storeNames[storeName]);
			var tuples = {};
			
			var cursorRequest = store.openCursor();
			
			cursorRequest.onerror = function(err) {
				console.log('dbSelectAll cursorRequest onerror: ' + err);
			};
			cursorRequest.onsuccess = function(e) {
				var cursor = e.target.result;
				if(cursor) {
					tuples[cursor.key] = cursor.value;
					cursor.continue();
				}
			};
			transaction.oncomplete = function(e) {
				callback(tuples);
			};
		} else this.TransactionFail('SELECT * failed');
	};
		
	// INSERT
	this.Insert = function(storeName, data, callback) {
		if(ReadyForTransaction) {
			var transaction = db.instance.transaction([db.storeNames[storeName]], 'readwrite');
			var store = transaction.objectStore(db.storeNames[storeName]);
			var addRequest = store.add(data);
			
			db.setDefaultErrorHandler(addRequest);
			
			addRequest.onsuccess = function(e) {
				callback(e.target.result);
			};	
			
			addRequest.onerror = this.TransactionFail;

		} else this.TransactionFail('INSERT failed');
	};
		
	// UPDATE
	this.Update = function(storeName, key, data, callback) {
		if(ReadyForTransaction) {
			// Note: UPDATE requires get request followed by put request
			var transaction = db.instance.transaction([db.storeNames[storeName]], 'readwrite');
			var store = transaction.objectStore(db.storeNames[storeName]);
			var getRequest = store.get(key);
			
			db.setDefaultErrorHandler(getRequest);
			
			getRequest.onsuccess = function(e) {
				var item = e.target.result;
				if(typeof item !== 'undefined') {
					item = data;
					var putRequest = store.put(item, key);
					db.setDefaultErrorHandler(putRequest);
					putRequest.onsuccess = function(e) {
						callback(true);
					}
				}
			};
		} else this.TransactionFail('UPDATE failed');
	};

	// DELETE
	this.Delete = function(storeName, key, callback) {
		if(ReadyForTransaction) {
			var transaction = db.instance.transaction([db.storeNames[storeName]], 'readwrite');
			var store = transaction.objectStore(db.storeNames[storeName]);
			deleteRequest = store.delete(key);
			
			db.setDefaultErrorHandler(deleteRequest);
			
			deleteRequest.onsuccess = function(e) {
				callback(true);
			}
		} else this.TransactionFail('DELETE failed');
	};
};