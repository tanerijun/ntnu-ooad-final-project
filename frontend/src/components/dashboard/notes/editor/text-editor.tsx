'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
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
import { imageClient, type ImageCompressOptions } from '@/lib/image-upload';

import AutoLinkPlugin from './AutoLinkPlugin';
import EditorTheme from './EditorTheme';
import { ImageNode } from './ImageNode';
import ImageUploadPlugin from './ImageUploadPlugin';
import KeyboardShortcutsPlugin from './KeyboardShortcutsPlugin';
import ToolbarPlugin from './ToolbarPlugin';

interface TextEditorProps {
  initialContent?: string;
  onChange?: (value: string) => void;
  height?: string | number;
  maxHeight?: string | number;
  className?: string;
}

const placeholder = 'Write a note...';

const cleanExportDOM = (editor: LexicalEditor, target: LexicalNode): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output?.element && isHTMLElement(output.element)) {
    const element = output.element;
    const allowedAttributes = ['href', 'target', 'rel'];

    Array.from(element.attributes).forEach((attr) => {
      if (!allowedAttributes.includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    });

    element.querySelectorAll('*').forEach((child) => {
      Array.from(child.attributes).forEach((attr) => {
        if (!allowedAttributes.includes(attr.name)) {
          child.removeAttribute(attr.name);
        }
      });
    });
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, cleanExportDOM],
  [TextNode, cleanExportDOM],
  [HeadingNode, cleanExportDOM],
  [QuoteNode, cleanExportDOM],
  [ListNode, cleanExportDOM],
  [ListItemNode, cleanExportDOM],
  [LinkNode, cleanExportDOM],
  [ImageNode, cleanExportDOM],
]);

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  const nodeMaps = [
    TextNode.importDOM?.() || {},
    ParagraphNode.importDOM?.() || {},
    HeadingNode.importDOM?.() || {},
    QuoteNode.importDOM?.() || {},
    ListNode.importDOM?.() || {},
    ListItemNode.importDOM?.() || {},
    ImageNode.importDOM?.() || {},
  ];

  nodeMaps.forEach((nodeMap) => {
    Object.assign(importMap, nodeMap);
  });

  return importMap;
};

function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = React.useRef(false);

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

    hasInitialized.current = true;
  }, [editor, initialContent]);

  return null;
}

export default function TextEditor({
  initialContent,
  onChange,
  height = '100%',
  maxHeight,
  className,
}: TextEditorProps) {
  const editorConfig: InitialConfigType = {
    namespace: 'ReactNoteEditor',
    theme: EditorTheme,
    nodes: [ParagraphNode, TextNode, HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, ImageNode],
    onError(error: Error) {
      logger.error('Lexical Error:', error);
    },
    html: {
      export: exportMap,
      import: constructImportMap(),
    },
  };

  const containerStyle: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    maxHeight: maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight) : undefined,
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className={`editor-container ${className || ''}`} style={containerStyle}>
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
          <ListPlugin />
          <TabIndentationPlugin />
          <AutoLinkPlugin />
          <KeyboardShortcutsPlugin />
          <ImageUploadPlugin
            onUpload={async (file: File) => {
              const compressOptions: ImageCompressOptions = {
                maxWidth: 1600,
                maxHeight: 1200,
                quality: 0.85,
                format: file.type === 'image/png' ? 'png' : 'jpeg',
              };

              const result = await imageClient.upload(file, compressOptions);
              if (result.error || !result.data) {
                throw new Error(result.error || 'Failed to upload image');
              }

              logger.debug('Image uploaded successfully:', {
                filename: result.data.filename,
                size: imageClient.formatFileSize(result.data.size),
              });

              return {
                url: result.data.url,
                filename: result.data.filename,
              };
            }}
          />
          <InitialContentPlugin initialContent={initialContent} />
          <OnChangePlugin
            onChange={(editorState) => {
              editorState.read(() => {
                const json = editorState.toJSON();
                onChange?.(JSON.stringify(json));
              });
            }}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
