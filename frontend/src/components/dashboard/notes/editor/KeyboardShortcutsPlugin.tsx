import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';

export default function KeyboardShortcutsPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Bold: Ctrl/Cmd + B
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event: KeyboardEvent) => {
          const { code, ctrlKey, metaKey, shiftKey, altKey } = event;
          
          if ((ctrlKey || metaKey) && !shiftKey && !altKey) {
            switch (code) {
              case 'KeyB':
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                return true;
              
              case 'KeyI':
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                return true;
              
              case 'KeyU':
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                return true;
            }
          }

          // Shift + Ctrl/Cmd shortcuts
          if ((ctrlKey || metaKey) && shiftKey && !altKey) {
            switch (code) {
              case 'KeyS':
                event.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                return true;
              
              case 'Digit7':
                event.preventDefault();
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                return true;
              
              case 'Digit8':
                event.preventDefault();
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                return true;
            }
          }

          // Alt + number shortcuts for headings
          if (altKey && !ctrlKey && !metaKey && !shiftKey) {
            switch (code) {
              case 'Digit0':
                event.preventDefault();
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                  }
                });
                return true;
              
              case 'Digit1':
              case 'Digit2':
              case 'Digit3':
              case 'Digit4':
              case 'Digit5':
              case 'Digit6': {
                event.preventDefault();
                const headingLevel = code.replace('Digit', 'h') as HeadingTagType;
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingLevel));
                  }
                });
                return true;
              }
              
              case 'KeyQ':
                event.preventDefault();
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                  }
                });
                return true;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}