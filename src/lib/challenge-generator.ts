import type { CodeChallenge, ChallengeDifficulty, ChallengeTheme } from '@/types'

// ============================================
// Challenge Templates by Theme and Difficulty
// ============================================

interface ChallengeTemplate {
    title: string
    description: string
    starterCode: string
    tests: Array<{ input: string; expected: string }>
    baseXp: number
}

const CHALLENGE_TEMPLATES: Record<ChallengeTheme, Record<ChallengeDifficulty, ChallengeTemplate[]>> = {
    strings: {
        easy: [
            {
                title: 'Reverse String',
                description: `🎯 CHALLENGE: String Reversal

You're building a text processing utility. Your first task is to reverse strings - a fundamental operation used in palindrome detection, encryption, and data transformation.

📋 TASK:
Write \`solve(input)\` that reverses the input string character by character.

💡 HINTS:
• Consider using array methods: split(), reverse(), join()
• Or use a loop to build the reversed string
• Edge case: single characters should return unchanged

📝 EXAMPLES:
• "hello" → "olleh"
• "JavaScript" → "tpircSavaJ"
• "12345" → "54321"`,
                starterCode: `function solve(input) {
  // Step 1: Convert string to array of characters
  // Step 2: Reverse the array
  // Step 3: Join back to string
  return ''
}
`,
                tests: [
                    { input: 'hello', expected: 'olleh' },
                    { input: 'world', expected: 'dlrow' },
                    { input: 'a', expected: 'a' },
                    { input: 'racecar', expected: 'racecar' },
                    { input: '12345', expected: '54321' },
                ],
                baseXp: 12,
            },
            {
                title: 'First and Last',
                description: `🎯 CHALLENGE: Extract Boundaries

In data parsing, you often need to extract the first and last elements. This pattern appears in log analysis, string validation, and boundary checking.

📋 TASK:
Write \`solve(input)\` that returns the first and last character joined.

💡 HINTS:
• Access first char with input[0]
• Access last char with input[input.length - 1]
• Single char: return it twice

📝 EXAMPLES:
• "hello" → "ho"
• "world" → "wd"
• "a" → "aa"`,
                starterCode: `function solve(input) {
  // Get first character
  // Get last character
  // Return them concatenated
  return ''
}
`,
                tests: [
                    { input: 'hello', expected: 'ho' },
                    { input: 'world', expected: 'wd' },
                    { input: 'a', expected: 'aa' },
                    { input: 'JavaScript', expected: 'Jt' },
                ],
                baseXp: 10,
            },
            {
                title: 'Repeat Pattern',
                description: `🎯 CHALLENGE: String Multiplication

Pattern repetition is essential in generating test data, creating visual separators, and building formatted output.

📋 TASK:
Write \`solve(input)\` where input is "text,n". Repeat text n times.

💡 HINTS:
• Split input by comma to get [text, n]
• Use string.repeat(n) or a loop
• Parse n as integer

📝 EXAMPLES:
• "ab,3" → "ababab"
• "x,5" → "xxxxx"
• "hi,2" → "hihi"`,
                starterCode: `function solve(input) {
  const [text, n] = input.split(',')
  // Repeat text n times
  return ''
}
`,
                tests: [
                    { input: 'ab,3', expected: 'ababab' },
                    { input: 'x,5', expected: 'xxxxx' },
                    { input: 'hi,2', expected: 'hihi' },
                    { input: 'test,1', expected: 'test' },
                ],
                baseXp: 12,
            },
        ],
        medium: [
            {
                title: 'Palindrome Check',
                description: `🎯 CHALLENGE: Palindrome Detection

Palindromes are strings that read the same forwards and backwards. Used in DNA sequence analysis, word games, and data validation.

📋 TASK:
Write \`solve(input)\` that returns "true" if input is a palindrome, "false" otherwise.

💡 ALGORITHM:
1. Compare string with its reverse
2. Or: use two pointers from start and end

⚠️ EDGE CASES:
• Single character = always palindrome
• Empty string = technically a palindrome

📝 EXAMPLES:
• "racecar" → "true"
• "hello" → "false"
• "abba" → "true"`,
                starterCode: `function solve(input) {
  // Compare input with its reverse
  // Return 'true' or 'false' as string
  return 'false'
}
`,
                tests: [
                    { input: 'racecar', expected: 'true' },
                    { input: 'hello', expected: 'false' },
                    { input: 'a', expected: 'true' },
                    { input: 'abba', expected: 'true' },
                    { input: 'abcba', expected: 'true' },
                ],
                baseXp: 22,
            },
            {
                title: 'Word Counter',
                description: `🎯 CHALLENGE: Text Analysis

Word counting is fundamental in text processing - used in readability analysis, search engines, and content management.

📋 TASK:
Write \`solve(input)\` that counts words. Words are separated by spaces.

💡 HINTS:
• Split by space to get array of words
• Filter out empty strings (multiple spaces)
• Return count as string

⚠️ EDGE CASES:
• Multiple spaces between words
• Leading/trailing spaces

📝 EXAMPLES:
• "hello world" → "2"
• "one  two  three" → "3"
• "single" → "1"`,
                starterCode: `function solve(input) {
  // Split by spaces
  // Filter empty strings
  // Return count
  return '0'
}
`,
                tests: [
                    { input: 'hello world', expected: '2' },
                    { input: 'one two three', expected: '3' },
                    { input: 'single', expected: '1' },
                    { input: 'a  b  c', expected: '3' },
                ],
                baseXp: 18,
            },
            {
                title: 'Capitalize Words',
                description: `🎯 CHALLENGE: Title Case Transformation

Proper capitalization is essential for formatting names, titles, and user-facing content.

📋 TASK:
Write \`solve(input)\` that capitalizes the first letter of each word.

💡 ALGORITHM:
1. Split into words
2. For each word: uppercase first char + rest
3. Join back with spaces

📝 EXAMPLES:
• "hello world" → "Hello World"
• "the quick fox" → "The Quick Fox"
• "javaScript" → "Javascript"`,
                starterCode: `function solve(input) {
  // Split into words
  // Capitalize each word
  // Join back
  return ''
}
`,
                tests: [
                    { input: 'hello world', expected: 'Hello World' },
                    { input: 'the quick fox', expected: 'The Quick Fox' },
                    { input: 'javascript', expected: 'Javascript' },
                    { input: 'a b c', expected: 'A B C' },
                ],
                baseXp: 20,
            },
        ],
        hard: [
            {
                title: 'Anagram Check',
                description: `🎯 CHALLENGE: Anagram Verification

Two words are anagrams if they contain the same characters with the same frequency.

📋 TASK:
Input is "word1,word2". Return "true" if anagrams, "false" otherwise.

💡 ALGORITHM:
1. Sort both strings' characters alphabetically
2. Compare the sorted versions
3. Or: count character frequencies in each

⚠️ CONSIDERATIONS:
• Case sensitivity (assume lowercase)
• Same length required for anagrams

📝 EXAMPLES:
• "listen,silent" → "true"
• "hello,world" → "false"
• "evil,vile" → "true"`,
                starterCode: `function solve(input) {
  const [a, b] = input.split(',')
  // Sort both strings and compare
  // Or count character frequencies
  return 'false'
}
`,
                tests: [
                    { input: 'listen,silent', expected: 'true' },
                    { input: 'hello,world', expected: 'false' },
                    { input: 'evil,vile', expected: 'true' },
                    { input: 'abc,cba', expected: 'true' },
                    { input: 'aab,aba', expected: 'true' },
                ],
                baseXp: 40,
            },
            {
                title: 'Run-Length Encoding',
                description: `🎯 CHALLENGE: Data Compression

RLE is a simple compression algorithm. Compress repeated characters.

📋 TASK:
Compress: consecutive identical chars → char + count.

💡 ALGORITHM:
1. Iterate through string
2. Count consecutive repeats
3. Append char + count to result
4. Reset count on new character

📝 EXAMPLES:
• "aaabbc" → "a3b2c1"
• "aabbcc" → "a2b2c2"
• "abcd" → "a1b1c1d1"`,
                starterCode: `function solve(input) {
  let result = ''
  let count = 1
  // Iterate and count consecutive chars
  return ''
}
`,
                tests: [
                    { input: 'aaabbc', expected: 'a3b2c1' },
                    { input: 'aabbcc', expected: 'a2b2c2' },
                    { input: 'abc', expected: 'a1b1c1' },
                    { input: 'aaaa', expected: 'a4' },
                ],
                baseXp: 45,
            },
            {
                title: 'Longest Substring',
                description: `🎯 CHALLENGE: Substring Analysis

Find the length of the longest substring without repeating characters.

📋 TASK:
Return the length of longest substring with all unique chars.

💡 ALGORITHM (Sliding Window):
1. Use a Set to track current window chars
2. Expand window right, shrink from left on duplicate
3. Track maximum window size

📝 EXAMPLES:
• "abcabcbb" → "3" (abc)
• "bbbbb" → "1" (b)
• "pwwkew" → "3" (wke)`,
                starterCode: `function solve(input) {
  // Sliding window approach
  let left = 0, maxLen = 0
  const seen = new Set()
  // Implement sliding window
  return '0'
}
`,
                tests: [
                    { input: 'abcabcbb', expected: '3' },
                    { input: 'bbbbb', expected: '1' },
                    { input: 'pwwkew', expected: '3' },
                    { input: 'abcdef', expected: '6' },
                ],
                baseXp: 55,
            },
        ],
    },
    arrays: {
        easy: [
            {
                title: 'Sum Numbers',
                description: `🎯 CHALLENGE: Array Aggregation

Calculating sums is a foundational operation for statistics, scores, and cart totals.

📋 TASK:
Write \`solve(input)\` to sum comma-separated numbers.

💡 HINTS:
• Split string by ','
• Convert strings to numbers (parseInt or Number)
• Use reduce or a loop

⚠️ EDGE CASES:
• Single number
• Negative numbers

📝 EXAMPLES:
• "1,2,3" → "6"
• "10,20" → "30"
• "-5,5" → "0"`,
                starterCode: `function solve(input) {
  // 1. Split by comma
  // 2. Convert to numbers
  // 3. Sum them up
  return '0'
}
`,
                tests: [
                    { input: '1,2,3', expected: '6' },
                    { input: '10,20,30', expected: '60' },
                    { input: '5', expected: '5' },
                    { input: '-10,10', expected: '0' },
                    { input: '100,200', expected: '300' },
                ],
                baseXp: 12,
            },
            {
                title: 'Find Maximum',
                description: `🎯 CHALLENGE: Find Extremes

Finding the maximum or minimum value is essential for data analysis, leaderboards, and optimization.

📋 TASK:
Write \`solve(input)\` to find the largest number.

💡 HINTS:
• Split and convert to numbers
• Use Math.max(...arr) or a loop
• Handle negative numbers correctly

📝 EXAMPLES:
• "1,5,3" → "5"
• "-1,-5" → "-1"
• "42" → "42"`,
                starterCode: `function solve(input) {
  // Find the largest number
  // Math.max might be useful
  return '0'
}
`,
                tests: [
                    { input: '3,1,4,1,5', expected: '5' },
                    { input: '10,5,8', expected: '10' },
                    { input: '-1,-5,-2', expected: '-1' },
                    { input: '0,0,0', expected: '0' },
                    { input: '100', expected: '100' },
                ],
                baseXp: 12,
            },
            {
                title: 'Count Elements',
                description: `🎯 CHALLENGE: Array Length

Counting items is the simplest form of data processing.

📋 TASK:
Count how many items are in the list.

💡 HINTS:
• Split by ','
• Check the .length property

📝 EXAMPLES:
• "a,b,c" → "3"
• "1" → "1"
• "x,y" → "2"`,
                starterCode: `function solve(input) {
  // Split string
  // Return length
  return '0'
}
`,
                tests: [
                    { input: 'a,b,c', expected: '3' },
                    { input: '1,2,3,4,5', expected: '5' },
                    { input: 'x', expected: '1' },
                    { input: 'apple,banana,cherry,date', expected: '4' },
                ],
                baseXp: 10,
            },
        ],
        medium: [
            {
                title: 'Sort Numbers',
                description: `🎯 CHALLENGE: Sorting Data

Sorting is crucial for displaying data in order, optimizing lookups, and ranking.

📋 TASK:
Write \`solve(input)\` to sort numbers in ascending order.

💡 HINTS:
• Split and map to Number
• Use array.sort((a, b) => a - b)
• Default sort() converts to string first!

⚠️ COMMON PITFALLS:
• [1, 10, 2] sorts to [1, 10, 2] if you don't use a comparator function

📝 EXAMPLES:
• "3,1,4" → "1,3,4"
• "10,2" → "2,10"`,
                starterCode: `function solve(input) {
  // 1. Convert to numbers
  // 2. Sort numerically
  // 3. Join back
  return ''
}
`,
                tests: [
                    { input: '3,1,4,1,5', expected: '1,1,3,4,5' },
                    { input: '5,4,3,2,1', expected: '1,2,3,4,5' },
                    { input: '1', expected: '1' },
                    { input: '10,2,20', expected: '2,10,20' },
                    { input: '-5,5,0', expected: '-5,0,5' },
                ],
                baseXp: 20,
            },
            {
                title: 'Filter Unique',
                description: `🎯 CHALLENGE: Deduplication

Removing duplicates is key for data cleaning and ensuring data integrity.

📋 TASK:
Return unique values from the list, keeping original order of first appearance.

💡 HINTS:
• Use new Set(array)
• Or filter with indexOf
• Or reduce

📝 EXAMPLES:
• "a,b,a" → "a,b"
• "1,1,1" → "1"
• "x,y,z" → "x,y,z"`,
                starterCode: `function solve(input) {
  // Use Set or filter to remove duplicates
  return ''
}
`,
                tests: [
                    { input: 'a,b,a,c,b', expected: 'a,b,c' },
                    { input: '1,1,1', expected: '1' },
                    { input: 'x,y,z', expected: 'x,y,z' },
                    { input: 'hello,world,hello', expected: 'hello,world' },
                    { input: 'a,a,b,b', expected: 'a,b' },
                ],
                baseXp: 22,
            },
            {
                title: 'Reverse Array',
                description: `🎯 CHALLENGE: Data Reversal

Reversing data is used in undo operations, stacks, and displaying chronological feeds.

📋 TASK:
Reverse the order of elements in the comma-separated list.

💡 HINTS:
• Split by ','
• Use .reverse()
• Join back

📝 EXAMPLES:
• "a,b,c" → "c,b,a"
• "1,2,3" → "3,2,1"`,
                starterCode: `function solve(input) {
  // Reverse the array
  return ''
}
`,
                tests: [
                    { input: 'a,b,c', expected: 'c,b,a' },
                    { input: '1,2,3,4,5', expected: '5,4,3,2,1' },
                    { input: 'x', expected: 'x' },
                    { input: 'first,last', expected: 'last,first' },
                    { input: '1,,3', expected: '3,,1' },
                ],
                baseXp: 18,
            },
        ],
        hard: [
            {
                title: 'Two Sum',
                description: `🎯 CHALLENGE: Pair Finding

A classic algorithmic interview problem. Find two numbers that add up to a specific target.

📋 TASK:
Input format: "target\\nnum1,num2,num3..."
Return the indices (0-based) of the two numbers that sum to target.

💡 ALGORITHM:
1. Parse target and array
2. Use a Map to store { value: index }
3. For each number, calculate complement (target - num)
4. If complement exists in Map, return indices

⚠️ EDGE CASES:
• Only one valid pair exists
• Numbers can be negative

📝 EXAMPLES:
• "9\\n2,7,11,15" → "0,1" (2+7=9)
• "6\\n3,2,4" → "1,2" (2+4=6)`,
                starterCode: `function solve(input) {
  const [targetStr, numsStr] = input.split('\\n')
  const target = Number(targetStr)
  const nums = numsStr.split(',').map(Number)
  
  // Use a Map to track seen numbers: value -> index
  const seen = new Map()
  
  for (let i = 0; i < nums.length; i++) {
    // Check if complement exists
  }
  return ''
}
`,
                tests: [
                    { input: '9\n2,7,11,15', expected: '0,1' },
                    { input: '6\n3,2,4', expected: '1,2' },
                    { input: '10\n5,5', expected: '0,1' },
                    { input: '0\n-3,3', expected: '0,1' },
                ],
                baseXp: 40,
            },
            {
                title: 'Rotate Array',
                description: `🎯 CHALLENGE: Array Manipulation

Shifting elements is used in cryptography, graphics buffers, and game mechanics.

📋 TASK:
Input format: "k\\nnum1,num2..."
Rotate array to the right by k steps.

💡 ALGORITHM:
1. Parse k and array
2. Normalize k: k = k % length
3. Slice array into two parts:
   - Last k elements
   - First len-k elements
4. Concatenate them

📝 EXAMPLES:
• "1\\n1,2,3" → "3,1,2"
• "2\\n1,2,3,4,5" → "4,5,1,2,3"`,
                starterCode: `function solve(input) {
  const [kStr, numsStr] = input.split('\\n')
  const k = Number(kStr)
  const nums = numsStr.split(',')
  
  // Calculate effective rotation
  // Slice and recombine
  return ''
}
`,
                tests: [
                    { input: '2\n1,2,3,4,5', expected: '4,5,1,2,3' },
                    { input: '3\na,b,c,d', expected: 'b,c,d,a' },
                    { input: '1\nx,y', expected: 'y,x' },
                    { input: '5\n1,2,3', expected: '2,3,1' }, // k > length (5%3=2)
                ],
                baseXp: 35,
            },
            {
                title: 'Merge Sorted',
                description: `🎯 CHALLENGE: Merge Algorithms

Merging sorted datasets is fundamental to efficient sorting (Merge Sort) and database joins.

📋 TASK:
Input: "1,3,5|2,4,6" (two sorted arrays separated by |).
Return one merged sorted array.

💡 ALGORITHM:
1. Parse both arrays
2. Use two pointers (p1, p2)
3. Compare elements at pointers
4. Push smaller element to result and advance pointer
5. Append remaining elements

📝 EXAMPLES:
• "1,3|2,4" → "1,2,3,4"
• "1,5|2,3" → "1,2,3,5"`,
                starterCode: `function solve(input) {
  const [arr1Str, arr2Str] = input.split('|')
  const arr1 = arr1Str.split(',').map(Number)
  const arr2 = arr2Str.split(',').map(Number)
  
  // Merge two sorted arrays
  // Use while loops and pointers
  return ''
}
`,
                tests: [
                    { input: '1,3,5|2,4,6', expected: '1,2,3,4,5,6' },
                    { input: '10,30|20,40', expected: '10,20,30,40' },
                    { input: '1,2|3', expected: '1,2,3' },
                    { input: '5|1', expected: '1,5' },
                ],
                baseXp: 45,
            },
        ],
    },
    math: {
        easy: [
            {
                title: 'Is Even',
                description: `🎯 CHALLENGE: Parity Check

Checking if a number is even or odd is a fundamental logic gate in programming.

📋 TASK:
Write \`solve(input)\` that returns "true" if the number is even, "false" otherwise.

💡 HINTS:
• Use the modulo operator (%)
• Even numbers have a remainder of 0 when divided by 2
• Input is a string, parse it first!

⚠️ EDGE CASES:
• "0" is even
• Negative numbers work the same way

📝 EXAMPLES:
• "4" → "true"
• "7" → "false"
• "0" → "true"`,
                starterCode: `function solve(input) {
  const num = Number(input)
  // Check if num % 2 is 0
  return 'false'
}
`,
                tests: [
                    { input: '4', expected: 'true' },
                    { input: '7', expected: 'false' },
                    { input: '0', expected: 'true' },
                    { input: '-2', expected: 'true' },
                    { input: '101', expected: 'false' },
                ],
                baseXp: 5,
            },
            {
                title: 'Factorial',
                description: `🎯 CHALLENGE: Combinatorics

Factorial (n!) calculates the number of ways to arrange n items.
5! = 5 × 4 × 3 × 2 × 1 = 120.

📋 TASK:
Calculate the factorial of the input number.

💡 ALGORITHM:
• Base case: 0! = 1
• Loop from 1 to n multiplying the result
• Or use recursion

📝 EXAMPLES:
• "5" → "120"
• "3" → "6"
• "0" → "1"`,
                starterCode: `function solve(input) {
  const n = Number(input)
  let result = 1
  // Multiply result by 1...n
  return result.toString()
}
`,
                tests: [
                    { input: '5', expected: '120' },
                    { input: '0', expected: '1' },
                    { input: '1', expected: '1' },
                    { input: '4', expected: '24' },
                    { input: '6', expected: '720' },
                ],
                baseXp: 10,
            },
            {
                title: 'Sum Range',
                description: `🎯 CHALLENGE: Series Summation

Calculate the sum of all numbers from 1 to n.
Also known as the nth triangular number.

📋 TASK:
Sum all integers from 1 to input n.

💡 HINTS:
• Loop: sum = 0, add i for i=1 to n
• Formula: n * (n + 1) / 2

📝 EXAMPLES:
• "5" → "15" (1+2+3+4+5)
• "3" → "6" (1+2+3)`,
                starterCode: `function solve(input) {
  const n = Number(input)
  // Sum 1 to n
  return '0'
}
`,
                tests: [
                    { input: '5', expected: '15' },
                    { input: '3', expected: '6' },
                    { input: '10', expected: '55' },
                    { input: '1', expected: '1' },
                    { input: '100', expected: '5050' },
                ],
                baseXp: 8,
            },
        ],
        medium: [
            {
                title: 'Is Prime',
                description: `🎯 CHALLENGE: Prime Numbers

Prime numbers are the atoms of arithmetic, divisible only by themselves and 1.

📋 TASK:
Write \`solve(input)\` that returns "true" is prime, "false" if not.

💡 ALGORITHM:
• Corner cases: 0, 1 are NOT prime. 2 is prime.
• Loop from 2 to Math.sqrt(n)
• If n is divisible by any i, it's not prime

📝 EXAMPLES:
• "7" → "true"
• "4" → "false"
• "1" → "false"`,
                starterCode: `function solve(input) {
  const n = Number(input)
  if (n < 2) return 'false'
  // Check divisors from 2 to sqrt(n)
  return 'true'
}
`,
                tests: [
                    { input: '7', expected: 'true' },
                    { input: '4', expected: 'false' },
                    { input: '2', expected: 'true' },
                    { input: '1', expected: 'false' },
                    { input: '13', expected: 'true' },
                    { input: '100', expected: 'false' },
                ],
                baseXp: 20,
            },
            {
                title: 'FizzBuzz',
                description: `🎯 CHALLENGE: FizzBuzz

The most famous interview question of all time.

📋 TASK:
If n is divisible by 3 → "Fizz"
If n is divisible by 5 → "Buzz"
If n is divisible by 3 AND 5 → "FizzBuzz"
Otherwise → return n as string

💡 HINTS:
• Check divisible by 15 first (or 3 and 5)
• Use % operator

📝 EXAMPLES:
• "3" → "Fizz"
• "5" → "Buzz"
• "15" → "FizzBuzz"`,
                starterCode: `function solve(input) {
  const n = Number(input)
  // Check conditions
  return ''
}
`,
                tests: [
                    { input: '15', expected: 'FizzBuzz' },
                    { input: '9', expected: 'Fizz' },
                    { input: '10', expected: 'Buzz' },
                    { input: '7', expected: '7' },
                    { input: '30', expected: 'FizzBuzz' },
                ],
                baseXp: 15,
            },
            {
                title: 'Sum of Digits',
                description: `🎯 CHALLENGE: Digital Root

Break a number down into its components.

📋 TASK:
Calculate sum of all digits in the number.
"123" → 1 + 2 + 3 = 6.

💡 HINTS:
• Option 1: Convert to string, split, reduce
• Option 2: Modulo 10 loop

📝 EXAMPLES:
• "123" → "6"
• "99" → "18"`,
                starterCode: `function solve(input) {
  // Convert to string or use math
  return '0'
}
`,
                tests: [
                    { input: '123', expected: '6' },
                    { input: '999', expected: '27' },
                    { input: '10', expected: '1' },
                    { input: '0', expected: '0' },
                ],
                baseXp: 12,
            },
        ],
        hard: [
            {
                title: 'Fibonacci',
                description: `🎯 CHALLENGE: Recursion & Sequences

The Fibonacci sequence (0, 1, 1, 2, 3...) appears in nature, art, and finance.

📋 TASK:
Write \`solve(input)\` that returns the nth Fibonacci number (0-indexed).
F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).

💡 HINTS:
• Use recursion (careful with stack overflow for large n!)
• Or use a loop (iterative approach is safer)
• Or use memoization

📝 EXAMPLES:
• "10" → "55"
• "0" → "0"
• "7" → "13"`,
                starterCode: `function solve(input) {
  const n = Number(input)
  if (n <= 1) return n.toString()
  // Calculate iteratively or recursively
  return '0'
}
`,
                tests: [
                    { input: '10', expected: '55' },
                    { input: '0', expected: '0' },
                    { input: '1', expected: '1' },
                    { input: '7', expected: '13' },
                    { input: '12', expected: '144' },
                ],
                baseXp: 30,
            },
            {
                title: 'Greatest Common Divisor',
                description: `🎯 CHALLENGE: Euclidean Algorithm

GCD is useful for simplifying fractions and encryption.

📋 TASK:
Input: "a,b". Return the largest number that divides both.

💡 ALGORITHM:
• Euclidean algorithm:
• GCD(a, b) = GCD(b, a % b)
• Repeat until b is 0. Then a is the GCD.

📝 EXAMPLES:
• "12,18" → "6"
• "10,5" → "5"`,
                starterCode: `function solve(input) {
  const [a, b] = input.split(',').map(Number)
  // Implement GCD algorithm
  return '1'
}
`,
                tests: [
                    { input: '12,18', expected: '6' },
                    { input: '101,103', expected: '1' },
                    { input: '48,18', expected: '6' },
                    { input: '20,10', expected: '10' },
                ],
                baseXp: 35,
            },
            {
                title: 'Power of Two',
                description: `🎯 CHALLENGE: Binary Logic

Checking if a number is a power of two is crucial for memory allocation and bitwise operations.

📋 TASK:
Return "true" if n is a power of two (1, 2, 4, 8...), else "false".

💡 HINTS:
• Logarithmic check: log2(n) is integer?
• Bitwise trick: (n & (n-1)) === 0 (if n > 0)
• Interactive division by 2

📝 EXAMPLES:
• "8" → "true"
• "6" → "false"
• "1" → "true" (2^0)`,
                starterCode: `function solve(input) {
  const n = Number(input)
  if (n <= 0) return 'false'
  // Check if n is power of two
  return 'false'
}
`,
                tests: [
                    { input: '1', expected: 'true' },
                    { input: '2', expected: 'true' },
                    { input: '3', expected: 'false' },
                    { input: '16', expected: 'true' },
                    { input: '1024', expected: 'true' },
                    { input: '1000', expected: 'false' },
                ],
                baseXp: 25,
            },
        ],
    },
    algorithms: {
        easy: [
            {
                title: 'Linear Search',
                description: `🎯 CHALLENGE: Searching

Linear search is the simplest finding algorithm. It checks every element until a match is found.

📋 TASK:
Input format: "target\\nvalue1,value2,value3..."
Return the index of target in the list, or -1 if not found.

💡 HINTS:
• Split the second line by ','
• Use .indexOf() or a loop
• Return string "-1" if not found

📝 EXAMPLES:
• "c\\na,b,c" → "2"
• "x\\na,b,c" → "-1"`,
                starterCode: `function solve(input) {
  const [target, valuesStr] = input.split('\\n')
  const values = valuesStr.split(',')
  // Find index of target
  return '-1'
}
`,
                tests: [
                    { input: 'c\na,b,c,d', expected: '2' },
                    { input: 'x\na,b,c', expected: '-1' },
                    { input: '5\n1,3,5,7', expected: '2' },
                    { input: 'a\na', expected: '0' },
                ],
                baseXp: 10,
            },
            {
                title: 'Count Occurrences',
                description: `🎯 CHALLENGE: Frequency Count

Counting specific items is improving data visibility.

📋 TASK:
Input format: "target\\nvalue1,value2..."
Return how many times target appears in the list.

💡 HINTS:
• Filter then count length?
• Or reduce?
• Or for loop with counter?

📝 EXAMPLES:
• "a\\na,b,a" → "2"
• "x\\na,b,c" → "0"`,
                starterCode: `function solve(input) {
  const [target, valuesStr] = input.split('\\n')
  const values = valuesStr.split(',')
  // Count occurrences of target
  return '0'
}
`,
                tests: [
                    { input: 'a\na,b,a,c,a', expected: '3' },
                    { input: 'x\na,b,c', expected: '0' },
                    { input: '1\n1,1,1,1', expected: '4' },
                    { input: ' \na, ,b', expected: '1' },
                ],
                baseXp: 8,
            },
            {
                title: 'Find Minimum',
                description: `🎯 CHALLENGE: Min Value

Find the smallest number in a list.

📋 TASK:
Input: "num1,num2,num3..."
Return the smallest number.

💡 HINTS:
• Math.min(...arr)
• Cycle through array keeping track of smallest seen

📝 EXAMPLES:
• "3,1,4" → "1"
• "-5,0,5" → "-5"`,
                starterCode: `function solve(input) {
  const nums = input.split(',').map(Number)
  // Find min value
  return '0'
}
`,
                tests: [
                    { input: '3,1,4', expected: '1' },
                    { input: '-5,0,5', expected: '-5' },
                    { input: '100', expected: '100' },
                    { input: '10,9,8', expected: '8' },
                ],
                baseXp: 8,
            },
        ],
        medium: [
            {
                title: 'Binary Search',
                description: `🎯 CHALLENGE: Efficient Search

Binary search splits the search space in half each time, making it O(log n).

📋 TASK:
Input: "target\\nsorted_values..."
Return index of target or -1. Array IS sorted.

💡 ALGORITHM:
1. Low = 0, High = length - 1
2. Mid = floor((Low + High) / 2)
3. If arr[mid] == target: return mid
4. If arr[mid] < target: Low = mid + 1
5. Else: High = mid - 1

📝 EXAMPLES:
• "5\\n1,3,5,7,9" → "2"
• "1\\n1,2,3" → "0"`,
                starterCode: `function solve(input) {
  const [targetStr, numsStr] = input.split('\\n')
  const target = Number(targetStr)
  const nums = numsStr.split(',').map(Number)
  
  // Implement binary search
  return '-1'
}
`,
                tests: [
                    { input: '5\n1,3,5,7,9', expected: '2' },
                    { input: '1\n1,2,3', expected: '0' },
                    { input: '10\n1,2,3', expected: '-1' },
                    { input: '7\n1,3,5,7,9', expected: '3' },
                    { input: '9\n1,3,5,7,9', expected: '4' },
                ],
                baseXp: 25,
            },
            {
                title: 'Simple Sort',
                description: `🎯 CHALLENGE: Bubble/Selection Sort

Implement a basic sorting algorithm.

📋 TASK:
Input: "num1,num2..."
Return numbers sorted in ascending order.
Do NOT use built-in .sort().

💡 ALGORITHM (Bubble Sort):
1. Loop i from 0 to n
2. Loop j from 0 to n-i-1
3. If arr[j] > arr[j+1], swap them

📝 EXAMPLES:
• "3,1,2" → "1,2,3"
• "5,4,3,2,1" → "1,2,3,4,5"`,
                starterCode: `function solve(input) {
  const nums = input.split(',').map(Number)
  // Implement sort manually
  return ''
}
`,
                tests: [
                    { input: '3,1,2', expected: '1,2,3' },
                    { input: '5,4,3,2,1', expected: '1,2,3,4,5' },
                    { input: '1', expected: '1' },
                    { input: '10,2,30', expected: '2,10,30' },
                ],
                baseXp: 25,
            },
        ],
        hard: [
            {
                title: 'Longest Increasing Subsequence',
                description: `🎯 CHALLENGE: Dynamic Programming

Finding patterns in data sequences is critical for financial analysis and genomics.

📋 TASK:
Input: "num1,num2..."
Return the length of the longest subsequence where numbers are strictly increasing.
Note: Subsequence does not need to be contiguous (unlike substring).

💡 ALGORITHM:
1. Create dp array of same length, filled with 1s
2. Nested loop: i from 1 to n, j from 0 to i-1
3. If arr[i] > arr[j], dp[i] = max(dp[i], dp[j] + 1)
4. Return max value in dp array

📝 EXAMPLES:
• "10,9,2,5,3,7,101,18" → "4" (2,3,7,18)
• "0,1,0,3,2,3" → "4" (0,1,2,3)`,
                starterCode: `function solve(input) {
  const nums = input.split(',').map(Number)
  if (nums.length === 0) return '0'
  
  // Initialize DP array
  // Compute LIS length
  return '1'
}
`,
                tests: [
                    { input: '10,9,2,5,3,7,101,18', expected: '4' },
                    { input: '0,1,0,3,2,3', expected: '4' },
                    { input: '7,7,7,7', expected: '1' },
                    { input: '1,3,6,7,9,4,10,5,6', expected: '6' },
                ],
                baseXp: 50,
            },
            {
                title: 'Max Subarray Sum',
                description: `🎯 CHALLENGE: Kadane's Algorithm

Find the contiguous part of an array with the largest sum. Used in signal processing and financial data.

📋 TASK:
Input: "num1,num2..."
Return the maximum sum of any contiguous subarray.

💡 ALGORITHM (Kadane's):
1. currentSum = nums[0], maxSum = nums[0]
2. Loop starting from index 1
3. currentSum = max(num, currentSum + num)
4. maxSum = max(maxSum, currentSum)

📝 EXAMPLES:
• "-2,1,-3,4,-1,2,1,-5,4" → "6" (4,-1,2,1)
• "1" → "1"
• "5,4,-1,7,8" → "23"`,
                starterCode: `function solve(input) {
  const nums = input.split(',').map(Number)
  // Implement Kadane's algorithm
  return '0'
}
`,
                tests: [
                    { input: '-2,1,-3,4,-1,2,1,-5,4', expected: '6' },
                    { input: '1,2,3,4', expected: '10' },
                    { input: '-1,-2,-3', expected: '-1' },
                    { input: '-2,1', expected: '1' },
                    { input: '5,4,-1,7,8', expected: '23' },
                ],
                baseXp: 45,
            },
            {
                title: 'Valid Parentheses',
                description: `🎯 CHALLENGE: Stack Data Structure

Validating nested structures is key for compilers and parsers.

📋 TASK:
Input: String with (){}[].
Return "true" if brackets are balanced and nested correctly.

💡 ALGORITHM:
1. Use a stack []
2. Loop through chars
3. If open bracket, push to stack
4. If close bracket, pop from stack and check match
5. If match fails or stack empty at end, return false

📝 EXAMPLES:
• "()" → "true"
• "()[]{}" → "true"
• "(]" → "false"
• "([)]" → "false"`,
                starterCode: `function solve(input) {
  const stack = []
  const map = { '(': ')', '[': ']', '{': '}' }
  
  // Iterate through characters
  // Use stack for validation
  return 'true'
}
`,
                tests: [
                    { input: '()', expected: 'true' },
                    { input: '()[]{}', expected: 'true' },
                    { input: '(]', expected: 'false' },
                    { input: '([)]', expected: 'false' },
                    { input: '{[]}', expected: 'true' },
                    { input: '((', expected: 'false' },
                ],
                baseXp: 40,
            },
        ],
    },
}

// ============================================
// Challenge Generator
// ============================================

function getLevelDifficulty(level: number): ChallengeDifficulty {
    if (level <= 3) return 'easy'
    if (level <= 6) return 'medium'
    return 'hard'
}

function getXpMultiplier(level: number): number {
    return 1 + (level - 1) * 0.15 // 15% mehr XP pro Level
}

export function generateChallenge(
    theme: ChallengeTheme,
    level: number
): CodeChallenge {
    const difficulty = getLevelDifficulty(level)
    const templates = CHALLENGE_TEMPLATES[theme][difficulty]

    // Zufälliges Template auswählen
    const randomIndex = Math.floor(Math.random() * templates.length)
    const template = templates[randomIndex]

    // XP basierend auf Level berechnen
    const xp = Math.round(template.baseXp * getXpMultiplier(level))

    return {
        id: `challenge-${theme}-${difficulty}-${Date.now()}-${randomIndex}`,
        title: template.title,
        description: template.description,
        starterCode: template.starterCode,
        tests: template.tests,
        rewardXp: xp,
        theme,
        difficulty,
    }
}

export function generateMob(
    id: string,
    name: string,
    emoji: string,
    position: { x: number; y: number },
    level: number,
    theme: ChallengeTheme
): import('@/types').Mob {
    const difficulty = getLevelDifficulty(level)
    const challenge = generateChallenge(theme, level)

    return {
        id,
        name: `${name} Lv.${level}`,
        emoji,
        position,
        level,
        theme,
        difficulty,
        challenge,
    }
}

// Regeneriert die Challenge für ein Mob (nach Defeat für neuen Versuch)
export function regenerateMobChallenge(mob: import('@/types').Mob): import('@/types').Mob {
    const theme = mob.theme ?? 'strings'
    const challenge = generateChallenge(theme, mob.level)

    return {
        ...mob,
        challenge,
    }
}

export { CHALLENGE_TEMPLATES }
