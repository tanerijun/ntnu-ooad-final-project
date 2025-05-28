import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

interface HelpTooltipProps {
  onClose: () => void;
}

function HelpTooltip({ onClose }: HelpTooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.help-modal')) {
        onClose();
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="help-overlay">
      <div className="help-modal">
        <div className="help-content">
          <div className="help-header">
            <h4>Keyboard Shortcuts</h4>
            <button
              type="button"
              onClick={onClose}
              className="help-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="shortcut-group">
            <div><kbd>Ctrl/Cmd + B</kbd> Bold</div>
            <div><kbd>Ctrl/Cmd + I</kbd> Italic</div>
            <div><kbd>Ctrl/Cmd + U</kbd> Underline</div>
            <div><kbd>Ctrl/Cmd + Shift + S</kbd> Strikethrough</div>
          </div>
          <div className="shortcut-group">
            <div><kbd>Alt + 0</kbd> Normal text</div>
            <div><kbd>Alt + 1-6</kbd> Headings</div>
            <div><kbd>Alt + Q</kbd> Quote</div>
          </div>
          <div className="shortcut-group">
            <div><kbd>Ctrl/Cmd + Shift + 7</kbd> Numbered list</div>
            <div><kbd>Ctrl/Cmd + Shift + 8</kbd> Bullet list</div>
            <div><kbd>Ctrl/Cmd + Shift + I</kbd> Insert image</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [showHelp, setShowHelp] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' 
        ? anchorNode 
        : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      
      if (elementDOM !== null) {
        if (element.getType() === 'heading') {
          const tag = (element as unknown as { getTag: () => string }).getTag();
          setBlockType(tag);
        } else if (element.getType() === 'quote') {
          setBlockType('quote');
        } else if (element.getType() === 'list') {
          const listType = (element as unknown as { getListType: () => string }).getListType();
          setBlockType(listType);
        } else {
          setBlockType('paragraph');
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);



  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <Divider />
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={`toolbar-item spaced ${isBold && 'active'}`}
        aria-label="Format Bold"
      >
        <i className="format bold" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={`toolbar-item spaced ${isItalic && 'active'}`}
        aria-label="Format Italics"
      >
        <i className="format italic" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={`toolbar-item spaced ${isUnderline && 'active'}`}
        aria-label="Format Underline"
      >
        <i className="format underline" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={`toolbar-item spaced ${isStrikethrough && 'active'}`}
        aria-label="Format Strikethrough"
      >
        <i className="format strikethrough" />
      </button>
      <Divider />
      <select
        className="toolbar-item block-controls"
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              if (value === 'paragraph') {
                $setBlocksType(selection, () => $createParagraphNode());
              } else if (value === 'quote') {
                $setBlocksType(selection, () => $createQuoteNode());
              } else if (value.startsWith('h')) {
                $setBlocksType(selection, () => $createHeadingNode(value as HeadingTagType));
              }
            }
          });
        }}
      >
        <option value="paragraph">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote</option>
      </select>
      <Divider />
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Bullet List"
      >
        <i className="format bullet-list" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Numbered List"
      >
        <i className="format numbered-list" />
      </button>
      <Divider />
      <button
        type="button"
        onClick={() => {
          const windowWithUpload = window as unknown as { __imageUploadTrigger?: () => void };
          if (windowWithUpload.__imageUploadTrigger) {
            windowWithUpload.__imageUploadTrigger();
          }
        }}
        className="toolbar-item spaced"
        aria-label="Insert Image"
        title="Insert Image"
      >
        <i className="format image" />
      </button>
      <Divider />
      <button
        type="button"
        onClick={() => {
          setShowHelp(!showHelp);
        }}
        className="toolbar-item"
        aria-label="Keyboard Shortcuts"
        title="Show keyboard shortcuts"
      >
        <i className="format help" />
      </button>
      {showHelp && <HelpTooltip onClose={() => setShowHelp(false)} />}
      <Divider />
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <i className="format left-align" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <i className="format center-align" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <i className="format right-align" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <i className="format justify-align" />
      </button>{' '}
    </div>
  );
}
