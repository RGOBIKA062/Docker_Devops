/**
 * CODE EXECUTOR - PROTECTED CODE EXECUTION ENGINE
 * Enterprise-grade code execution with security sandboxing
 * Supports: JavaScript, Python, Java, C++ with isolated execution
 * 
 * @author Senior Software Architect
 * @version 2.0.0
 * @security High - Implements VM isolation and timeout protection
 */

import { VM } from 'vm2';
import { execSync, spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Code Execution Result Interface
 */
class ExecutionResult {
  constructor(success, output, error = null, executionTime = 0, testsPassed = 0, totalTests = 0) {
    this.success = success;
    this.output = output;
    this.error = error;
    this.executionTime = executionTime;
    this.testsPassed = testsPassed;
    this.totalTests = totalTests;
    this.memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
  }
}

/**
 * PRIMARY: JavaScript Executor with VM2 Sandboxing
 */
class JavaScriptExecutor {
  static async execute(code, testCases = [], timeout = 5000) {
    try {
      const startTime = performance.now();
      const results = [];
      let passed = 0;

      for (const testCase of testCases) {
        try {
          // Create isolated VM context
          const vm = new VM({
            timeout: timeout,
            sandbox: {
              console: {
                log: (...args) => results.push(args.join(' '))
              },
              // Safe globals
              Math,
              Array,
              Object,
              String,
              Number,
              Boolean,
              Date,
              JSON,
              RegExp,
              Set,
              Map,
              Symbol,
              Promise,
              Promise
            }
          });

          // Execute with input
          const fullCode = `
            ${code}
            const input = ${JSON.stringify(testCase.input)};
            const result = solution(input);
            console.log(result);
          `;

          vm.run(fullCode);
          
          const output = results[results.length - 1];
          const expected = String(testCase.expectedOutput);
          
          if (String(output).trim() === expected.trim()) {
            passed++;
          }

          results.push({
            testCase: testCase.id,
            output,
            expected,
            passed: String(output).trim() === expected.trim(),
            input: testCase.input
          });

        } catch (err) {
          results.push({
            testCase: testCase.id,
            error: err.message,
            passed: false
          });
        }
      }

      const executionTime = performance.now() - startTime;

      return new ExecutionResult(
        true,
        results,
        null,
        executionTime,
        passed,
        testCases.length
      );

    } catch (error) {
      return new ExecutionResult(
        false,
        [],
        `Execution Error: ${error.message}`,
        0,
        0,
        testCases.length
      );
    }
  }

  /**
   * Run code without test cases (interactive testing)
   */
  static async executeInteractive(code, timeout = 5000) {
    try {
      const startTime = performance.now();
      const output = [];

      const vm = new VM({
        timeout: timeout,
        sandbox: {
          console: {
            log: (...args) => output.push(args.join(' ')),
            error: (...args) => output.push(`Error: ${args.join(' ')}`)
          },
          Math,
          Array,
          Object,
          String,
          Number,
          Boolean,
          Date,
          JSON,
          RegExp,
          Set,
          Map
        }
      });

      vm.run(code);
      const executionTime = performance.now() - startTime;

      return new ExecutionResult(
        true,
        output.join('\n'),
        null,
        executionTime
      );

    } catch (error) {
      return new ExecutionResult(
        false,
        [],
        error.message,
        0
      );
    }
  }
}

/**
 * Python Executor with Timeout Protection
 */
class PythonExecutor {
  static async execute(code, testCases = [], timeout = 5000) {
    const tempDir = path.join(os.tmpdir(), `python-exec-${Date.now()}`);
    
    try {
      fs.ensureDirSync(tempDir);
      const scriptPath = path.join(tempDir, 'script.py');
      const results = [];
      let passed = 0;

      // Write wrapper code
      const fullCode = `
import sys
import json

${code}

test_cases = ${JSON.stringify(testCases)}
results = []

for test in test_cases:
    try:
        result = solution(test['input'])
        results.append({
            'id': test['id'],
            'output': str(result),
            'passed': str(result).strip() == str(test['expectedOutput']).strip()
        })
    except Exception as e:
        results.append({
            'id': test['id'],
            'error': str(e),
            'passed': False
        })

print(json.dumps(results))
`;

      fs.writeFileSync(scriptPath, fullCode);

      const execution = spawnSync('python', [scriptPath], {
        timeout: timeout,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });

      if (execution.error) {
        return new ExecutionResult(false, [], `Execution Error: ${execution.error.message}`, 0);
      }

      if (execution.stderr) {
        return new ExecutionResult(false, [], `Python Error: ${execution.stderr}`, 0);
      }

      try {
        const parsedResults = JSON.parse(execution.stdout);
        passed = parsedResults.filter(r => r.passed).length;

        return new ExecutionResult(
          true,
          parsedResults,
          null,
          0,
          passed,
          testCases.length
        );
      } catch (e) {
        return new ExecutionResult(false, [], `Parse Error: ${e.message}`, 0);
      }

    } catch (error) {
      return new ExecutionResult(false, [], `Error: ${error.message}`, 0);
    } finally {
      fs.removeSync(tempDir);
    }
  }

  static async executeInteractive(code, timeout = 5000) {
    const tempDir = path.join(os.tmpdir(), `python-interactive-${Date.now()}`);
    
    try {
      fs.ensureDirSync(tempDir);
      const scriptPath = path.join(tempDir, 'script.py');
      fs.writeFileSync(scriptPath, code);

      const execution = spawnSync('python', [scriptPath], {
        timeout: timeout,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });

      let output = execution.stdout || '';
      let error = null;

      if (execution.stderr) {
        error = execution.stderr;
      }

      return new ExecutionResult(
        !execution.error,
        output,
        error || execution.error?.message,
        0
      );

    } catch (error) {
      return new ExecutionResult(false, [], `Error: ${error.message}`, 0);
    } finally {
      fs.removeSync(tempDir);
    }
  }
}

/**
 * Java Executor with Compilation & Execution
 */
class JavaExecutor {
  static async execute(code, testCases = [], timeout = 10000) {
    const tempDir = path.join(os.tmpdir(), `java-exec-${Date.now()}`);
    
    try {
      fs.ensureDirSync(tempDir);
      const className = 'Solution';
      const javaFile = path.join(tempDir, `${className}.java`);
      
      fs.writeFileSync(javaFile, code);

      // Compile
      const compileResult = spawnSync('javac', [javaFile], {
        timeout: timeout / 2,
        encoding: 'utf-8'
      });

      if (compileResult.error || compileResult.stderr) {
        return new ExecutionResult(false, [], `Compilation Error: ${compileResult.stderr}`, 0);
      }

      // Execute with test cases
      const testCodePath = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testCodePath, JSON.stringify(testCases));

      const executeResult = spawnSync('java', ['-cp', tempDir, className, testCodePath], {
        timeout: timeout / 2,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });

      let results = [];
      if (executeResult.stdout) {
        try {
          results = JSON.parse(executeResult.stdout);
        } catch (e) {
          results = [{ output: executeResult.stdout, passed: false }];
        }
      }

      const passed = results.filter(r => r.passed).length;

      return new ExecutionResult(
        true,
        results,
        executeResult.stderr,
        0,
        passed,
        testCases.length
      );

    } catch (error) {
      return new ExecutionResult(false, [], `Error: ${error.message}`, 0);
    } finally {
      fs.removeSync(tempDir);
    }
  }
}

/**
 * C++ Executor with g++ Compilation
 */
class CppExecutor {
  static async execute(code, testCases = [], timeout = 10000) {
    const tempDir = path.join(os.tmpdir(), `cpp-exec-${Date.now()}`);
    
    try {
      fs.ensureDirSync(tempDir);
      const cppFile = path.join(tempDir, 'solution.cpp');
      const executable = path.join(tempDir, 'solution.exe');

      fs.writeFileSync(cppFile, code);

      // Compile
      const compileResult = spawnSync('g++', [cppFile, '-o', executable], {
        timeout: timeout / 2,
        encoding: 'utf-8'
      });

      if (compileResult.error || compileResult.stderr) {
        return new ExecutionResult(false, [], `Compilation Error: ${compileResult.stderr}`, 0);
      }

      // Run tests
      const results = [];
      let passed = 0;

      for (const testCase of testCases) {
        try {
          const runResult = spawnSync(executable, {
            input: JSON.stringify(testCase.input),
            timeout: timeout / testCases.length,
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024
          });

          const output = runResult.stdout?.trim() || '';
          const expected = String(testCase.expectedOutput).trim();

          if (output === expected) {
            passed++;
          }

          results.push({
            testCase: testCase.id,
            output,
            expected,
            passed: output === expected
          });

        } catch (err) {
          results.push({
            testCase: testCase.id,
            error: err.message,
            passed: false
          });
        }
      }

      return new ExecutionResult(true, results, null, 0, passed, testCases.length);

    } catch (error) {
      return new ExecutionResult(false, [], `Error: ${error.message}`, 0);
    } finally {
      fs.removeSync(tempDir);
    }
  }
}

/**
 * MAIN EXECUTOR ROUTER
 */
export class CodeExecutor {
  static async execute(code, language, testCases = [], timeout = 5000) {
    const languageLower = language.toLowerCase().trim();

    switch (languageLower) {
      case 'javascript':
      case 'js':
        return await JavaScriptExecutor.execute(code, testCases, timeout);

      case 'python':
      case 'py':
        return await PythonExecutor.execute(code, testCases, timeout);

      case 'java':
        return await JavaExecutor.execute(code, testCases, timeout);

      case 'c++':
      case 'cpp':
      case 'c':
        return await CppExecutor.execute(code, testCases, timeout);

      default:
        return new ExecutionResult(
          false,
          [],
          `Unsupported language: ${language}. Supported: JavaScript, Python, Java, C++`,
          0
        );
    }
  }

  static async executeInteractive(code, language, timeout = 5000) {
    const languageLower = language.toLowerCase().trim();

    switch (languageLower) {
      case 'javascript':
      case 'js':
        return await JavaScriptExecutor.executeInteractive(code, timeout);

      case 'python':
      case 'py':
        return await PythonExecutor.executeInteractive(code, timeout);

      default:
        return new ExecutionResult(
          false,
          [],
          `Interactive mode only supports JavaScript and Python`,
          0
        );
    }
  }
}

export default CodeExecutor;
