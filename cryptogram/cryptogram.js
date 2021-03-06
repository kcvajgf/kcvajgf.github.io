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
            if ('A' <= t && t <= 'Z') return 1;
            if ('0' <= t && t <= '9') return 2;
            return 3;
        }
        $scope.keys.sort(function(x, y) {
            var tx = keyType(x);
            var ty = keyType(y);
            if (tx != ty) return tx - ty;
            return (x > y) - (x < y);
        });
    });

    $scope.clearAnswers = function() {
        if ($window.confirm("Are you sure you want to clear your answers?")) {
            $scope.$storage.mapping = {};
        }
    };

    $scope.keys = {};
    $scope.$storage = $localStorage.$default({
            source: "",
            mapping: {},
            caps: true,
        });

    if (!$scope.$storage.source) {
        cryptogram.randomText().then(function(text) {
            $scope.$storage.source = text;
        });
        $scope.$storage.mapping = {};
        $scope.$storage.caps = true;
    }
})

.service('cryptogram', function($http, substituteFilter) {
    var letters = "";
    for (var i = 0; i < 26; i++) { // fugly
        letters += String.fromCharCode(65 + i);
    }

    var choice = function(vals) {
        return vals[Math.floor(Math.random() * vals.length)];
    };

    var shuffle = function(keys) {
        for (var i = 0; i < keys.length; i++) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = keys[i];
            keys[i] = keys[j];
            keys[j] = t;
        }
    };

    var randomCipher = function(text) {
        var keys = [];
        for (var i = 0; i < letters.length; i++) {
            keys.push(letters[i]);
        }
        var cipher = {};
        function makeCipher() {
            shuffle(keys);
            cipher = {};
            for (var i = 0; i < letters.length; i++) {
                if (letters[i] == keys[i]) return false;
                cipher[letters[i]] = keys[i];
            }
            return true;
        }
        while (!makeCipher());
        var newText = [];
        for (var i = 0; i < text.length; i++) {
            newText.push(substituteFilter(text[i], cipher));
        }
        return newText.join("");
    };

    var randomText = function() {
        return $http.get('crypts.json').then(function(crypts) {
            return randomCipher(choice(crypts.data));
        });
    };

    return {
        letters: letters,
        randomText: randomText,
    };
})

.service('mapped', function() {
    return function(x, mapping) {
        x = x.toUpperCase();
        return x in mapping && mapping[x];
    };
})

.filter('cryptClass', function(mapped) {
    return function(x, mapping) {
        return mapped(x, mapping) ? "decrypted" : "crypted";
    };
})

.filter('substitute', function(mapped) {
    return function(x, mapping) {
        if (!mapped(x, mapping)) {
            return x;
        } else if ('a' <= x && x <= 'z') {
            return mapping[x.toUpperCase()].toLowerCase();
        } else if ('A' <= x && x <= 'Z') {
            return mapping[x].toUpperCase();
        } else {
            return mapping[x];
        }
    }
})

.filter('maybeCaps', function() {
    return function(letter, toCap) {
        if (toCap) letter = letter.toUpperCase();
        return letter;
    }
})
