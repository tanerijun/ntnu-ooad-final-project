'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { useState } from 'react';

const theme = {
  paragraph: 'editor-paragraph', // you can customize with Tailwind or CSS
};

export default function TextEditor() {
  const initialConfig = {
    namespace: 'NewNoteEditor',
    theme,
    onError(error: Error) {
      console.error(error);
    },
  };

  const [editorState, setEditorState] = useState(null);

  const handleChange = (state: any) => {
    state.read(() => {
      setEditorState(state.toJSON());
    });
  };

  return (
    <div className="border p-4 min-h-[200px]">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-placeholder={'Enter some text...'}
              placeholder={<div>Enter some text...</div>}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>

      <div className="mt-4">
        <strong>Editor State (JSON Preview):</strong>
        <pre className="bg-gray-100 p-2">{JSON.stringify(editorState, null, 2)}</pre>
      </div>
    </div>
  );
}