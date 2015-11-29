(function () {
  'use strict';

  function CrossDomainStorage(url, opts, $q, $log) {
    var vm = this
      , serviceName = 'angular-cross-storage.CrossDomainStorage.'
      , _storage;

    vm.connect = connect;
    vm.set = setValue;
    vm.get = getValue;
    vm.del = removeKey;
    vm.clear = clearAll;

    function connect() {
      var deferred = $q.defer()
        , caller = 'connect';
      angular.element(document).ready(function () {
        if (CrossStorageClient) {
          var storage = new CrossStorageClient(url, opts);
          storage
            .onConnect()
            .then(function () {
              var msg = 'Cross Local Storage Connected to URL ' + url;
              resolve(deferred, caller, msg, null, opts);
              _storage = storage;
            })
            .catch(function (err) {
              var msg = 'Could not connect to the Cross Domain Local Storage Hub on URL ' + url;
              rejectWithError(deferred, caller, err, msg);
            });
        } else {
          var err = 'Error: angular-cross-storage module depends on ZenDesk Cross-Storage Library';
          rejectWithError(deferred, caller, err);
        }
      });
      return deferred.promise;
    }

    function setValue(key, value) {
      var deferred = $q.defer()
        , caller = 'set';
      if (isConnected (caller, deferred)) {
        if (key) {
          _storage
            .set(key, value)
            .then(function () {
              var msg = 'You have successfully stored value: \'' + value + '\' for key: \'' + key + '\'';
              resolve(deferred, caller, msg);
            })
            .catch(function (err) {
              var msg = 'Could not store value for key \'' + key + '\'';
              rejectWithError(deferred, caller, err, msg);
            });
        } else {
          var err = 'Error: You must enter a key';
          rejectWithError(deferred, caller, err);
        }
      }
      return deferred.promise;
    }

    function getValue(key) {
      var deferred = $q.defer()
        , caller = 'get';
      if (isConnected (caller, deferred)) {
        if (key) {
          _storage
            .get(key)
            .then(function (value) {
              var msg = 'You have successfully retrieved value: \'' + value + '\' for key: \'' + key + '\'';
              resolve(deferred, caller, msg, value);
            })
            .catch(function (err) {
              var msg = 'Could not get value for key \'' + key + '\'';
              rejectWithError(deferred, caller, err, msg);
            });
        } else {
          var err = 'You must enter a key to get a value';
          rejectWithError(deferred, caller, err);
        }
      }
      return deferred.promise;
    }

    function removeKey(key) {
      var deferred = $q.defer()
        , caller = 'del';
      if (isConnected (caller, deferred)) {
        if (key) {
          _storage
            .del(key)
            .then(function () {
              var msg = 'You have successfully removed key \'' + key + '\'';
              resolve(deferred, caller, msg);
            })
            .catch(function (err) {
              var msg = 'Could not remove the key \'' + key + '\'';
              rejectWithError(deferred, caller, err, msg);
            });
        } else {
          var err = 'You must enter a key which you want to remove';
          rejectWithError(deferred, caller, err);
        }
      }
      return deferred.promise;
    }

    function clearAll() {
      var deferred = $q.defer()
        , caller = 'clear';
      if (isConnected (caller, deferred)) {
        _storage
          .clear()
          .then(function () {
            var msg = 'You have successfully cleared Cross Domain Local Storage';
            resolve(deferred, caller, msg);
          })
          .catch(function (err) {
            var msg = 'Could not clear Cross Domain Local Storage';
            rejectWithError(deferred, caller, err, msg);
          });
      }
      return deferred.promise;
    }

    function rejectWithError(deferred, caller, err, msg) {
      $log.error([serviceName + caller + ':', msg, msg ? 'with ' + err : err].join(' '));
      deferred.reject({status: 'error', error: err});
    }

    function resolve(deferred, caller, msg, value, opts) {
      $log.debug([serviceName + caller + ':', msg, opts ? 'with options:' : ''].join(' '), opts || '');
      var result = {status: 'success', message: msg};
      if (value) result.value = value;
      deferred.resolve(result);
    }

    function isConnected (caller, deferred) {
      if (!!_storage) {
        return true;
      } else {
        var err = 'Cannot perform any actions with Cross Local Storage -- it is not connected yet';
        rejectWithError(deferred, caller, err);
        return false;
      }
    }
  }

  CrossDomainStorageProvider.$inject = [];
  /* @ngInject */
  function CrossDomainStorageProvider() {
    var $log =  angular.injector(['ng']).get('$log');
    var vm = this
      , _url
      , _opts = {};

    vm.$get = $get;
    vm.setOptions = setOptions;

    function setOptions(opts) {
      opts = opts || {};
      if (opts.frameId) _opts.frameId = opts.frameId;
      if (opts.timeout) _opts.timeout = opts.timeout;
      if (opts.url) {
        _url = opts.url;
      } else {
        $log.error('You should specify option url -- The URL to a cross storage hub');
      }
    }

    $get.$inject = ['$q', '$log'];
    /* @ngInject */
    function $get($q, $log) {
      return new CrossDomainStorage(_url, _opts, $q, $log);
    }
  }

  angular
    .module('angular-cross-storage', [])
    .provider('CrossDomainStorage', CrossDomainStorageProvider);

})();
