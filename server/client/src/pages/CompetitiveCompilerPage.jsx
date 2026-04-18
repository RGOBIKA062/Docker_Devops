/**
 * COMPETITIVE COMPILER PAGE (v2.0)
 * Professional IDE with Orange/Black/White Theme
 * Enterprise-Grade Error Handling & Validation
 * 
 * Features:
 * - Advanced error detection and reporting
 * - Network resilience with retry logic
 * - Input validation with detailed feedback
 * - Professional UI/UX with accessibility
 * - Real-time compilation & testing
 * - Tab locking security
 * 
 * @author 25+ Years Senior Software Developer
 * @version 2.0.0
 * @theme Orange(#FF8C00) / Black(#1A1A1A) / White(#FFFFFF)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Play,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  Copy,
  Check,
  ChevronRight,
  Zap,
  Clock,
  BarChart3,
  Code2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Download,
  Share2,
  Settings,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

/**
 * ============================================
 * ERROR DEFINITIONS & VALIDATION RULES
 * ============================================
 */

const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  MEMORY_ERROR: 'MEMORY_ERROR',
  SECURITY_ERROR: 'SECURITY_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Connection error. Please check your internet and try again.',
  VALIDATION_ERROR: 'Invalid input. Please check your code and parameters.',
  COMPILATION_ERROR: 'Code compilation failed. Check syntax errors.',
  RUNTIME_ERROR: 'Runtime error occurred during execution.',
  TIMEOUT_ERROR: 'Code execution exceeded time limit (5 seconds).',
  MEMORY_ERROR: 'Memory usage exceeded limit (256 MB).',
  SECURITY_ERROR: 'Security violation detected. Action blocked.',
  DATABASE_ERROR: 'Database connection failed. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * ============================================
 * TAB LOCKING SERVICE (ENTERPRISE SECURITY)
 * ============================================
 */

class TabLockingService {
  constructor(onViolation) {
    this.onViolation = onViolation;
    this.isExecuting = false;
    this.warningCount = 0;
    this.violations = [];
    this.listeners = [];
  }

  setupListeners() {
    const handleVisibilityChange = () => {
      if (this.isExecuting && document.hidden) {
        this.recordViolation('TAB_SWITCH', 'User switched to different tab');
        this.onViolation({
          type: 'tab-switch',
          message: '⚠️ Tab switch detected! Submission flagged.',
          severity: 'critical',
          timestamp: Date.now(),
        });
      }
    };

    const handleBlur = () => {
      if (this.isExecuting) {
        this.recordViolation('FOCUS_LOSS', 'Window lost focus');
        this.onViolation({
          type: 'focus-loss',
          message: '⚠️ Window focus lost. Stay focused!',
          severity: 'warning',
          timestamp: Date.now(),
        });
      }
    };

    const handleKeyDown = (e) => {
      if (this.isExecuting) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
          e.preventDefault();
          this.recordViolation('SHORTCUT_BLOCKED', 'Tab switch shortcut attempt');
          this.onViolation({
            type: 'shortcut-attempt',
            message: '❌ Tab switching disabled during execution!',
            severity: 'critical',
            timestamp: Date.now(),
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);

    this.listeners = [
      { type: 'visibilitychange', handler: handleVisibilityChange },
      { type: 'blur', handler: handleBlur },
      { type: 'keydown', handler: handleKeyDown },
    ];
  }

  recordViolation(type, detail) {
    this.violations.push({
      type,
      detail,
      timestamp: Date.now(),
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

  cleanup() {
    this.listeners.forEach((listener) => {
      document.removeEventListener(listener.type, listener.handler);
      window.removeEventListener(listener.type, listener.handler);
    });
  }

  getReport() {
    return {
      totalViolations: this.violations.length,
      flagged: this.violations.length > 2,
      violations: this.violations,
    };
  }
}

/**
 * ============================================
 * ERROR HANDLER (PROFESSIONAL)
 * ============================================
 */

const ErrorHandler = {
  classifyError(error) {
    if (!error) return { type: ERROR_TYPES.UNKNOWN_ERROR, message: ERROR_MESSAGES.UNKNOWN_ERROR };

    const message = error.message || String(error);

    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return { type: ERROR_TYPES.NETWORK_ERROR, message: ERROR_MESSAGES.NETWORK_ERROR };
    }
    if (message.includes('SyntaxError') || message.includes('compilation')) {
      return { type: ERROR_TYPES.COMPILATION_ERROR, message: ERROR_MESSAGES.COMPILATION_ERROR };
    }
    if (message.includes('timeout') || message.includes('Time Limit')) {
      return { type: ERROR_TYPES.TIMEOUT_ERROR, message: ERROR_MESSAGES.TIMEOUT_ERROR };
    }
    if (message.includes('memory') || message.includes('out of memory')) {
      return { type: ERROR_TYPES.MEMORY_ERROR, message: ERROR_MESSAGES.MEMORY_ERROR };
    }
    if (message.includes('security') || message.includes('forbidden')) {
      return { type: ERROR_TYPES.SECURITY_ERROR, message: ERROR_MESSAGES.SECURITY_ERROR };
    }

    return { type: ERROR_TYPES.UNKNOWN_ERROR, message: ERROR_MESSAGES.UNKNOWN_ERROR };
  },

  getErrorUI(error) {
    const { type, message } = this.classifyError(error);
    return { type, message };
  },
};

/**
 * ============================================
 * VALIDATION RULES
 * ============================================
 */

const Validators = {
  validateCode(code, language) {
    const errors = [];

    if (!code || code.trim().length === 0) {
      errors.push('Code cannot be empty');
    }

    if (code.length > 50000) {
      errors.push('Code size exceeds 50KB limit');
    }

    if (language === 'javascript') {
      if (!code.includes('function') && !code.includes('=>')) {
        errors.push('JavaScript: Function definition required');
      }
    } else if (language === 'python') {
      if (!code.includes('def ')) {
        errors.push('Python: Function definition (def) required');
      }
    } else if (language === 'java') {
      if (!code.includes('public class')) {
        errors.push('Java: Class definition required');
      }
    }

    return errors;
  },

  validateProblem(problem) {
    const errors = [];

    if (!problem) {
      errors.push('Problem data not loaded');
      return errors;
    }

    if (!problem.id) {
      errors.push('Problem ID missing');
    }
    if (!problem.title) {
      errors.push('Problem title missing');
    }
    if (!problem.description) {
      errors.push('Problem description missing');
    }

    return errors;
  },

  validateLanguage(language) {
    const validLanguages = ['javascript', 'python', 'java', 'cpp'];
    if (!validLanguages.includes(language)) {
      return ['Invalid programming language selected'];
    }
    return [];
  },
};

/**
 * ============================================
 * ERROR DISPLAY COMPONENT
 * ============================================
 */

const ErrorAlert = ({ error, onDismiss, type = 'error', retryable = false, onRetry = null }) => {
  const bgColor = type === 'error' ? 'bg-red-50' : type === 'warning' ? 'bg-yellow-50' : 'bg-orange-50';
  const borderColor = type === 'error' ? 'border-red-200' : type === 'warning' ? 'border-yellow-200' : 'border-orange-200';
  const textColor = type === 'error' ? 'text-red-800' : type === 'warning' ? 'text-yellow-800' : 'text-orange-800';
  const IconComponent = type === 'error' ? AlertCircle : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${bgColor} border ${borderColor} rounded-lg p-4 mb-4`}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${textColor}`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${textColor}`}>Error</h4>
          <p className={`text-sm mt-1 ${textColor}`}>{error}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {retryable && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
              ✕
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * ============================================
 * VALIDATION FEEDBACK COMPONENT
 * ============================================
 */

const ValidationFeedback = ({ errors, warnings }) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {errors.map((error, idx) => (
          <motion.div
            key={`error-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded text-sm"
          >
            <XCircle className="w-4 h-4" />
            {error}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {warnings.map((warning, idx) => (
          <motion.div
            key={`warning-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            {warning}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * ============================================
 * MAIN COMPILER COMPONENT
 * ============================================
 */

const CompetitiveCompilerPage = () => {
  // ==================== STATE ====================
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [tabViolations, setTabViolations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ passed: 0, total: 0, accuracy: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showProblem, setShowProblem] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [netw, setNetworkStatus] = useState('online');

  const tabLockingRef = useRef(null);
  const codeEditorRef = useRef(null);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeCompiler();
    window.addEventListener('online', () => setNetworkStatus('online'));
    window.addEventListener('offline', () => setNetworkStatus('offline'));

    return () => {
      window.removeEventListener('online', () => setNetworkStatus('online'));
      window.removeEventListener('offline', () => setNetworkStatus('offline'));
      if (tabLockingRef.current) {
        tabLockingRef.current.cleanup();
      }
    };
  }, []);

  const initializeCompiler = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize tab locking service
      tabLockingRef.current = new TabLockingService((violation) => {
        setTabViolations((prev) => [...prev, violation]);
      });
      tabLockingRef.current.setupListeners();

      // Load problem data
      const problemData = {
        id: '1',
        title: 'Two Sum Problem',
        difficulty: 'Easy',
        description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
        examples: [
          {
            input: '[2, 7, 11, 15], target = 9',
            output: '[0, 1]',
            explanation: 'nums[0] + nums[1] == 9, return [0, 1]',
          },
        ],
      };

      setProblem(problemData);
      setCode(getStarterCode('javascript'));
    } catch (err) {
      const { message } = ErrorHandler.getErrorUI(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== CODE TEMPLATES ====================
  const getStarterCode = (lang) => {
    const templates = {
      javascript: `// Two Sum Problem
function solution(nums, target) {
  // Your code here
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  
  return [];
}

// Test
console.log(solution([2, 7, 11, 15], 9)); // [0, 1]`,

      python: `# Two Sum Problem
def solution(nums, target):
    # Your code here
    map_dict = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in map_dict:
            return [map_dict[complement], i]
        map_dict[num] = i
    
    return []

# Test
print(solution([2, 7, 11, 15], 9))  # [0, 1]`,

      java: `public class Solution {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        System.out.println(java.util.Arrays.toString(twoSum(nums, target)));
    }
    
    public static int[] twoSum(int[] nums, int target) {
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        
        return new int[]{};
    }
}`,

      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}`,
    };

    return templates[lang] || '';
  };

  // ==================== LANGUAGE CHANGE HANDLER ====================
  const handleLanguageChange = (newLang) => {
    const newCode = getStarterCode(newLang);
    setLanguage(newLang);
    setCode(newCode);
    setValidationErrors([]);
    setValidationWarnings([]);
    setOutput('');
    setTestResults([]);
  };

  // ==================== CODE EXECUTION ====================
  const handleExecuteCode = useCallback(async () => {
    try {
      // Validation
      const codeErrors = Validators.validateCode(code, language);
      const langErrors = Validators.validateLanguage(language);
      const allErrors = [...codeErrors, ...langErrors];

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        setValidationWarnings([]);
        return;
      }

      setValidationErrors([]);
      setExecuting(true);
      setError(null);
      setOutput('');
      setTestResults([]);

      tabLockingRef.current?.startExecution();

      // Network check
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Execute code
      const startTime = performance.now();

      const response = await fetch('http://localhost:5000/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: problem?.id || 'sample-two-sum',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();

      if (!data.success) {
        throw new Error(data.message || 'Execution failed');
      }

      // Process results
      const executionResults = data.data?.output || [];
      const passedCount = executionResults.filter((r) => r.passed).length;

      setTestResults(executionResults);
      setStats({
        passed: passedCount,
        total: executionResults.length,
        accuracy: executionResults.length > 0 ? Math.round((passedCount / executionResults.length) * 100) : 0,
      });
      setExecutionTime((endTime - startTime).toFixed(2));
      setOutput(data.data?.output || 'Execution completed');

      // Get violation report
      const violationReport = tabLockingRef.current?.getReport();
      if (violationReport?.flagged) {
        setValidationWarnings([`⚠️ ${violationReport.totalViolations} security violations detected`]);
      }
    } catch (err) {
      const errorUI = ErrorHandler.getErrorUI(err);
      setError(errorUI.message);
      setOutput('');
      setTestResults([]);
      setExecuting(false);
      tabLockingRef.current?.stopExecution();
    } finally {
      setExecuting(false);
      tabLockingRef.current?.stopExecution();
    }
  }, [code, language, problem]);

  // ==================== COPY CODE ====================
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==================== CLEAR CODE ====================
  const handleClearCode = () => {
    setCode('');
    setOutput('');
    setTestResults([]);
    setValidationErrors([]);
  };

  // ==================== RETRY LOGIC ====================
  const handleRetry = async () => {
    setRetrying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRetrying(false);
    await handleExecuteCode();
  };

  // ==================== RENDER: LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Code2 className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          </motion.div>
          <p className="text-white text-xl">Loading Compiler...</p>
          <p className="text-gray-400 text-sm mt-2">Initializing professional IDE</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER: MAIN UI ====================
  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && <Navbar />}

      <main className={`${isFullscreen ? 'p-0' : 'container mx-auto px-4 py-8'}`}>
        {/* ========== HEADER ========== */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Competitive Compiler</h1>
                <p className="text-gray-400 text-sm">Professional IDE with Enterprise-Grade Security</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-800 rounded transition"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowProblem(!showProblem)}
                className="p-2 hover:bg-gray-800 rounded transition"
                title="Toggle problem panel"
              >
                {showProblem ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ========== NETWORK STATUS ========== */}
        {netw === 'offline' && (
          <ErrorAlert
            error="You are currently offline. Some features may not work."
            type="warning"
            onDismiss={() => {}}
          />
        )}

        {/* ========== ERROR ALERTS ========== */}
        <AnimatePresence>
          {error && (
            <ErrorAlert
              error={error}
              type="error"
              retryable={true}
              onRetry={handleRetry}
              onDismiss={() => setError(null)}
            />
          )}
        </AnimatePresence>

        {/* ========== VALIDATION FEEDBACK ========== */}
        <ValidationFeedback errors={validationErrors} warnings={validationWarnings} />

        {/* ========== TAB VIOLATIONS ========== */}
        <AnimatePresence>
          {tabViolations.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                <span className="text-red-300 text-sm">Security: {tabViolations.length} violation(s) detected</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========== PROBLEM PANEL ========== */}
          {showProblem && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-4"
            >
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{problem?.title}</h2>
                </div>

                <div className="space-y-4">
                  {/* Difficulty */}
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase">Difficulty</span>
                    <div className="mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-500/20 text-orange-400 border border-orange-500/50">
                      {problem?.difficulty}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Description</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{problem?.description}</p>
                  </div>

                  {/* Constraints */}
                  {problem?.constraints && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Constraints</h3>
                      <ul className="text-sm text-gray-400 space-y-1">
                        {problem.constraints.map((constraint, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {problem?.examples && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Example</h3>
                      {problem.examples.map((example, idx) => (
                        <div key={idx} className="bg-black/30 rounded p-3 text-xs font-mono text-gray-300 space-y-1">
                          <div>
                            <span className="text-orange-400">Input:</span> {example.input}
                          </div>
                          <div>
                            <span className="text-orange-400">Output:</span> {example.output}
                          </div>
                          <div className="text-gray-500 text-xs">{example.explanation}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== EDITOR PANEL ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`space-y-4 ${showProblem ? 'lg:col-span-2' : 'lg:col-span-3'}`}
          >
            {/* Language Selector */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex gap-2">
                {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-4 py-2 rounded font-medium transition ${
                      language === lang
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
                  title="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  onClick={handleClearCode}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition"
                  title="Clear code"
                >
                  <RotateCw className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden h-96 flex flex-col">
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-black text-white font-mono p-4 resize-none focus:outline-none border-0"
                placeholder="Enter your code here..."
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteCode}
              disabled={executing}
              className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition ${
                executing
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              }`}
            >
              {executing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Execute Code
                </>
              )}
            </button>

            {/* Execution Stats */}
            {stats.total > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { label: 'Passed', value: stats.passed, icon: CheckCircle },
                  { label: 'Total', value: stats.total, icon: BarChart3 },
                  { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Zap },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-center"
                    >
                      <Icon className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Output Panel */}
            {testResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
              >
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  Test Results
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="bg-black/30 rounded p-3 flex items-start gap-3 text-sm"
                    >
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={result.passed ? 'text-green-400' : 'text-red-400'}>
                          Test Case {idx + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                        </p>
                        {!result.passed && (
                          <div className="mt-1 text-gray-400 text-xs space-y-1">
                            <div>Expected: {result.expected}</div>
                            <div>Got: {result.output}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {executionTime && (
                  <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Execution time: {executionTime}ms
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CompetitiveCompilerPage;
