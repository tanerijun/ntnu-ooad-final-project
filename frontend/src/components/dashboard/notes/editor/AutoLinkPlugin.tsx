import { useEffect } from 'react';
import { $createAutoLinkNode, $isAutoLinkNode, $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $createTextNode, TextNode } from 'lexical';

const URL_REGEX =
  /(?:https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

const EMAIL_REGEX =
  /(?:(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gi;

function $createAutoLinkIfPossible(textNode: TextNode): void {
  const textContent = textNode.getTextContent();

  const urlMatches = textContent.match(URL_REGEX);
  if (urlMatches) {
    urlMatches.forEach((url) => {
      const urlStartIndex = textContent.indexOf(url);
      if (urlStartIndex !== -1) {
        const beforeText = textContent.substring(0, urlStartIndex);
        const afterText = textContent.substring(urlStartIndex + url.length);

        const linkUrl = url.startsWith('http') ? url : `https://${url}`;
        const linkNode = $createAutoLinkNode(linkUrl);
        linkNode.append($createTextNode(url));

        textNode.setTextContent(beforeText);
        if (afterText) {
          const afterTextNode = $createTextNode(afterText);
          textNode.insertAfter(afterTextNode);
          linkNode.insertAfter(afterTextNode);
        }
        textNode.insertAfter(linkNode);
      }
    });
    return;
  }

  const emailMatches = textContent.match(EMAIL_REGEX);
  if (emailMatches) {
    emailMatches.forEach((email) => {
      const emailStartIndex = textContent.indexOf(email);
      if (emailStartIndex !== -1) {
        const beforeText = textContent.substring(0, emailStartIndex);
        const afterText = textContent.substring(emailStartIndex + email.length);

        const linkNode = $createAutoLinkNode(`mailto:${email}`);
        linkNode.append($createTextNode(email));

        textNode.setTextContent(beforeText);
        if (afterText) {
          const afterTextNode = $createTextNode(afterText);
          textNode.insertAfter(afterTextNode);
          linkNode.insertAfter(afterTextNode);
        }
        textNode.insertAfter(linkNode);
      }
    });
  }
}

export default function AutoLinkPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
        const parent = textNode.getParent();

        // Don't auto-link inside existing links
        if ($isAutoLinkNode(parent) || $isLinkNode(parent)) {
          return;
        }

        $createAutoLinkIfPossible(textNode);
      })
    );
  }, [editor]);

  return null;
}
