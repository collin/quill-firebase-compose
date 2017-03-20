import React, { Component } from 'react';
import styles from './styles.scss';
import ReactFire from 'reactfire';
import FireBinding from './FireBinding';
const StateMixins = [ReactFire, FireBinding];
import Editor from './Editor';

const Thing = React.createClass({
  mixins: StateMixins,

  getFireBindings (props) {
    return {
      thing: {
        path: `things/${props.thingId}`,
        type: Object
      },
    };
  },

  deleteThing () {
    this.firebaseRefs.thing.remove();
  },

  updateThingTitle (event) {
    this.firebaseRefs.thing.child('title').set(event.target.value);
  },

  render () {
    return (
      <div>
        <input
          value={this.state.thing.title}
          onChange={this.updateThingTitle}
        />
        <button onClick={this.deleteThing}>
          &times;
        </button>
      </div>
    );
  },
});

export const App = React.createClass({
  mixins: StateMixins,

  getFireBindings () {
    return {
      things: {
        path: 'things',
        type: Array,
      },
    };
  },

  addThing () {
    this.firebaseRefs.things.push({ title: `Thing #${Math.random()}` });
  },

  render () {
    return (
      <div>
        <Editor
          firebasePath='quill-editor-test'
        />
        <button
          onClick={this.addThing}
        >
          Add a Thing
        </button>
        <ol>
          {
            this.state.things.map((thing) => {
              return <li><Thing thingId={thing['.key']}/></li>;
            })
          }
        </ol>
      </div>
    );
  }
});
