import type { JSX } from 'react';
import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $applyNodeReplacement,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export interface ImagePayload {
  altText: string;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  src: string;
  width?: number;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    height?: number;
    maxWidth?: number;
    src: string;
    width?: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__maxWidth, node.__width, node.__height, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, src } = serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (_node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
    };
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createImageNode({ altText, height, maxWidth = 500, src, width, key }: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, maxWidth, width, height, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

interface ImageComponentProps {
  altText: string;
  height: 'inherit' | number;
  maxWidth: number;
  nodeKey: NodeKey;
  src: string;
  width: 'inherit' | number;
}

interface ResizeState {
  isResizing: boolean;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

function ImageComponent({ src, altText, nodeKey, width, height, maxWidth }: ImageComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected] = React.useState<boolean>(false);
  const [resizeState, setResizeState] = React.useState<ResizeState | null>(null);
  const imageRef = React.useRef<null | HTMLImageElement>(null);
  const [selection, setSelection] = React.useState<unknown>(null);

  const displayHeight = typeof height === 'number' && height > 0 ? height : 'auto';
  const displayWidth = typeof width === 'number' && width > 0 ? width : 'auto';

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [isSelected, nodeKey, editor]
  );

  const onClick = React.useCallback(
    (payload: MouseEvent) => {
      const event = payload;

      if (resizeState?.isResizing) {
        return true;
      }

      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          editor.update(() => {
            $setSelection(null);
          });
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isSelected, setSelected, editor, resizeState]
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      if (!imageRef.current || !isSelected) return;

      event.preventDefault();
      const rect = imageRef.current.getBoundingClientRect();

      setResizeState({
        isResizing: true,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
      });
    },
    [isSelected]
  );

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!resizeState?.isResizing || !imageRef.current) return;

      const deltaX = event.clientX - resizeState.startX;
      const _deltaY = event.clientY - resizeState.startY;

      const aspectRatio = resizeState.startHeight / resizeState.startWidth;
      const newWidth = Math.max(100, resizeState.startWidth + deltaX);
      const newHeight = newWidth * aspectRatio;

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidthAndHeight(newWidth, newHeight);
        }
      });
    },
    [resizeState, editor, nodeKey]
  );

  const handleMouseUp = React.useCallback(() => {
    setResizeState(null);
  }, []);

  React.useEffect(() => {
    if (resizeState?.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizeState, handleMouseMove, handleMouseUp]);

  React.useLayoutEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand<KeyboardEvent>(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand<KeyboardEvent>(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );

    return () => {
      isMounted = false;
      unregister();
    };
  }, [editor, onClick, onDelete]);

  const draggable = isSelected && $isNodeSelection(selection);
  const isFocused = isSelected;

  return (
    <div
      draggable={draggable}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: resizeState?.isResizing ? 'nw-resize' : 'default',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
              node.remove();
            }
          });
        }
      }}
    >
      <img
        className={isFocused ? 'focused draggable' : 'draggable'}
        src={src}
        alt={altText}
        ref={imageRef}
        style={{
          height: displayHeight,
          maxWidth,
          width: displayWidth,
          userSelect: 'none',
        }}
        draggable="false"
      />
      {isSelected ? (
        <>
          {/* Corner resize handles */}
          <div
            role="presentation"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              backgroundColor: 'rgb(59, 130, 246)',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nw-resize',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            onMouseDown={handleMouseDown}
          />
          {/* Delete button */}
          <button
            type="button"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 20,
              height: 20,
              backgroundColor: 'rgb(239, 68, 68)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            onClick={() => {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                  node.remove();
                }
              });
            }}
            title="Delete image"
          >
            ×
          </button>
        </>
      ) : null}
    </div>
  );
}
