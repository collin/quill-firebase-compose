import React from 'react';
import ReactFire from 'reactfire';
import FireBinding from './FireBinding';
import Quill from './Quill';
const StateMixins = [ReactFire, FireBinding];

import Delta from 'rich-text/lib/delta';

let Inline = Quill.import('blots/inline');

class BoldBlot extends Inline { }
BoldBlot.blotName = 'bold';
BoldBlot.tagName = 'strong';

class ItalicBlot extends Inline { }
ItalicBlot.blotName = 'italic';
ItalicBlot.tagName = 'em';

Quill.register(BoldBlot);
Quill.register(ItalicBlot);

/*
  This is difficult to get right.

  Editor Init:
    [x] BLOCK EDITOR UNTIL: fetch first batch of ops.

  Editor Emits Delta:
    write in flight:
      * @queue << delta

    no write in flight:
      * @inflght = delta
      * push delta to FB

    write fails:
      * @queue = winningDelta << @queue << @inflight
      * goto Editor Emits Delta

    write succeeds:
      * @queue = null

  Remote Delta:
    write in flight:
      ???

    no write in flight:
      * editor.setContents FB.ops

    local changes in @queue:
      == write in flight ???


*/

function composeDeltas (deltas) {
  let composed = new Delta();
  for (var i = 0, len = deltas.length; i < len; i++) {
    composed = composed.compose(deltas[i]);
  }
  return composed;
}

export default React.createClass({
  mixins: StateMixins,

  getInitialState () {
    return {};
  },

  getFireBindings (props) {
    return {
      ops: {
        path: `${props.firebasePath}/ops`,
        type: Array,
      },
    };
  },

  componentDidMount () {
    this.firebaseRefs.ops.once('value', (snapshot) => {
      this.quill = new Quill(this.refs.editor, {
        theme: 'snow'
      });

      this.quill.on('text-change', this.handleTextChange);

      let ops = snapshot.val() || [];
      this.latestOpId = ops.length - 1;

      this.firebaseRefs.ops.on('child_added', (snapshot) => {
        let opId = parseInt(snapshot.key, 10);
        console.log(this.latestOpId, opId);
        if (opId > this.latestOpId) {
          this.quill.updateContents(
            snapshot.val(),
            'silent'
          );
        }
      });

      if (ops.length === 0) {
        return;
      }

      this.quill.setContents(composeDeltas(ops), 'silent');
    });
  },

  handleTextChange (delta, oldDelta, source) {
    if (!this.state.deltaQueue) {
      this.setState({ deltaQueue: delta });
    }
    else {
      this.setState({ deltaQueue: this.state.deltaQueue.compose(delta) });
    }

    let nextOpId;
    if (this.state.ops) {
      nextOpId = this.state.ops.length;
    }
    else {
      nextOpId = 0;
    }
    this.latestOpId = nextOpId;

    this.firebaseRefs.ops.child(nextOpId).transaction((currentValue) => {
      return delta;
    }, (error) => {
      if (error) {
        console.log('FAILURE');
      }
      else {
        console.log('SUCCESS');
      }
    });
  },

  render () {
    return (
      <div>
        <div
          className="quill-editor"
          ref="editor"
        />
      </div>
    );
  },
});
