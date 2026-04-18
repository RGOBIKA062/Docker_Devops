import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Play,
  Copy,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  RotateCcw,
  Settings,
  Share2,
  Maximize2,
  Sun,
  Moon,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import codeExecutionAPI from '../lib/codeExecutionAPI';
import Navbar from '@/components/Navbar';

const OnlineCompilerPro = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [code, setCode] = useState(`console.log("Hello, World!");`);
  
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs'); // Editor theme
  const [pageTheme, setPageTheme] = useState('light'); // Page theme (light/dark)
  const [editorHeight, setEditorHeight] = useState(400);
  const languageDropdownRef = useRef(null);

  const languages = [
    {
      id: 'javascript',
      label: 'JavaScript',
      monacoId: 'javascript',
      example: `console.log("Hello, World!");`,
    },
    {
      id: 'python',
      label: 'Python',
      monacoId: 'python',
      example: `print("Hello, World!")`,
    },
    {
      id: 'java',
      label: 'Java',
      monacoId: 'java',
      example: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    },
    {
      id: 'cpp',
      label: 'C++',
      monacoId: 'cpp',
      example: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Enter or Cmd+Enter to execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [code, language, input]);

  const handleChangeLanguage = (newLanguage) => {
    const selectedLang = languages.find((l) => l.id === newLanguage);
    setLanguage(newLanguage);
    setCode(selectedLang.example);
    setIsLanguageDropdownOpen(false);
    setOutput('');
    setError('');
  };

  const handleExecute = async () => {
    if (!code.trim()) {
      setError('Please write some code first!');
      return;
    }

    setExecuting(true);
    setError('');
    setOutput('');
    setExecutionTime(0);

    try {
      const result = await codeExecutionAPI.executeCode(code, language, input);

      if (result.success) {
        setOutput(result.output || 'Code executed successfully!');
        setExecutionTime(result.executionTime);
      } else {
        setError(result.error || 'Execution failed');
      }
    } catch (err) {
      // Handle validation errors with details
      if (err.errors && err.errors.length > 0) {
        const errorDetails = err.errors
          .map((e) => {
            if (e.line) {
              return `Line ${e.line}: [${e.type}] ${e.message}`;
            }
            return `[${e.type}] ${e.message}`;
          })
          .join('\n');
        setError(errorDetails);
      } else if (err.data?.message) {
        setError(err.data.message);
      } else {
        setError(err.message || 'Error executing code');
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleDownloadCode = () => {
    const currentLang = languages.find((l) => l.id === language);
    const filename = `code.${currentLang.monacoId === 'cpp' ? 'cpp' : currentLang.monacoId}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(code));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearCode = () => {
    if (confirm('Are you sure you want to clear the code?')) {
      setCode('');
      setOutput('');
      setError('');
    }
  };

  const handleResetCode = () => {
    const selectedLang = languages.find((l) => l.id === language);
    setCode(selectedLang.example);
    setOutput('');
    setError('');
  };

  const currentLang = languages.find((l) => l.id === language);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageTheme === 'light' ? 'bg-white' : 'bg-gradient-to-br from-black via-slate-900 to-black'}`}>
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-4xl font-bold mb-2 ${pageTheme === 'light' ? 'text-black' : 'text-white'}`}>💻 Online Compiler Pro</h1>
          <p className={`${pageTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Professional code editor with syntax highlighting, auto-completion & more</p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {/* Toolbar */}
            <div className={`rounded-t-lg border border-orange-600/30 p-4 flex items-center justify-between flex-wrap gap-3 transition-colors ${pageTheme === 'light' ? 'bg-slate-50' : 'bg-black'}`}>
              {/* Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <span>🔸</span>
                  {currentLang?.label}
                  <ChevronDown size={18} />
                </button>

                {isLanguageDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute top-full left-0 mt-2 border border-orange-600/30 rounded-lg shadow-lg z-50 transition-colors ${pageTheme === 'light' ? 'bg-white' : 'bg-slate-900'}`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleChangeLanguage(lang.id)}
                        className={`w-full text-left px-4 py-2 transition-colors ${
                          language === lang.id
                            ? 'bg-orange-600 text-white'
                            : pageTheme === 'light' ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                        } first:rounded-t-lg last:rounded-b-lg`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="p-2 hover:bg-orange-600/20 rounded-lg text-orange-500 hover:text-orange-400 transition-colors"
                  title="Reset to example"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-orange-600/20 rounded-lg text-orange-500 hover:text-orange-400 transition-colors"
                  title="Copy code"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="p-2 hover:bg-orange-600/20 rounded-lg text-orange-500 hover:text-orange-400 transition-colors"
                  title="Download code"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setPageTheme(pageTheme === 'light' ? 'dark' : 'light')}
                  className="p-2 hover:bg-orange-600/20 rounded-lg text-orange-500 hover:text-orange-400 transition-colors"
                  title="Toggle theme"
                >
                  {pageTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
            </div>

            {/* Monaco Editor - WHITE BACKGROUND */}
            <div className={`border border-orange-600/30 rounded-b-lg overflow-hidden shadow-2xl transition-colors ${pageTheme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <Editor
                height="500px"
                language={currentLang?.monacoId}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={pageTheme === 'light' ? 'vs' : 'vs-dark'}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: "'Fira Code', 'Monaco', monospace",
                  formatOnPaste: true,
                  formatOnType: true,
                  formatOnSave: true,
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  autoClosingDelete: 'auto',
                  autoSurround: 'languageDefined',
                  autoIndent: 'full',
                  bracketPairColorization: {
                    enabled: true,
                    independentColorPoolPerBracketType: true,
                  },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'all',
                  lineNumbers: 'on',
                  lineNumbersMinChars: 3,
                  guides: {
                    bracketPairs: true,
                    bracketPairsHorizontal: true,
                    indentation: true,
                    highlightActiveBracketPair: true,
                  },
                  tabSize: 2,
                  insertSpaces: true,
                  trimAutoWhitespace: true,
                  semanticHighlighting: {
                    enabled: true,
                  },
                  colorDecorators: true,
                  matchBrackets: 'always',
                  quickSuggestions: {
                    other: 'on',
                    comments: 'off',
                    strings: 'off',
                  },
                  suggestOnTriggerCharacters: true,
                  parameterHints: {
                    enabled: true,
                    cycle: true,
                  },
                  autoSave: 'afterDelay',
                  autoSaveDelay: 500,
                  wordBasedSuggestions: 'currentDocument',
                  snippetSuggestions: 'inline',
                  showUnused: true,
                  showDeprecated: true,
                  inlayHints: {
                    enabled: 'on',
                    fontSize: 12,
                    padding: true,
                  },
                  occurrencesHighlight: 'singleFile',
                  selectionHighlight: true,
                  folding: true,
                  foldingStrategy: 'auto',
                  foldingImportsByDefault: false,
                  showFoldingControls: 'always',
                  foldingMaximumRegions: 10000,
                  codeActionsOnSaveTimeout: 750,
                  mouseWheelZoom: true,
                  fontLigatures: true,
                  unicodeHighlight: {
                    nonBasicASCII: 'off',
                    invisibleCharacters: false,
                    ambiguousCharacters: false,
                  },
                }}
              />
            </div>

            {/* Input Section - WHITE */}
            <div className={`mt-6 rounded-lg border border-orange-600/30 p-4 shadow-lg transition-colors ${pageTheme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <label className={`block font-semibold mb-3 text-sm ${pageTheme === 'light' ? 'text-black' : 'text-white'}`}>📥 Input (Optional)</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Provide input for your program here..."
                className={`w-full h-24 border border-orange-600/20 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 resize-none transition-colors ${pageTheme === 'light' ? 'bg-slate-50 text-black' : 'bg-slate-900 text-white'}`}
              />
            </div>
          </motion.div>

          {/* Output & Controls Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={executing}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                executing
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/50'
              }`}
            >
              <Play size={24} />
              {executing ? 'Executing...' : 'Run Code'}
            </button>

            {/* Tips Section - WHITE */}
            <div className={`border border-orange-600/30 rounded-lg p-4 shadow-lg transition-colors ${pageTheme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <div className="flex gap-2 items-start">
                <div className="text-orange-600 text-xl mt-1">💡</div>
                <div>
                  <p className={`font-bold text-sm mb-2 ${pageTheme === 'light' ? 'text-black' : 'text-white'}`}>Pro Tips:</p>
                  <ul className={`text-xs space-y-1 ${pageTheme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                    <li>✓ Press <strong>Ctrl+Enter</strong> to execute</li>
                    <li>✓ Auto-closing brackets & auto-indent</li>
                    <li>✓ Syntax highlighting & code completion</li>
                    <li>✓ Max 10KB code • 30s timeout</li>
                    <li>✓ Powered by Groq API</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Output Section - WHITE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`block font-semibold text-sm ${pageTheme === 'light' ? 'text-black' : 'text-white'}`}>📤 Output</label>
                {executionTime > 0 && (
                  <div className={`flex items-center gap-1 text-orange-500 text-sm font-bold px-3 py-1 rounded-full border border-orange-600/30 transition-colors ${pageTheme === 'light' ? 'bg-orange-100' : 'bg-orange-600/10'}`}>
                    <Clock size={16} />
                    {executionTime}ms
                  </div>
                )}
              </div>

              {error ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 shadow-lg ${pageTheme === 'light' ? 'bg-red-50 border-red-600/50' : 'bg-red-900/20 border-red-600/50'}`}
                >
                  <div className="flex gap-3 items-start">
                    <AlertCircle size={20} className={`flex-shrink-0 mt-0.5 ${pageTheme === 'light' ? 'text-red-600' : 'text-red-500'}`} />
                    <div>
                      <p className={`font-bold mb-1 ${pageTheme === 'light' ? 'text-red-700' : 'text-red-400'}`}>Error</p>
                      <p className={`text-sm font-mono whitespace-pre-wrap ${pageTheme === 'light' ? 'text-red-700' : 'text-red-300'}`}>{error}</p>
                    </div>
                  </div>
                </motion.div>
              ) : output ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 shadow-lg ${pageTheme === 'light' ? 'bg-green-50 border-green-600/50' : 'bg-green-900/20 border-green-600/50'}`}
                >
                  <div className="flex gap-3 items-start">
                    <CheckCircle size={20} className={`flex-shrink-0 mt-0.5 ${pageTheme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <div className="flex-1">
                      <p className={`font-bold mb-2 ${pageTheme === 'light' ? 'text-green-700' : 'text-green-400'}`}>Success</p>
                      <div className={`rounded p-3 max-h-64 overflow-y-auto border ${pageTheme === 'light' ? 'bg-white border-green-600/20 text-slate-800' : 'bg-slate-900 border-green-600/20 text-slate-200'}`}>
                        <p className="text-sm font-mono whitespace-pre-wrap break-words">
                          {output}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className={`border border-orange-600/30 rounded-lg p-4 text-center shadow-lg transition-colors ${pageTheme === 'light' ? 'bg-white text-slate-500' : 'bg-slate-800 text-slate-400'}`}>
                  <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click "Run Code" to see output here</p>
                </div>
              )}
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClearCode}
              className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-orange-600/30 ${pageTheme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
            >
              <Trash2 size={18} />
              Clear All
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCompilerPro;
