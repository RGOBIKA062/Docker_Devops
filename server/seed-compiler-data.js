/**
 * SAMPLE DATA SEEDER FOR COMPETITIVE COMPILER
 * Run this to populate the database with sample problems and test cases
 * 
 * Usage: node seed-compiler-data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';
import TestCase from './models/TestCase.js';

dotenv.config();

const sampleProblems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    tags: ['Array', 'Hash Table'],
    problemStatement: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    description: 'Find two numbers that add up to target sum',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 9, so we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, so we return [1, 2].'
      }
    ],
    notes: [
      'You may not use the same element twice',
      'Optimal solution uses a hash table for O(n) time complexity',
      'Follow-up: Can you come up with an algorithm that is less than O(n^2) time complexity?'
    ],
    timeComplexity: {
      optimal: 'O(n)',
      bruteForce: 'O(n^2)'
    },
    spaceComplexity: 'O(n)',
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Your code here\n  return [];\n}',
      python: 'def twoSum(nums, target):\n    # Your code here\n    return []',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[2];\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};'
    },
    isFeatured: true,
    isActive: true
  },
  {
    title: 'Reverse String',
    difficulty: 'Easy',
    category: 'String',
    tags: ['String', 'Two Pointers'],
    problemStatement: 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
    description: 'Reverse a string in-place',
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.'
    ],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'The string has been reversed.'
      }
    ],
    notes: [
      'Do it with O(1) extra space',
      'Try to avoid using built-in reverse methods'
    ],
    timeComplexity: {
      optimal: 'O(n)',
      bruteForce: 'O(n)'
    },
    spaceComplexity: 'O(1)',
    starterCode: {
      javascript: 'function reverseString(s) {\n  // Your code here\n}',
      python: 'def reverseString(s):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};'
    },
    isFeatured: false,
    isActive: true
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'String',
    tags: ['String', 'Sliding Window', 'Hash Table'],
    problemStatement: 'Given a string s, find the length of the longest substring without repeating characters.',
    description: 'Find the longest substring without repeating characters',
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    notes: [
      'Use sliding window technique for O(n) solution',
      'Use a hash map to track character indices'
    ],
    timeComplexity: {
      optimal: 'O(n)',
      bruteForce: 'O(n^3)'
    },
    spaceComplexity: 'O(min(n, m)) where m is charset size',
    starterCode: {
      javascript: 'function lengthOfLongestSubstring(s) {\n  // Your code here\n  return 0;\n}',
      python: 'def lengthOfLongestSubstring(s):\n    # Your code here\n    return 0',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your code here\n        return 0;\n    }\n}',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your code here\n        return 0;\n    }\n};'
    },
    isFeatured: true,
    isActive: true
  }
];

const sampleTestCases = [
  // Two Sum test cases
  {
    problemId: null, // Will be set after problem creation
    input: { nums: [2, 7, 11, 15], target: 9 },
    expectedOutput: [0, 1],
    type: 'sample',
    isVisible: true,
    explanation: 'nums[0] + nums[1] == 9, so we return [0, 1].'
  },
  {
    problemId: null,
    input: { nums: [3, 2, 4], target: 6 },
    expectedOutput: [1, 2],
    type: 'sample',
    isVisible: true
  },
  {
    problemId: null,
    input: { nums: [3, 3], target: 6 },
    expectedOutput: [0, 1],
    type: 'hidden',
    isVisible: false
  },
  // Reverse String test cases
  {
    problemId: null,
    input: ['h', 'e', 'l', 'l', 'o'],
    expectedOutput: ['o', 'l', 'l', 'e', 'h'],
    type: 'sample',
    isVisible: true
  },
  {
    problemId: null,
    input: ['H', 'a', 'n', 'n', 'a', 'h'],
    expectedOutput: ['h', 'a', 'n', 'n', 'a', 'H'],
    type: 'sample',
    isVisible: true
  },
  // Longest Substring test cases
  {
    problemId: null,
    input: 'abcabcbb',
    expectedOutput: 3,
    type: 'sample',
    isVisible: true,
    explanation: 'The answer is "abc", with the length of 3.'
  },
  {
    problemId: null,
    input: 'bbbbb',
    expectedOutput: 1,
    type: 'sample',
    isVisible: true,
    explanation: 'The answer is "b", with the length of 1.'
  },
  {
    problemId: null,
    input: 'pwwkew',
    expectedOutput: 3,
    type: 'sample',
    isVisible: true,
    explanation: 'The answer is "wke" or "kew", with the length of 3.'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allcollegeevents');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Problem.deleteMany({});
    await TestCase.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create problems
    const createdProblems = [];
    for (const problemData of sampleProblems) {
      const problem = await Problem.create(problemData);
      createdProblems.push(problem);
      console.log(`✓ Created problem: ${problem.title}`);
    }

    // Create test cases with correct problem IDs
    let testCaseIndex = 0;
    const problemTestCaseCounts = [3, 2, 3]; // Test cases per problem

    for (let i = 0; i < createdProblems.length; i++) {
      const count = problemTestCaseCounts[i];
      for (let j = 0; j < count; j++) {
        const testCaseData = {
          ...sampleTestCases[testCaseIndex],
          problemId: createdProblems[i]._id
        };
        delete testCaseData.problemId; // Remove temporarily
        
        const testCase = await TestCase.create({
          ...testCaseData,
          problemId: createdProblems[i]._id
        });
        console.log(`  ✓ Created test case ${j + 1} for ${createdProblems[i].title}`);
        testCaseIndex++;
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdProblems.length} problems with ${testCaseIndex} test cases`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
