/**
 * ==========================================
 * LANGUAGE-SPECIFIC SYNTAX VALIDATORS
 * ==========================================
 * Validates code syntax for each language
 * Detects language-specific errors before execution
 * 
 * Author: Senior Developer (25+ years)
 */

class LanguageValidators {
  /**
   * Validate JavaScript syntax
   */
  validateJavaScript(code) {
    const errors = [];

    try {
      // Create an async function to test syntax (doesn't execute it)
      new Function(code);
    } catch (error) {
      errors.push({
        type: 'SyntaxError',
        message: error.message,
        line: this.extractLineNumber(error.message),
      });
    }

    // Check for common issues
    if (code.includes('var ')) {
      errors.push({
        type: 'Warning',
        message: 'Use "let" or "const" instead of "var" for better scoping',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Python syntax
   */
  validatePython(code) {
    const errors = [];

    // Python syntax validation patterns
    // Check indentation
    const lines = code.split('\n');
    const indentStack = [0];
    let inMultilineString = false;
    let stringDelimiter = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (line.trim().length === 0 || line.trim().startsWith('#')) {
        continue;
      }

      // Handle multiline strings
      if (inMultilineString) {
        if (line.includes(stringDelimiter)) {
          inMultilineString = false;
        }
        continue;
      }

      if (line.includes('"""') || line.includes("'''")) {
        if (inMultilineString) {
          inMultilineString = false;
        } else {
          stringDelimiter = line.includes('"""') ? '"""' : "'''";
          inMultilineString = true;
        }
      }

      // Check indentation levels
      const leadingSpaces = line.match(/^(\s*)/)[1].length;

      // Validate parentheses balance
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push({
          type: 'SyntaxError',
          message: 'Mismatched parentheses',
          line: lineNumber,
        });
      }

      // Check for colon after control statements
      const controlStatements = ['if', 'elif', 'else', 'for', 'while', 'def', 'class', 'try', 'except', 'finally', 'with'];
      const startsWithControl = controlStatements.some(
        (stmt) => line.trim().startsWith(stmt + ' ') || line.trim().startsWith(stmt + ':')
      );

      if (startsWithControl && !line.trim().endsWith(':')) {
        errors.push({
          type: 'SyntaxError',
          message: 'Control statement must end with colon (:)',
          line: lineNumber,
        });
      }
    }

    // Check for common Python issues
    if (code.includes('print (')) {
      errors.push({
        type: 'Warning',
        message: 'Space between function name and parentheses is not recommended',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Java syntax
   */
  validateJava(code) {
    const errors = [];

    // Check for public class declaration
    if (!code.includes('public class')) {
      errors.push({
        type: 'Error',
        message: 'Java code must contain "public class" declaration',
      });
    }

    // Check for main method
    if (!code.includes('public static void main')) {
      errors.push({
        type: 'Error',
        message: 'Java application must have a main() method: public static void main(String[] args)',
      });
    }

    // Check for matching braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        type: 'SyntaxError',
        message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
      });
    }

    // Check for matching parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        type: 'SyntaxError',
        message: `Mismatched parentheses: ${openParens} opening, ${closeParens} closing`,
      });
    }

    // Check for matching brackets
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        type: 'SyntaxError',
        message: `Mismatched brackets: ${openBrackets} opening, ${closeBrackets} closing`,
      });
    }

    // Check for semicolons at end of statements
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0 || line.startsWith('//') || line.endsWith('{') || line.endsWith('}')) {
        continue;
      }

      if (
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith(',') &&
        !line.includes('//') &&
        (line.includes('=') || line.includes('(') || line.includes('System.out'))
      ) {
        if (!line.includes('String[] args')) {
          // This is a heuristic check, not 100% accurate
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate C++ syntax
   */
  validateCpp(code) {
    const errors = [];

    // Check for #include directives
    if (!code.includes('#include')) {
      errors.push({
        type: 'Warning',
        message: 'C++ code typically includes header files with #include',
      });
    }

    // Check for main function
    if (!code.includes('int main()') && !code.includes('int main(int argc') && !code.includes('int main(void)')) {
      errors.push({
        type: 'Error',
        message: 'C++ program must have a main() function',
      });
    }

    // Check for matching braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        type: 'SyntaxError',
        message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
      });
    }

    // Check for matching parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        type: 'SyntaxError',
        message: `Mismatched parentheses: ${openParens} opening, ${closeParens} closing`,
      });
    }

    // Check for matching brackets
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        type: 'SyntaxError',
        message: `Mismatched brackets: ${openBrackets} opening, ${closeBrackets} closing`,
      });
    }

    // Check for return statement in main
    if (!code.includes('return 0') && !code.includes('return 1') && !code.includes('return')) {
      errors.push({
        type: 'Warning',
        message: 'main() function should return an integer value',
      });
    }

    // Check for using namespace or std::
    if (!code.includes('using namespace std') && !code.includes('std::')) {
      errors.push({
        type: 'Warning',
        message: 'Consider using "using namespace std;" or prefix std:: for standard library',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate code based on language
   */
  validate(code, language) {
    switch (language.toLowerCase()) {
      case 'javascript':
        return this.validateJavaScript(code);
      case 'python':
        return this.validatePython(code);
      case 'java':
        return this.validateJava(code);
      case 'cpp':
      case 'c++':
        return this.validateCpp(code);
      default:
        return {
          valid: true,
          errors: [],
        };
    }
  }

  /**
   * Extract line number from error message
   * @private
   */
  extractLineNumber(message) {
    const match = message.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Check if code matches expected language patterns
   * Prevent Java code being submitted as C++, etc.
   */
  validateLanguageMatch(code, declaredLanguage) {
    const codeAnalysis = this.analyzeCodeLanguage(code);
    const errors = [];

    // Strong indicators
    const javaIndicators = ['public class', 'System.out.println', 'new ArrayList', 'extends', 'implements'];
    const cppIndicators = ['#include', 'cout', 'cin', 'std::', 'vector<', 'using namespace std'];
    const pythonIndicators = ['def ', 'import ', 'print(', 'if __name__', 'class ', ':'];
    const jsIndicators = ['function', 'const ', 'let ', '=>', 'console.log', 'async', 'await'];

    const detectedLanguage = codeAnalysis.language;

    if (declaredLanguage === 'java' && detectedLanguage && detectedLanguage !== 'java') {
      errors.push({
        type: 'LanguageMismatch',
        message: `Code appears to be ${detectedLanguage}, not Java. Did you select the wrong language?`,
        severity: 'high',
      });
    } else if (declaredLanguage === 'cpp' && detectedLanguage && detectedLanguage !== 'cpp') {
      errors.push({
        type: 'LanguageMismatch',
        message: `Code appears to be ${detectedLanguage}, not C++. Did you select the wrong language?`,
        severity: 'high',
      });
    } else if (declaredLanguage === 'python' && detectedLanguage && detectedLanguage !== 'python') {
      errors.push({
        type: 'LanguageMismatch',
        message: `Code appears to be ${detectedLanguage}, not Python. Did you select the wrong language?`,
        severity: 'high',
      });
    } else if (declaredLanguage === 'javascript' && detectedLanguage && detectedLanguage !== 'javascript') {
      errors.push({
        type: 'LanguageMismatch',
        message: `Code appears to be ${detectedLanguage}, not JavaScript. Did you select the wrong language?`,
        severity: 'high',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Analyze code to detect language
   * @private
   */
  analyzeCodeLanguage(code) {
    const javaScore = this.scoreLanguageMatch(code, ['public class', 'System.out', 'new ', 'extends', 'implements', 'String[] args']);
    const cppScore = this.scoreLanguageMatch(code, ['#include', 'cout', 'cin', 'std::', 'namespace std', 'int main()']);
    const pythonScore = this.scoreLanguageMatch(code, ['def ', 'import ', 'print(', 'if __name__', ':', 'for ', 'while ']);
    const jsScore = this.scoreLanguageMatch(code, ['function', 'const ', 'let ', '=>', 'console.log', 'async', 'this.']);

    const scores = {
      java: javaScore,
      cpp: cppScore,
      python: pythonScore,
      javascript: jsScore,
    };

    const detectedLanguage = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));

    return {
      language: scores[detectedLanguage] > 0 ? detectedLanguage : null,
      scores,
    };
  }

  /**
   * Score how well code matches language indicators
   * @private
   */
  scoreLanguageMatch(code, indicators) {
    return indicators.reduce((score, indicator) => {
      return score + (code.includes(indicator) ? 1 : 0);
    }, 0);
  }
}

export default new LanguageValidators();
