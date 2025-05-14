'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isTextNode,
  isHTMLElement,
  ParagraphNode,
  TextNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type DOMExportOutputMap,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';

import { logger } from '@/lib/default-logger';

import ExampleTheme from './ExampleTheme';
import { parseAllowedColor, parseAllowedFontSize } from './style-config';
import ToolbarPlugin from './ToolbarPlugin';
import TreeViewPlugin from './TreeViewPlugin';

interface TextEditorProps {
  initialContent?: string;
  onChange?: (value: string) => void;
}

const placeholder = 'Enter some rich text...';

const removeStylesExportDOM = (editor: LexicalEditor, target: LexicalNode): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    for (const el of [output.element, ...output.element.querySelectorAll('[style],[class],[dir="ltr"]')]) {
      el.removeAttribute('class');
      el.removeAttribute('style');
      if (el.getAttribute('dir') === 'ltr') {
        el.removeAttribute('dir');
      }
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) return null;
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (output?.forChild === undefined || output.after !== undefined || output.node !== null) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }
  return importMap;
};

function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = React.useRef(false); // 👈 Track initialization

  useEffect(() => {
    if (hasInitialized.current || !initialContent) return;

    try {
      const parsed = JSON.parse(initialContent);
      editor.setEditorState(editor.parseEditorState(parsed));
    } catch (e) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode().append($createTextNode(initialContent)));
      });
    }

    hasInitialized.current = true; // 👈 Ensure it's only set once
  }, [editor, initialContent]);

  return null;
}

export default function TextEditor({ initialContent, onChange }: TextEditorProps) {
  const editorConfig: InitialConfigType = {
    namespace: 'ReactNoteEditor',
    theme: ExampleTheme,
    nodes: [ParagraphNode, TextNode],
    onError(error: Error) {
      logger.error('Lexical Error:', error);
    },
    html: {
      export: exportMap,
      import: constructImportMap(),
    },
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <InitialContentPlugin initialContent={initialContent} />
          <OnChangePlugin
            onChange={(editorState) => {
              editorState.read(() => {
                const json = editorState.toJSON();
                onChange?.(JSON.stringify(json));
              });
            }}
          />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
