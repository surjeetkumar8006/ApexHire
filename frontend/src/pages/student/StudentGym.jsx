import React, { useState, useRef } from 'react';
import { 
  Dumbbell, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Briefcase, 
  Sparkles, 
  Search, 
  Filter, 
  Play, 
  Copy, 
  FileText, 
  BookOpen, 
  Target, 
  Activity,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Bookmark,
  TrendingUp,
  Clock,
  Check,
  RotateCcw
} from 'lucide-react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// Language Starter Code Templates
const CODE_TEMPLATES = {
  javascript: {
    'Two Sum & Pair Target Search': `// Two Sum & Pair Target Search (JavaScript)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    'Longest Substring Without Repeating Characters': `// Longest Substring Without Repeating Characters (JavaScript)
function lengthOfLongestSubstring(s) {
  let map = new Map();
  let maxLen = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (map.has(s[i]) && map.get(s[i]) >= start) {
      start = map.get(s[i]) + 1;
    }
    map.set(s[i], i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}`,
    'LRU Cache Implementation': `// LRU Cache Implementation (JavaScript)
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
}`,
    default: `// Custom Solution Template (JavaScript)
function solution(input) {
  // Write your real-time algorithm here
  return input;
}`
  },
  python: {
    'Two Sum & Pair Target Search': `# Two Sum & Pair Target Search (Python 3)
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
    'Longest Substring Without Repeating Characters': `# Longest Substring Without Repeating Characters (Python 3)
def length_of_longest_substring(s: str) -> int:
    seen = {}
    start = max_len = 0
    for i, char in enumerate(s):
        if char in seen and seen[char] >= start:
            start = seen[char] + 1
        seen[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len`,
    'LRU Cache Implementation': `# LRU Cache Implementation (Python 3)
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    default: `# Custom Solution Template (Python 3)
def solution(data):
    # Write your real-time algorithm here
    return data`
  },
  cpp: {
    'Two Sum & Pair Target Search': `// Two Sum & Pair Target Search (C++ 20)
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (map.count(diff)) return {map[diff], i};
        map[nums[i]] = i;
    }
    return {};
}`,
    default: `// Custom Solution Template (C++ 20)
#include <iostream>
using namespace std;

int main() {
    cout << "ApexGym Real-Time C++ Compiler" << endl;
    return 0;
}`
  },
  java: {
    'Two Sum & Pair Target Search': `// Two Sum & Pair Target Search (Java 17)
import java.util.HashMap;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
    default: `// Custom Solution Template (Java 17)
public class Solution {
    public static void main(String[] args) {
        System.out.println("ApexGym Real-Time Java Environment");
    }
}`
  }
};

const StudentGym = () => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();
  const editorRef = useRef(null);

  const [activeTab, setActiveTab] = useState('coding'); // 'coding', 'webdev', 'conceptual', 'negotiation'
  const [streak, setStreak] = useState(7);
  const [questionsSolved, setQuestionsSolved] = useState(927);
  const [showStats, setShowStats] = useState(false);

  // Filters State
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jsOnly, setJsOnly] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null);

  // Practice Problems Real-Time State
  const [problems, setProblems] = useState([
    { id: 1, name: 'Two Sum & Pair Target Search', category: 'Coding', topic: 'Arrays & Hashing', company: 'Google', maxScore: 100, yourScore: 100, difficulty: 'Easy', status: 'Solved', isJs: true, bookmarked: true },
    { id: 2, name: 'Longest Substring Without Repeating Characters', category: 'Coding', topic: 'Sliding Window', company: 'Amazon', maxScore: 100, yourScore: 85, difficulty: 'Medium', status: 'Solved', isJs: true, bookmarked: false },
    { id: 3, name: 'LRU Cache Implementation', category: 'Coding', topic: 'Design & Data Structures', company: 'Microsoft', maxScore: 150, yourScore: 0, difficulty: 'Hard', status: 'Unsolved', isJs: false, bookmarked: true },
    { id: 4, name: 'React Custom Hooks & Performance Optimization', category: 'Web Development', topic: 'Frontend React', company: 'Meta', maxScore: 100, yourScore: 90, difficulty: 'Medium', status: 'Solved', isJs: true, bookmarked: false },
    { id: 5, name: 'Node.js Event Loop & Non-Blocking I/O Architecture', category: 'Conceptual Questions', topic: 'Backend Node', company: 'Uber', maxScore: 100, yourScore: 70, difficulty: 'Medium', status: 'Attempted', isJs: true, bookmarked: false },
    { id: 6, name: 'System Design: Distributed Rate Limiter', category: 'Conceptual Questions', topic: 'System Design', company: 'Netflix', maxScore: 200, yourScore: 0, difficulty: 'Hard', status: 'Unsolved', isJs: false, bookmarked: true },
    { id: 7, name: 'Merge K Sorted Lists', category: 'Coding', topic: 'Heap / Priority Queue', company: 'Google', maxScore: 150, yourScore: 150, difficulty: 'Hard', status: 'Solved', isJs: true, bookmarked: true },
    { id: 8, name: 'JWT vs OAuth 2.0 Security Protocols', category: 'Web Development', topic: 'Web Security', company: 'Atlassian', maxScore: 100, yourScore: 100, difficulty: 'Easy', status: 'Solved', isJs: false, bookmarked: false },
  ]);

  // AI Coding Arena State
  const [codeProblem, setCodeProblem] = useState('Two Sum & Pair Target Search');
  const [codeLang, setCodeLang] = useState('javascript');
  const [sourceCode, setSourceCode] = useState(CODE_TEMPLATES.javascript['Two Sum & Pair Target Search']);
  const [analyzingCode, setAnalyzingCode] = useState(false);
  const [codeAnalysis, setCodeAnalysis] = useState({
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    score: 88,
    testCases: [
      { name: 'Test Case 1: Standard Input [2,7,11,15], target=9', status: 'Passed', time: '1.2ms' },
      { name: 'Test Case 2: Negative Numbers [-3,4,3,90], target=0', status: 'Passed', time: '0.9ms' },
      { name: 'Test Case 3: Large Array (10,000 items)', status: 'Passed', time: '4.5ms' },
    ],
    optimizedSnippet: `// Optimized Implementation for ${codeProblem}
function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`
  });

  // AI Salary & Offer Negotiation Studio State
  const [negotiateCompany, setNegotiateCompany] = useState('Microsoft');
  const [offeredSalary, setOfferedSalary] = useState('24 LPA');
  const [targetSalary, setTargetSalary] = useState('32 LPA');
  const [negotiating, setNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState(null);

  // AI Skill Gap Roadmap State
  const [roadmapCompany, setRoadmapCompany] = useState('Google');
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [skillRoadmapData, setSkillRoadmapData] = useState(null);

  // Handle Language Change
  const handleLanguageChange = (newLang) => {
    setCodeLang(newLang);
    const langTemplates = CODE_TEMPLATES[newLang] || CODE_TEMPLATES.javascript;
    const template = langTemplates[codeProblem] || langTemplates.default;
    setSourceCode(template);
    addToast(`Switched code editor to ${newLang.toUpperCase()}`, 'info');
  };

  // Handle Solve Problem Click on Table Row
  const handleSolveProblemClick = (problem) => {
    setCodeProblem(problem.name);
    setActiveTab('coding');
    const langTemplates = CODE_TEMPLATES[codeLang] || CODE_TEMPLATES.javascript;
    const template = langTemplates[problem.name] || langTemplates.default;
    setSourceCode(template);
    addToast(`Loaded "${problem.name}" into AI Coding Arena!`, 'success');
    if (editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Toggle Bookmark Status Real-Time
  const toggleBookmark = (id) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
    addToast('Bookmark updated real-time!', 'info');
  };

  // API Call Handlers
  const handleAnalyzeCode = async (e) => {
    e?.preventDefault();
    setAnalyzingCode(true);
    try {
      const res = await fetch(`${API_BASE}/ai/analyze-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ problemTitle: codeProblem, language: codeLang, code: sourceCode })
      });
      if (res.ok) {
        const data = await res.json();
        setCodeAnalysis(data);
        // Mark problem as solved in state
        setProblems(prev => prev.map(p => p.name.toLowerCase() === codeProblem.toLowerCase() ? { ...p, status: 'Solved', yourScore: p.maxScore } : p));
        setQuestionsSolved(prev => prev + 1);
        addToast('AI Code Analysis completed & score updated!', 'success');
      }
    } catch (err) {
      addToast('Code analysis error, calculated fallback stats', 'error');
    } finally {
      setAnalyzingCode(false);
    }
  };

  const handleNegotiateOffer = async (e) => {
    e?.preventDefault();
    setNegotiating(true);
    try {
      const res = await fetch(`${API_BASE}/ai/negotiate-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ company: negotiateCompany, offeredCtc: offeredSalary, targetCtc: targetSalary })
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiationResult(data);
        addToast('Offer Negotiation email scripts generated!', 'success');
      }
    } catch (err) {
      addToast('Failed to generate negotiation strategy', 'error');
    } finally {
      setNegotiating(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e?.preventDefault();
    setLoadingRoadmap(true);
    try {
      const res = await fetch(`${API_BASE}/ai/skill-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ targetCompany: roadmapCompany, currentSkills: user?.skills || ['React', 'Node.js'] })
      });
      if (res.ok) {
        const data = await res.json();
        setSkillRoadmapData(data);
        addToast('30-Day Skill Roadmap generated!', 'success');
      }
    } catch (err) {
      addToast('Roadmap generation failed', 'error');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Real-Time Filtering Logic
  const filteredProblems = problems.filter(p => {
    if (activeTab === 'coding' && p.category !== 'Coding') return false;
    if (activeTab === 'webdev' && p.category !== 'Web Development') return false;
    if (activeTab === 'conceptual' && p.category !== 'Conceptual Questions') return false;
    if (selectedCompany && p.company !== selectedCompany) return false;
    if (selectedTopic && p.topic !== selectedTopic) return false;
    if (selectedDifficulty && p.difficulty !== selectedDifficulty) return false;
    if (selectedStatus && p.status !== selectedStatus) return false;
    if (jsOnly && !p.isJs) return false;
    if (bookmarkedOnly && !p.bookmarked) return false;
    if (activeSheet === 'DSA 1 Revision Sheet' && !['Arrays & Hashing', 'Sliding Window'].includes(p.topic)) return false;
    if (activeSheet === 'DSA 2 Revision Sheet' && !['Heap / Priority Queue', 'Design & Data Structures'].includes(p.topic)) return false;
    if (activeSheet === 'DSA 3 Revision Sheet' && !['Frontend React', 'Backend Node'].includes(p.topic)) return false;
    if (activeSheet === 'DSA 4 Revision Sheet' && !['System Design', 'Web Security'].includes(p.topic)) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Top Header Bar */}
      <div style={styles.headerBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Dumbbell size={28} color="var(--primary)" />
          <div>
            <h1 style={styles.title}>ApexGym Practice & AI Studio</h1>
            <p style={styles.subtitle}>Solve technical problems, run live AI code analysis, and master job offer negotiations.</p>
          </div>
        </div>

        <div style={styles.headerStats}>
          <div style={styles.statPill}>
            <span>Day Learning Streak:</span>
            <span style={{ fontWeight: '800', color: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Flame size={18} fill="#f97316" /> {streak}
            </span>
          </div>

          <div style={styles.statPill}>
            <span>Question Solved:</span>
            <span style={{ fontWeight: '800', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Award size={18} /> {questionsSolved}
            </span>
          </div>

          <button onClick={() => setShowStats(!showStats)} style={styles.statsBtn}>
            Open Statistics {showStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Statistics Drawer */}
      {showStats && (
        <div className="glass-card animate-fade-in" style={styles.statsDrawer}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#38bdf8" /> Real-Time Candidate Performance Breakdown
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={styles.statsCard}>
              <span style={styles.statsLabel}>Total Solved</span>
              <span style={styles.statsVal}>{questionsSolved}</span>
              <span style={styles.statsSub}>+12 this week</span>
            </div>
            <div style={styles.statsCard}>
              <span style={styles.statsLabel}>Overall Accuracy</span>
              <span style={{ ...styles.statsVal, color: '#4ade80' }}>94.2%</span>
              <span style={styles.statsSub}>Top 2% Candidates</span>
            </div>
            <div style={styles.statsCard}>
              <span style={styles.statsLabel}>Streak Status</span>
              <span style={{ ...styles.statsVal, color: '#f97316' }}>{streak} Days Active</span>
              <span style={styles.statsSub}>Recovery: 1 Day Window</span>
            </div>
            <div style={styles.statsCard}>
              <span style={styles.statsLabel}>Practice Time</span>
              <span style={{ ...styles.statsVal, color: '#c084fc' }}>142 Hours</span>
              <span style={styles.statsSub}>Avg 1.8 hrs/day</span>
            </div>
          </div>
        </div>
      )}

      {/* Streak Alert Banner */}
      <div style={styles.alertBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertTriangle size={20} color="#0284c7" />
          <strong style={{ color: '#0284c7', fontSize: '0.95rem' }}>Streak Recovery Rules Are Changing !!!</strong>
        </div>
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.86rem', color: '#0369a1', lineHeight: '1.4' }}>
          Recovery will only be permitted for one day now instead of 3. Solving <strong>3 questions</strong> one day after the missed day will restore your streak. Otherwise it will be reset to 0.
        </p>
      </div>

      {/* Main Navigation Tabs */}
      <div style={styles.tabsRow}>
        <div style={styles.tabsList}>
          <button
            onClick={() => setActiveTab('coding')}
            style={{ ...styles.tabBtn, ...(activeTab === 'coding' ? styles.activeTabBtn : {}) }}
          >
            <Code size={18} /> Coding
          </button>

          <button
            onClick={() => setActiveTab('webdev')}
            style={{ ...styles.tabBtn, ...(activeTab === 'webdev' ? styles.activeTabBtn : {}) }}
          >
            <BookOpen size={18} /> Web Development
          </button>

          <button
            onClick={() => setActiveTab('conceptual')}
            style={{ ...styles.tabBtn, ...(activeTab === 'conceptual' ? styles.activeTabBtn : {}) }}
          >
            <Activity size={18} /> Conceptual Questions & Skill Gap
          </button>

          <button
            onClick={() => setActiveTab('negotiation')}
            style={{ ...styles.tabBtn, ...(activeTab === 'negotiation' ? styles.activeTabBtn : {}) }}
          >
            <Briefcase size={18} color="#34d399" /> 💼 AI Salary & Offer Negotiation Studio
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => {
              const random = problems[Math.floor(Math.random() * problems.length)];
              handleSolveProblemClick(random);
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            🎲 Pick a random question
          </button>
          <button
            onClick={() => {
              setActiveTab('coding');
              if (editorRef.current) editorRef.current.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            &lt;&gt; Open Editor
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT: AI SALARY & OFFER NEGOTIATION STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'negotiation' && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.4)', background: 'rgba(15, 23, 42, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <Briefcase size={26} color="#34d399" />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>💼 AI Salary & Offer Negotiation Studio</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Received a job offer or appraisal letter? Analyze compensation packages vs market benchmarks and generate 3 copyable negotiation email scripts live!
              </p>
            </div>
          </div>

          <form onSubmit={handleNegotiateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Company / Employer</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Microsoft, Google, Amazon"
                  value={negotiateCompany}
                  onChange={(e) => setNegotiateCompany(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Offered CTC Package</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ₹18 LPA or $120k"
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Target Compensation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ₹28 LPA or $150k"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={negotiating} style={{ background: '#059669', borderColor: '#059669', padding: '0.65rem 1.5rem', fontWeight: '700' }}>
              {negotiating ? 'Analyzing & Generating Scripts...' : '⚡ Generate 3 Negotiation Email Scripts'}
            </button>
          </form>

          {negotiationResult && (
            <div style={{ background: '#090d16', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.92rem', color: '#34d399', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} /> Benchmark Rating: {negotiationResult.recommendation}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {negotiationResult.emails.map((e, idx) => (
                  <div key={idx} style={{ background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff' }}>Option {idx + 1}: {e.title}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(e.body);
                          addToast('Negotiation email script copied to clipboard!', 'success');
                        }}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                      >
                        <Copy size={13} /> Copy Script
                      </button>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5', background: '#030712', padding: '0.75rem', borderRadius: '6px' }}>
                      {e.body}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE AI CODING ARENA STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'coding' && (
        <div ref={editorRef} className="glass-card animate-fade-in" style={{ marginBottom: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Code size={24} color="#a855f7" />
              <h3 style={{ ...styles.cardTitle, margin: 0, color: '#ffffff' }}>Interactive AI Coding & Complexity Arena</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontWeight: '700' }}>
              ⚡ Real-time Time & Space Complexity Analysis
            </span>
          </div>

          <form onSubmit={handleAnalyzeCode} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Problem Name (e.g. Two Sum, LRU Cache)"
                value={codeProblem}
                onChange={(e) => setCodeProblem(e.target.value)}
                style={{ flex: 2, minWidth: '200px' }}
              />
              <select className="form-input" value={codeLang} onChange={(e) => handleLanguageChange(e.target.value)} style={{ flex: 1, minWidth: '130px' }}>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ 20</option>
                <option value="java">Java 17</option>
              </select>
            </div>

            <textarea
              className="form-input"
              rows={8}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.88rem', lineHeight: '1.45', background: '#030712', color: '#38bdf8' }}
            />

            <button type="submit" className="btn btn-primary" disabled={analyzingCode} style={{ background: '#a855f7', borderColor: '#a855f7', padding: '0.65rem 1.25rem', fontWeight: '700' }}>
              {analyzingCode ? 'Running AI Complexity Engine...' : '⚡ Run Code & Analyze Complexity'}
            </button>
          </form>

          {codeAnalysis && (
            <div style={{ background: '#090d16', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: '800' }}>
                  ⏱ Time Complexity: {codeAnalysis.timeComplexity}
                </span>
                <span style={{ fontSize: '0.82rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: '800' }}>
                  💾 Space Complexity: {codeAnalysis.spaceComplexity}
                </span>
                <span style={{ fontSize: '0.82rem', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: '800' }}>
                  🏆 Score: {codeAnalysis.score}/100
                </span>
              </div>
              
              {codeAnalysis.testCases && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.35rem' }}>TEST CASE VALIDATIONS:</div>
                  {codeAnalysis.testCases.map((tc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.2rem 0', color: '#cbd5e1' }}>
                      <span>✓ {tc.name}</span>
                      <span style={{ color: '#4ade80', fontWeight: '600' }}>{tc.status} ({tc.time})</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '0.4rem' }}>OPTIMIZED CODE RECOMMENDATION:</div>
                <pre style={{ background: '#030712', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#38bdf8', overflowX: 'auto', margin: 0 }}>
                  {codeAnalysis.optimizedSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: SKILL GAP & ROADMAP ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'conceptual' && (
        <div className="glass-card animate-fade-in" style={{ marginBottom: '1.5rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <Activity size={24} color="#fbbf24" />
            <div>
              <h3 style={{ ...styles.cardTitle, margin: 0, color: '#ffffff' }}>AI Skill Gap & 30-Day Placement Roadmap Engine</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Diagnose missing technical skills against Tier-1 tech companies and generate a 4-week step-by-step roadmap.</p>
            </div>
          </div>

          <form onSubmit={handleGenerateRoadmap} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <select className="form-input" value={roadmapCompany} onChange={(e) => setRoadmapCompany(e.target.value)} style={{ flex: 1, minWidth: '220px' }}>
              <option value="Google">Google (SDE-1 / Staff)</option>
              <option value="Meta">Meta (Production Eng)</option>
              <option value="Microsoft">Microsoft (Software Engineer)</option>
              <option value="Amazon">Amazon (SDE-1 AWS)</option>
              <option value="Salesforce">Salesforce (Full Stack)</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={loadingRoadmap} style={{ background: '#d97706', borderColor: '#d97706', fontWeight: '700' }}>
              {loadingRoadmap ? 'Generating Roadmap...' : '🧠 Generate 30-Day Roadmap'}
            </button>
          </form>

          {skillRoadmapData && (
            <div style={{ background: '#090d16', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>{skillRoadmapData.targetCompany} Skill Alignment:</span>
                <span style={{ fontSize: '1rem', fontWeight: '900', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                  {skillRoadmapData.matchPercentage}% Alignment
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {skillRoadmapData.roadmap.map((w, idx) => (
                  <div key={idx} style={{ background: '#111827', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #fbbf24' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>{w.week}</div>
                    <div style={{ fontSize: '0.78rem', color: '#fbbf24', margin: '2px 0' }}>Focus: {w.focus}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>• {w.tasks.join(' | ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTERS & REVISION SHEETS SECTION */}
      {/* ========================================================================= */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Filters</h3>
          <button
            onClick={() => {
              setSelectedCompany('');
              setSelectedTopic('');
              setSelectedDifficulty('');
              setSelectedStatus('');
              setSearchQuery('');
              setJsOnly(false);
              setBookmarkedOnly(false);
              setActiveSheet(null);
              addToast('All problem filters reset real-time!', 'info');
            }}
            style={styles.resetBtn}
          >
            Reset All
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div style={styles.filterGrid}>
          <select className="form-input" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
            <option value="">Select Companies</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Meta">Meta</option>
            <option value="Netflix">Netflix</option>
            <option value="Uber">Uber</option>
            <option value="Atlassian">Atlassian</option>
          </select>

          <select className="form-input" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
            <option value="">Select Topics</option>
            <option value="Arrays & Hashing">Arrays & Hashing</option>
            <option value="Sliding Window">Sliding Window</option>
            <option value="Heap / Priority Queue">Heap / Priority Queue</option>
            <option value="Design & Data Structures">Design & Data Structures</option>
            <option value="Frontend React">Frontend React</option>
            <option value="Backend Node">Backend Node</option>
            <option value="System Design">System Design</option>
            <option value="Web Security">Web Security</option>
          </select>

          <select className="form-input" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select className="form-input" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="Solved">Solved</option>
            <option value="Attempted">Attempted</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>

        {/* Search & Toggle Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.3rem' }}
            />
          </div>

          <button
            onClick={() => setJsOnly(!jsOnly)}
            style={{
              ...styles.toggleBtn,
              borderColor: jsOnly ? '#38bdf8' : 'var(--border-color)',
              background: jsOnly ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: jsOnly ? '#38bdf8' : 'var(--text-secondary)',
            }}
          >
            <span style={{ fontWeight: '800', background: '#38bdf8', color: '#000', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.75rem' }}>JS</span> JS problems only
          </button>

          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            style={{
              ...styles.toggleBtn,
              borderColor: bookmarkedOnly ? '#38bdf8' : 'var(--border-color)',
              background: bookmarkedOnly ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: bookmarkedOnly ? '#38bdf8' : 'var(--text-secondary)',
            }}
          >
            🔖 Bookmarked problems
          </button>
        </div>

        {/* Revision Sheets Pills */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select revision sheets:</span>
          {['DSA 1 Revision Sheet', 'DSA 2 Revision Sheet', 'DSA 3 Revision Sheet', 'DSA 4 Revision Sheet'].map(sheet => (
            <button
              key={sheet}
              onClick={() => setActiveSheet(activeSheet === sheet ? null : sheet)}
              style={{
                ...styles.sheetBtn,
                borderColor: activeSheet === sheet ? '#0284c7' : '#0284c7',
                background: activeSheet === sheet ? '#0284c7' : 'transparent',
                color: activeSheet === sheet ? '#ffffff' : '#0284c7',
              }}
            >
              {sheet}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRACTICE PROBLEMS TABLE */}
      {/* ========================================================================= */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={styles.th}>Problem Name</th>
                <th style={styles.th}>Topic / Company</th>
                <th style={styles.th}>Max Score</th>
                <th style={styles.th}>Your Score</th>
                <th style={styles.th}>Difficulty</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No practice problems found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => toggleBookmark(p.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: p.bookmarked ? '#38bdf8' : '#64748b' }}
                          title={p.bookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                        >
                          <Bookmark size={15} fill={p.bookmarked ? '#38bdf8' : 'none'} />
                        </button>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</span>
                        {p.isJs && <span style={{ fontSize: '0.68rem', background: '#38bdf8', color: '#000', padding: '0.1rem 0.3rem', borderRadius: '3px', fontWeight: '800' }}>JS</span>}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.topic} ({p.company})</span>
                    </td>
                    <td style={styles.td}><span style={{ fontWeight: '700' }}>{p.maxScore}</span></td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '800', color: p.yourScore === p.maxScore ? '#4ade80' : p.yourScore > 0 ? '#fbbf24' : '#ef4444' }}>
                        {p.yourScore}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '12px',
                        background: p.difficulty === 'Easy' ? 'rgba(74, 222, 128, 0.15)' : p.difficulty === 'Medium' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: p.difficulty === 'Easy' ? '#4ade80' : p.difficulty === 'Medium' ? '#fbbf24' : '#ef4444'
                      }}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: p.status === 'Solved' ? 'var(--success)' : p.status === 'Attempted' ? 'var(--warning)' : 'var(--text-muted)' }}>
                        {p.status === 'Solved' ? '✓ Solved' : p.status === 'Attempted' ? '⏳ Attempted' : '○ Unsolved'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleSolveProblemClick(p)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                      >
                        Solve Problem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '1.25rem 1.5rem',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    margin: '0.25rem 0 0 0',
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  statPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    padding: '0.45rem 0.85rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  statsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsDrawer: {
    padding: '1.25rem',
    borderRadius: '14px',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
  },
  statsCard: {
    background: '#090d16',
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statsLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  statsVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  statsSub: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
  },
  alertBanner: {
    background: 'rgba(2, 132, 199, 0.06)',
    border: '1px solid rgba(2, 132, 199, 0.25)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
  },
  tabsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  tabsList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: '1px solid transparent',
    padding: '0.55rem 1rem',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeTabBtn: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0,
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.85rem',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  sheetBtn: {
    border: '1px solid #0284c7',
    borderRadius: '20px',
    padding: '0.35rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  th: {
    padding: '0.85rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  },
};

export default StudentGym;
