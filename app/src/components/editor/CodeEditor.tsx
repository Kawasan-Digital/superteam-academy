import { useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

// Map our language names to Monaco language IDs
const languageMap: Record<string, string> = {
  rust: 'rust',
  typescript: 'typescript',
  json: 'json',
  javascript: 'javascript',
};

export function CodeEditor({ value, onChange, language = 'typescript', height = '100%', readOnly = false }: CodeEditorProps) {
  const handleMount: OnMount = useCallback((editor, monaco) => {
    // Define Solana dark theme
    monaco.editor.defineTheme('solana-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '9945FF', fontStyle: 'bold' },
        { token: 'string', foreground: '14F195' },
        { token: 'number', foreground: '14F195' },
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'type', foreground: 'B794F6' },
        { token: 'function', foreground: 'E0E7FF' },
        { token: 'variable', foreground: 'E0E7FF' },
      ],
      colors: {
        'editor.background': '#0B0F1A',
        'editor.foreground': '#E0E7FF',
        'editor.lineHighlightBackground': '#1A1F2E',
        'editorLineNumber.foreground': '#3B4252',
        'editorLineNumber.activeForeground': '#6B7280',
        'editor.selectionBackground': '#9945FF30',
        'editor.inactiveSelectionBackground': '#9945FF15',
        'editorCursor.foreground': '#14F195',
        'editorIndentGuide.background': '#1A1F2E',
        'editorIndentGuide.activeBackground': '#2A2F3E',
        'editorGutter.background': '#0B0F1A',
        'scrollbar.shadow': '#00000000',
        'editorScrollbar.background': '#0B0F1A',
      },
    });
    monaco.editor.setTheme('solana-dark');

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      lineNumbers: 'on',
      tabSize: 2,
      padding: { top: 16 },
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
    });
  }, []);

  return (
    <Editor
      height={height}
      language={languageMap[language] || language}
      value={value}
      onChange={(val) => onChange(val || '')}
      onMount={handleMount}
      theme="solana-dark"
      loading={
        <div className="flex items-center justify-center h-full bg-background text-muted-foreground text-sm">
          Loading editor...
        </div>
      }
      options={{
        readOnly,
        wordWrap: 'on',
      }}
    />
  );
}
