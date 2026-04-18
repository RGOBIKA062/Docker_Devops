/**
 * COMPETITIVE COMPILER COMPONENT
 * Professional IDE for Online Code Execution
 * Features: Tab Locking, Test Cases, Multiple Languages, Real-time Execution
 * 
 * @author Senior Software Architect
 * @version 3.0.0
 * @features Protected Execution, No Tab Switching, Auto Test Running
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Play, Lock, Eye, EyeOff, RotateCw, Copy, Check, ChevronRight, Zap, Clock, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Tab Locking Service
class TabLockingService {
  constructor(onViolation) {
    this.onViolation = onViolation;
    this.isExecuting = false;
    this.warningCount = 0;
    this.violations = [];
    this.setupListeners();
  }

  setupListeners() {
    // Detect visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (this.isExecuting && document.hidden) {
        this.recordViolation('Tab Switch Detected');
        this.onViolation({
          type: 'tab-switch',
          message: '⚠️ Tab switching detected! Your submission may be flagged.',
          severity: 'warning',
          timestamp: Date.now()
        });
      }
    });

    // Detect focus loss
    window.addEventListener('blur', () => {
      if (this.isExecuting) {
        this.recordViolation('Window Focus Lost');
        this.onViolation({
          type: 'focus-loss',
          message: '⚠️ Window focus lost! Stay focused on the compiler.',
          severity: 'warning',
          timestamp: Date.now()
        });
      }
    });

    // Detect keyboard shortcuts for tab switching
    document.addEventListener('keydown', (e) => {
      if (this.isExecuting) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'Tab' || e.key === 't' && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          this.recordViolation('Tab Switch Shortcut Detected');
          this.onViolation({
            type: 'shortcut-attempt',
            message: '❌ Tab switching shortcuts are disabled during execution!',
            severity: 'critical',
            timestamp: Date.now()
          });
        }
      }
    });
  }

  recordViolation(type) {
    this.violations.push({
      type,
      timestamp: Date.now()
    });
    this.warningCount++;
  }

  startExecution() {
    this.isExecuting = true;
    this.warningCount = 0;
    this.violations = [];
  }

  stopExecution() {
    this.isExecuting = false;
  }

  getViolationReport() {
    return {
      totalViolations: this.violations.length,
      warningCount: this.warningCount,
      violations: this.violations,
      flagged: this.violations.length > 2
    };
  }
}

const CompetitiveCompiler = ({ problemId, problem = null }) => {
  // State Management
  const [code, setCode] = useState(problem?.starterCode?.javascript || '// Write your solution here\nfunction solution(input) {\n  // Your code here\n  return result;\n}');
  const [language, setLanguage] = useState('JavaScript');
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [violations, setViolations] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [stats, setStats] = useState({ passed: 0, total: 0, accuracy: 0 });
  const [theme, setTheme] = useState('dark');
  const [showProblem, setShowProblem] = useState(true);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const tabLockRef = useRef(null);
  const codeEditorRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize Tab Locking
  useEffect(() => {
    tabLockRef.current = new TabLockingService((violation) => {
      setViolations(prev => [...prev, violation]);
    });

    return () => {
      if (tabLockRef.current) {
        tabLockRef.current.stopExecution();
      }
    };
  }, []);

  // Execute Code
  const handleExecuteCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please write some code first!');
      return;
    }

    setIsExecuting(true);
    setIsLocked(true);
    setError('');
    setOutput('');
    setTestResults([]);
    
    tabLockRef.current?.startExecution();

    const startTime = performance.now();

    try {
      const response = await fetch('http://localhost:5000/api/compiler/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          problemId: problemId || null,
          userCode: true
        })
      });

      const data = await response.json();
      const executionTimeMs = performance.now() - startTime;

      if (data.success) {
        setOutput(JSON.stringify(data.data.output, null, 2));
        setExecutionTime(executionTimeMs);
        setStats({
          passed: data.data.testsPassed,
          total: data.data.totalTests,
          accuracy: data.data.totalTests > 0 
            ? Math.round((data.data.testsPassed / data.data.totalTests) * 100)
            : 0
        });

        // Parse test results
        if (Array.isArray(data.data.output)) {
          setTestResults(data.data.output);
          setAllTestsPassed(data.data.allTestsPassed);
        }

        if (!data.data.allTestsPassed) {
          setError(`⚠️ ${data.data.testsPassed}/${data.data.totalTests} tests passed`);
        }
      } else {
        setError(data.message || 'Execution failed');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setIsLocked(false);
      setShowOutput(true);
      tabLockRef.current?.stopExecution();
    }
  }, [code, language, problemId]);

  // Copy Code
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Language Change
  const handleLanguageChange = (newLanguage) => {
    const starterCodes = {
      JavaScript: 'function solution(input) {\n  // Your code here\n  return result;\n}',
      Python: 'def solution(input):\n    # Your code here\n    return result',
      Java: 'public class Solution {\n    public static Object solution(Object input) {\n        // Your code here\n        return result;\n    }\n}',
      'C++': '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}'
    };

    setLanguage(newLanguage);
    setCode(starterCodes[newLanguage] || starterCodes.JavaScript);
    setOutput('');
    setError('');
    setTestResults([]);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header */}
      <div className="border-b border-slate-700 sticky top-0 z-40 bg-slate-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Live Compiler</span>
            </div>
            {isLocked && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-700 rounded-full"
              >
                <Lock className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">Locked - No Tab Switch</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowProblem(!showProblem)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              {showProblem ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem Panel */}
          {showProblem && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="bg-slate-800 border-slate-700 h-full max-h-[85vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {problem?.title || 'Untitled Problem'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-300">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Description</h3>
                    <p className="leading-relaxed">
                      {problem?.description || 'No description available'}
                    </p>
                  </div>

                  {problem?.constraints && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">Constraints</h3>
                      <ul className="space-y-1">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {problem?.examples && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">Examples</h3>
                      <div className="space-y-3">
                        {problem.examples.map((ex, i) => (
                          <div key={i} className="bg-slate-900 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Example {i + 1}</p>
                            <p className="text-xs"><span className="text-green-400">Input:</span> {ex.input}</p>
                            <p className="text-xs"><span className="text-blue-400">Output:</span> {ex.output}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {problem?.notes && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">Notes</h3>
                      <ul className="space-y-1">
                        {problem.notes.map((n, i) => (
                          <li key={i} className="flex gap-2 text-xs">
                            <span className="text-amber-400">→</span>
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Editor & Output */}
          <div className={`${showProblem ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="space-y-4">
              {/* Language Selector & Controls */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={isExecuting}
                    className="px-3 py-1 bg-slate-700 border border-slate-600 text-white rounded text-sm hover:bg-slate-600 transition disabled:opacity-50"
                  >
                    {['JavaScript', 'Python', 'Java', 'C++'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCopyCode}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      setCode('');
                      setOutput('');
                      setError('');
                      setTestResults([]);
                    }}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>

                  <Button
                    onClick={handleExecuteCode}
                    disabled={isExecuting}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {isExecuting ? (
                      <>
                        <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Execute
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Violations Alert */}
              <AnimatePresence>
                {violations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="bg-red-900/20 border-red-700 text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {violations[violations.length - 1].message}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Code Editor */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              >
                <textarea
                  ref={codeEditorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isExecuting}
                  className="w-full h-96 p-4 bg-slate-900 text-slate-100 font-mono text-sm border-0 focus:outline-none resize-none disabled:opacity-75"
                  spellCheck="false"
                  style={{
                    lineHeight: '1.5',
                    tabSize: 2,
                    WebkitTextFillColor: '#e2e8f0'
                  }}
                />
              </motion.div>

              {/* Tabs for Output & Results */}
              <Tabs value={showOutput ? 'output' : 'info'} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <TabsList className="w-full justify-start bg-slate-900 border-b border-slate-700 rounded-none">
                  <TabsTrigger value="info" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="output" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Output
                  </TabsTrigger>
                  <TabsTrigger value="tests" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    <Check className="w-4 h-4 mr-2" />
                    Test Results ({stats.passed}/{stats.total})
                  </TabsTrigger>
                </TabsList>

                {/* Stats Tab */}
                <TabsContent value="info" className="p-4 min-h-32">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Execution Time</p>
                      <p className="text-lg font-mono text-green-400">{executionTime.toFixed(2)}ms</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Accuracy</p>
                      <p className={`text-lg font-mono ${stats.accuracy === 100 ? 'text-green-400' : stats.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {stats.accuracy}%
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Tests Passed</p>
                      <p className="text-lg font-mono text-blue-400">{stats.passed}/{stats.total}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Status</p>
                      <p className={`text-lg font-mono ${allTestsPassed ? 'text-green-400' : 'text-amber-400'}`}>
                        {allTestsPassed ? '✓ Accepted' : error ? '✗ Failed' : '○ Pending'}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Output Tab */}
                <TabsContent value="output" className="p-4 min-h-32">
                  {error && (
                    <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded mb-3 text-sm font-mono">
                      {error}
                    </div>
                  )}
                  {output && (
                    <div className="bg-slate-900 p-3 rounded border border-slate-700 max-h-48 overflow-y-auto">
                      <pre className="text-sm text-slate-100 font-mono whitespace-pre-wrap break-words">
                        {output}
                      </pre>
                    </div>
                  )}
                  {!output && !error && (
                    <p className="text-slate-400 text-sm">Run your code to see output here</p>
                  )}
                </TabsContent>

                {/* Test Results Tab */}
                <TabsContent value="tests" className="p-4 min-h-32 max-h-48 overflow-y-auto">
                  {testResults.length > 0 ? (
                    <div className="space-y-2">
                      {testResults.map((result, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-2 rounded border ${
                            result.passed
                              ? 'bg-green-900/20 border-green-700'
                              : 'bg-red-900/20 border-red-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                              Test Case {result.testCase || idx + 1}
                            </span>
                            <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                              {result.passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                          </div>
                          {!result.passed && (
                            <div className="mt-1 text-xs text-slate-300">
                              <p>Expected: {result.expected}</p>
                              <p>Got: {result.output}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Execute your code to see test results</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveCompiler;
