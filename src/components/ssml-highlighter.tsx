import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';
import { useEffect, useRef } from 'react';

export const SSMLHighlighter: React.FC<{ ssml: string; }> = ({ ssml }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Apply highlighting when component mounts or record changes
    if (codeRef.current && ssml) {
      codeRef.current.textContent = ssml;
      Prism.highlightElement(codeRef.current);
    }
  }, [ssml]);

  if (!ssml) return null;

  return (
    <pre className="language-markup">
      <code ref={codeRef} className="language-markup">
        {ssml}
      </code>
    </pre>
  );
};