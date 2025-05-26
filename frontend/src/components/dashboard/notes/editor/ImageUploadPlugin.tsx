import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand } from 'lexical';

import { compressImage, validateImageFile } from '@/lib/image-utils';

import { $createImageNode } from './ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<{
  altText: string;
  src: string;
}> = createCommand('INSERT_IMAGE_COMMAND');

interface ImageUploadPluginProps {
  onUpload?: (file: File) => Promise<{ url: string; filename: string }>;
}

export default function ImageUploadPlugin({ onUpload }: ImageUploadPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  React.useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const { altText, src } = payload;
        const imageNode = $createImageNode({
          altText,
          src,
          maxWidth: 800,
        });
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  const handleFileInput = React.useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Compress image if it's large
        let processedFile = file;
        if (file.size > 1024 * 1024) {
          // 1MB threshold
          setUploadProgress(20);
          processedFile = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            format: file.type === 'image/png' ? 'png' : 'jpeg',
          });
        }

        if (onUpload) {
          // Simulate upload progress
          setUploadProgress(40);
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
          }, 150);

          const result = await onUpload(processedFile);

          clearInterval(progressInterval);
          setUploadProgress(100);

          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name,
            src: result.url,
          });

          // Reset progress after a short delay
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        } else {
          // Fallback to local file URL for preview
          const src = URL.createObjectURL(processedFile);
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name,
            src,
          });
          setIsUploading(false);
        }
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);

        let errorMessage = 'Failed to upload image. Please try again.';
        if (error instanceof Error) {
          if (error.message.includes('413')) {
            errorMessage = 'Image file is too large. Please choose a smaller file.';
          } else if (error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error.message.includes('compress')) {
            errorMessage = 'Failed to process image. Please try a different file.';
          }
        }

        alert(errorMessage);
      }
    },
    [editor, onUpload]
  );

  // Handle drag and drop
  const handleDragOver = React.useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          // Process first image file
          const fileList = new DataTransfer();
          fileList.items.add(imageFiles[0]);
          void handleFileInput(fileList.files);
        }
      }
    },
    [handleFileInput]
  );

  // Handle paste events
  const handlePaste = React.useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const fileList = new DataTransfer();
            fileList.items.add(file);
            void handleFileInput(fileList.files);
          }
          break;
        }
      }
    },
    [handleFileInput]
  );

  React.useEffect(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    editorElement.addEventListener('dragover', handleDragOver);
    editorElement.addEventListener('dragleave', handleDragLeave);
    editorElement.addEventListener('drop', handleDrop);
    editorElement.addEventListener('paste', handlePaste);

    return () => {
      editorElement.removeEventListener('dragover', handleDragOver);
      editorElement.removeEventListener('dragleave', handleDragLeave);
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, handleDragOver, handleDragLeave, handleDrop, handlePaste]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerFileInput = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Expose the trigger function globally so toolbar can use it
  React.useEffect(() => {
    (window as unknown as { __imageUploadTrigger?: () => void }).__imageUploadTrigger = triggerFileInput;
    return () => {
      delete (window as unknown as { __imageUploadTrigger?: () => void }).__imageUploadTrigger;
    };
  }, [triggerFileInput]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileInput(e.target.files)}
      />
      {isDragOver ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed rgb(59, 130, 246)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '16px',
              color: 'rgb(59, 130, 246)',
              fontWeight: 600,
            }}
          >
            Drop image here to upload
          </div>
        </div>
      ) : null}
      {isUploading ? (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            minWidth: '250px',
          }}
        >
          <div style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
            {uploadProgress < 40 ? 'Processing image...' : 'Uploading image...'}
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: 'rgb(59, 130, 246)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>{uploadProgress}%</div>
        </div>
      ) : null}
    </>
  );
}
