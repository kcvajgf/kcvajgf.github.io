angular.module('cryptogram', ['ngRoute', 'ngStorage'])

 
.config(function($routeProvider) {
 
  $routeProvider
    .when('/', {
      controller:'CryptController',
      templateUrl:'crypt.html',
    })
    .otherwise({
      redirectTo:'/'
    });
})

.controller('CryptController', function($window, $scope, $localStorage, cryptogram) {

    $scope.keys = {};
    var mapped = function(x) {
        x = x.toUpperCase();
        return x in $scope.$storage.mapping && $scope.$storage.mapping[x];
    }
    $scope.cryptClass = function(x) {
        return mapped(x) ? "decrypted" : "crypted";
    }
    $scope.decrypt = function(x) {
        if (!mapped(x)) {
            return x;
        } else if ('a' <= x && x <= 'z') {
            return $scope.$storage.mapping[x.toUpperCase()].toLowerCase();
        } else if ('A' <= x && x <= 'Z') {
            return $scope.$storage.mapping[x].toUpperCase();
        } else {
            return $scope.$storage.mapping[x];
        }
    }
    $scope.$watch('$storage.source', function(source) {
        var keys = {' ': 1, '\n': 1, '\t': 1};
        $scope.keys = [];
        var keySource = (cryptogram.letters + source).toUpperCase();
        for (var i = 0; i < keySource.length; i++) {
            if (!(keySource[i] in keys)) {
                keys[keySource[i]] = 1;
                $scope.keys.push(keySource[i]);
            }
        }
        var keyType = function(t) {
            if ('A' <= t && t <= 'Z') {
                return 1;
            }
            if ('0' <= t && t <= '9') {
                return 2;
            }
            return 3;
        }
        $scope.keys.sort(function(x, y) {
            var tx = keyType(x);
            var ty = keyType(y);
            if (tx < ty) return -1;
            if (tx > ty) return +1;
            if (x < y) return -1;
            if (x > y) return +1;
            return 0;
        });
    })

    $scope.reset = function() {
        if ($window.confirm("Are you sure?")) {
            $scope.$storage.mapping = {};
        }
    };

    $scope.$storage = $localStorage.$default({
            source: "",
            mapping: {},
        });

    if (!$scope.$storage.source) {
        cryptogram.randomText().then(function(text) {
            $scope.$storage.source = text;
        });
        $scope.$storage.mapping = {};
    }
})

.service('cryptogram', function($http) {
    var letters = "";
    for (var i = 0; i < 26; i++) { // fugly
        letters += String.fromCharCode(65 + i);
    }

    var choice = function(vals) {
        return vals[Math.floor(Math.random() * vals.length)];
    };


    var randomCipher = function(text) {
        var keys = [];
        for (var i = 0; i < letters.length; i++) {
            keys.push(letters[i]);
        }
        var cipher = {};
        function makeCipher() {
            for (var i = 0; i < keys.length; i++) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = keys[i];
                keys[i] = keys[j];
                keys[j] = t;
            }
            cipher = {};
            for (var i = 0; i < letters.length; i++) {
                if (letters[i] == keys[i]) return false;
                cipher[letters[i]] = keys[i];
            }
            return true;
        }
        while (!makeCipher());
        for (var i = 0; i < letters.length; i++) {
            console.log(letters[i], cipher[letters[i]]);
        }
        var newText = [];
        for (var i = 0; i < text.length; i++) {
            var x = text[i];
            if (x.toUpperCase() in cipher && cipher[x.toUpperCase()]) {
                if ('a' <= x && x <= 'z') {
                    x = cipher[x.toUpperCase()].toLowerCase();
                } else if ('A' <= x && x <= 'Z') {
                    x = cipher[x].toUpperCase();
                } else {
                    x = cipher[x];
                }
            }
            newText.push(x);
        }
        return newText.join("");
    };

    var randomText = function() {
        return $http.get('crypts.json').then(function(crypts) {
            return randomCipher(choice(crypts.data));
        });
    }

    return {
        letters: letters,
        randomText: randomText,
    }
})
