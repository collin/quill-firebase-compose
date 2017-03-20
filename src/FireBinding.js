var FireBinding, FireBindings, _, isEqual,
  slice = [].slice;

_, { isEqual } = require('lodash');

FireBinding = (function() {
  function FireBinding(key1, type1, parent1) {
    this.key = key1;
    this.type = type1;
    this.parent = parent1;
  }

  FireBinding.prototype.extend = function(key, type) {
    return new FireBinding(key, type, this);
  };

  FireBinding.prototype.getDefaultValue = function() {
    return new this.type;
  };

  FireBinding.prototype.getFirebasePath = function(params) {
    var thisKey;
    if (this.key[0] === ':') {
      thisKey = params[this.key.slice(1)];
    } else {
      thisKey = this.key;
    }
    return slice.call(this.getParentFirebasePath(params)).concat([thisKey]);
  };

  FireBinding.prototype.getParentFirebasePath = function(params) {
    if (this.parent) {
      return this.parent.getFirebasePath(params);
    } else {
      return [];
    }
  };

  return FireBinding;

})();

const refs = {};

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAS2EtGceMB0TklrmR1G4_bJLDVN5_QJ50',
  authDomain: 'fb-demo-311d6.firebaseapp.com',
  databaseURL: 'https://fb-demo-311d6.firebaseio.com',
  storageBucket: 'fb-demo-311d6.appspot.com',
  messagingSenderId: '599735752261'
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function getRefTo (path) {
  return database.ref(path);
}

module.exports = FireBindings = {
  create: function(key, type, parent) {
    return new FireBinding(key, type, parent);
  },
  componentWillMount: function() {
    return this.componentWillReceiveProps(this.props);
  },
  componentWillUnmount: function () {
    let specs = this.getFireBindings(this.props);
    Object.keys(specs).forEach((key) => {
      try {
        this.unbind(key);
      }
      catch (error) {
        // pass
      }
    });
  },
  componentWillReceiveProps: function(props) {
    let specs = this.getFireBindings(props);
    if (!this.lastSpecs) {
      this.lastSpecs = {};
    }
    Object.keys(specs).forEach((key) => {
      let spec = specs[key];
      let lastSpec = this.lastSpecs[key];
      if (!lastSpec || lastSpec.path !=spec.path || lastSpec.type != spec.type) {
        try {
          this.unbind(key);
        }
        catch (error) {
          // pass
        }
        let ref;
        if (refs[spec.path]) {
          ref = refs[spec.path];
        }
        else {
          ref = refs[spec.path] = getRefTo(spec.path);
        }
        if (spec.type == Array) {
          this.bindAsArray(ref, key);
        }
        else if (spec.type == Object) {
          this.bindAsObject(ref, key);
        }
      }
    });
    this.lastSpecs = specs;
  },
  getInitialState: function() {
    let state = {};
    let specs = this.getFireBindings(this.props);

    Object.keys(specs).forEach((key) => {
      let spec = specs[key];
      if (spec.type == Array) {
        state[key] = [];
      }
      else if (spec.type == Object) {
        state[key] = {};
      }
    });

    return state;
  }
};
