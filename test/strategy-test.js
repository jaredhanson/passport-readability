var vows = require('vows');
var assert = require('assert');
var util = require('util');
var ReadabilityStrategy = require('passport-readability/strategy');


vows.describe('ReadabilityStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new ReadabilityStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
    },
    
    'should be named readability': function (strategy) {
      assert.equal(strategy.name, 'readability');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new ReadabilityStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        var body = '{ "username": "jdoe", "first_name": "John", "last_name": "Doe", "date_joined": "2010-10-08 12:00:17" }';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'readability');
        assert.equal(profile.displayName, 'John Doe');
        assert.equal(profile.name.familyName, 'Doe');
        assert.equal(profile.name.givenName, 'John');
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new ReadabilityStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        callback(new Error('something went wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
