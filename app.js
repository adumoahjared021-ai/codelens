"use strict";

const STORAGE_KEYS = {
  model: "codelens.model",
  theme: "codelens.theme",
  language: "codelens.language",
  depth: "codelens.depth",
};

const MODELS = [
  "google/gemini-3.8-flash",
  "anthropic/claude-opus-5-5",
  "openai/gpt-5.5",
  "deepseek/deepseek-v4-pro",
];
const DEFAULT_MODEL = MODELS[0];

const LANGUAGES = [
  { id: "python", name: "Python", mode: "python", ext: "py" },
  { id: "javascript", name: "JavaScript", mode: { name: "javascript" }, ext: "js" },
  { id: "typescript", name: "TypeScript", mode: { name: "javascript", typescript: true }, ext: "ts" },
  { id: "java", name: "Java", mode: { name: "clike", mime: "text/x-java" }, ext: "java" },
  { id: "c", name: "C", mode: { name: "clike", mime: "text/x-csrc" }, ext: "c" },
  { id: "cpp", name: "C++", mode: { name: "clike", mime: "text/x-c++src" }, ext: "cpp" },
  { id: "csharp", name: "C#", mode: { name: "clike", mime: "text/x-csharp" }, ext: "cs" },
  { id: "go", name: "Go", mode: "go", ext: "go" },
  { id: "rust", name: "Rust", mode: "rust", ext: "rs" },
  { id: "ruby", name: "Ruby", mode: "ruby", ext: "rb" },
  { id: "php", name: "PHP", mode: { name: "php", mime: "text/x-php" }, ext: "php" },
  { id: "swift", name: "Swift", mode: "swift", ext: "swift" },
  { id: "kotlin", name: "Kotlin", mode: { name: "clike", mime: "text/x-kotlin" }, ext: "kt" },
  { id: "html", name: "HTML", mode: "htmlmixed", ext: "html" },
  { id: "css", name: "CSS", mode: "css", ext: "css" },
  { id: "sql", name: "SQL", mode: { name: "sql", mime: "text/x-sql" }, ext: "sql" },
  { id: "shell", name: "Bash / Shell", mode: "shell", ext: "sh" },
  { id: "r", name: "R", mode: "r", ext: "r" },
  { id: "lua", name: "Lua", mode: "lua", ext: "lua" },
  { id: "perl", name: "Perl", mode: "perl", ext: "pl" },
  { id: "json", name: "JSON", mode: { name: "javascript", json: true }, ext: "json" },
  { id: "plaintext", name: "Plain text", mode: null, ext: "txt" },
];

const SAMPLES = {
  python: `def fibonacci(n):
    """Return the first n Fibonacci numbers."""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence


print(fibonacci(10))`,
  javascript: `async function fetchUsers(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`HTTP error: \${response.status}\`);
  }
  const users = await response.json();
  return users.filter((user) => user.active);
}

fetchUsers("/api/users")
  .then((users) => console.log(users))
  .catch((err) => console.error(err));`,
  typescript: `interface User {
  id: number;
  name: string;
  email?: string;
}

function greet(user: User): string {
  const email = user.email ?? "no email provided";
  return \`Hello, \${user.name} (\${email})!\`;
}

const admin: User = { id: 1, name: "Ada" };
console.log(greet(admin));`,
  java: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {4, 8, 15, 16, 23, 42};
        int sum = 0;
        for (int n : numbers) {
            if (n % 2 == 0) {
                sum += n;
            }
        }
        System.out.println("Sum of evens: " + sum);
    }
}`,
  cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    int total = 0;
    for (int n : nums) {
        total += n * n;
    }
    std::cout << "Sum of squares: " << total << std::endl;
    return 0;
}`,
  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        var words = new[] { "apple", "banana", "cherry" };
        var longest = words.OrderByDescending(w => w.Length).First();
        Console.WriteLine($"Longest word: {longest}");
    }
}`,
  go: `package main

import "fmt"

func factorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * factorial(n-1)
}

func main() {
	fmt.Println(factorial(6))
}`,
  rust: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let even_sum: i32 = numbers
        .iter()
        .filter(|n| *n % 2 == 0)
        .sum();
    println!("Sum of evens: {}", even_sum);
}`,
  ruby: `def word_count(text)
  words = text.downcase.split(/\\W+/)
  counts = Hash.new(0)
  words.each { |word| counts[word] += 1 }
  counts.sort_by { |_, count| -count }
end

puts word_count("the quick brown fox jumps over the lazy dog")`,
  php: `<?php
function isPalindrome(string $text): bool {
    $clean = strtolower(preg_replace('/[^a-z0-9]/i', '', $text));
    return $clean === strrev($clean);
}

var_dump(isPalindrome("A man, a plan, a canal: Panama"));`,
  swift: `func average(_ scores: [Double]) -> Double? {
    guard !scores.isEmpty else { return nil }
    let total = scores.reduce(0, +)
    return total / Double(scores.count)
}

if let avg = average([90, 85, 78]) {
    print("Average: \\(avg)")
}`,
  kotlin: `fun main() {
    val temperatures = listOf(12.5, 18.0, 22.3, 9.8)
    val warm = temperatures.filter { it > 15.0 }
    println("Warm days: \${warm.size}")
    warm.forEach { println("\${it}°C") }
}`,
  html: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <header>
    <h1>Welcome</h1>
    <nav><a href="#about">About</a></nav>
  </header>
  <main id="about">
    <p>This is a simple page.</p>
  </main>
</body>
</html>`,
  css: `.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}`,
  sql: `SELECT department, COUNT(*) AS employee_count, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= '2020-01-01'
GROUP BY department
HAVING COUNT(*) > 5
ORDER BY avg_salary DESC;`,
  shell: `#!/bin/bash
for file in *.log; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo "$file: $lines lines"
  fi
done`,
  r: `scores <- c(88, 92, 75, 96, 81)
mean_score <- mean(scores)
above_average <- scores[scores > mean_score]
cat("Above average:", above_average, "\\n")`,
  lua: `local function factorial(n)
  if n <= 1 then
    return 1
  end
  return n * factorial(n - 1)
end

print(factorial(5))`,
  perl: `my @numbers = (3, 1, 4, 1, 5, 9);
my @sorted = sort { $a <=> $b } @numbers;
my %seen;
my @unique = grep { !$seen{$_}++ } @sorted;
print "@unique\\n";`,
  json: `{
  "name": "code-explainer",
  "version": "1.0.0",
  "languages": ["python", "javascript", "go"],
  "settings": {
    "theme": "dark",
    "lineNumbers": true
  }
}`,
};

const GENERIC_SAMPLE = `// Paste or type your code here,
// choose your language above,
// then click Explain.`;

const DEPTH_PROMPTS = {
  beginner:
    "The reader is a complete beginner to programming. Use simple words, short sentences, and everyday analogies. Avoid jargon, and briefly explain any technical term you must use. Start with a one-sentence summary of what the code does overall.",
  "line-by-line":
    "Walk through the code line by line (grouping repetitive or trivial lines into blocks). For each step, quote the relevant line(s) in a code block and explain what they do and why. End with a short summary of the overall behavior.",
  technical:
    "The reader is an experienced developer. Give a technical deep-dive: how the code works internally, time/space complexity where relevant, edge cases, and concrete suggestions for improvement. Be precise and skip beginner-level explanations.",
};

const SYSTEM_PROMPT =
  "You are CodeLens, an expert programming teacher. Explain code clearly and accurately using GitHub-flavored markdown: use headings, short paragraphs, lists, and fenced code blocks with language tags. Only describe behavior actually present in the code — never invent functionality. Keep explanations focused and readable.";

// ---------- DOM ----------
const els = {
  language: document.getElementById("languageSelect"),
  theme: document.getElementById("themeSelect"),
  depth: document.getElementById("depthSelect"),
  explain: document.getElementById("explainBtn"),
  settings: document.getElementById("settingsBtn"),
  emptySettings: document.getElementById("emptySettingsBtn"),
  sample: document.getElementById("sampleBtn"),
  clear: document.getElementById("clearBtn"),
  copy: document.getElementById("copyBtn"),
  output: document.getElementById("explanationOutput"),
  fileName: document.getElementById("fileName"),
  statusState: document.getElementById("statusState"),
  statusCursor: document.getElementById("statusCursor"),
  statusLanguage: document.getElementById("statusLanguage"),
  statusChars: document.getElementById("statusChars"),
  modal: document.getElementById("settingsModal"),
  model: document.getElementById("modelSelect"),
  saveSettings: document.getElementById("saveSettingsBtn"),
  closeSettings: document.getElementById("closeSettingsBtn"),
  toast: document.getElementById("toast"),
};

// ---------- State ----------
let editor;
let isGenerating = false;
let stopRequested = false;
let lastMarkdown = "";
let renderTimer = null;
let toastTimer = null;

// ---------- Init ----------
function init() {
  for (const lang of LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = lang.id;
    opt.textContent = lang.name;
    els.language.appendChild(opt);
  }

  const savedLang = localStorage.getItem(STORAGE_KEYS.language);
  const initialLang = LANGUAGES.some((l) => l.id === savedLang) ? savedLang : "python";
  els.language.value = initialLang;

  els.theme.value = localStorage.getItem(STORAGE_KEYS.theme) || "dracula";
  els.depth.value = localStorage.getItem(STORAGE_KEYS.depth) || "beginner";
  els.model.value = savedModel();

  editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    tabSize: 4,
    indentUnit: 4,
    theme: els.theme.value,
    extraKeys: {
      "Ctrl-Enter": () => els.explain.click(),
      "Cmd-Enter": () => els.explain.click(),
    },
  });

  applyLanguage(initialLang, true);
  updateStatusBar();

  editor.on("cursorActivity", updateStatusBar);
  editor.on("change", updateStatusBar);

  els.language.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.language, els.language.value);
    applyLanguage(els.language.value, false);
  });
  els.theme.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.theme, els.theme.value);
    editor.setOption("theme", els.theme.value);
  });
  els.depth.addEventListener("change", () => {
    localStorage.setItem(STORAGE_KEYS.depth, els.depth.value);
  });

  els.explain.addEventListener("click", () => {
    if (isGenerating) stopGeneration();
    else explainCode();
  });
  els.sample.addEventListener("click", loadSample);
  els.clear.addEventListener("click", () => {
    editor.setValue("");
    editor.focus();
  });
  els.copy.addEventListener("click", copyExplanation);

  els.settings.addEventListener("click", openSettings);
  els.emptySettings.addEventListener("click", openSettings);
  els.closeSettings.addEventListener("click", closeSettings);
  els.saveSettings.addEventListener("click", saveSettings);
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeSettings();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modal.hidden) closeSettings();
  });

  marked.setOptions({ gfm: true, breaks: false });
}

function savedModel() {
  const saved = localStorage.getItem(STORAGE_KEYS.model);
  return MODELS.includes(saved) ? saved : DEFAULT_MODEL;
}

function currentLanguage() {
  return LANGUAGES.find((l) => l.id === els.language.value) || LANGUAGES[0];
}

function applyLanguage(langId, firstLoad) {
  const lang = LANGUAGES.find((l) => l.id === langId) || LANGUAGES[0];
  editor.setOption("mode", lang.mode);
  editor.setOption("theme", els.theme.value);
  els.fileName.textContent = "main." + lang.ext;
  els.statusLanguage.textContent = lang.name;
  if (firstLoad) {
    editor.setValue(SAMPLES[lang.id] || GENERIC_SAMPLE);
  }
  updateStatusBar();
}

function loadSample() {
  const lang = currentLanguage();
  editor.setValue(SAMPLES[lang.id] || GENERIC_SAMPLE);
  editor.focus();
}

function updateStatusBar() {
  const cursor = editor.getCursor();
  els.statusCursor.textContent = `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
  const len = editor.getValue().length;
  els.statusChars.textContent = `${len} character${len === 1 ? "" : "s"}`;
}

function setStatus(text, kind) {
  els.statusState.textContent = text;
  els.statusState.className = "status-item status-" + kind;
}

// ---------- Settings ----------
function openSettings() {
  els.model.value = savedModel();
  els.modal.hidden = false;
  els.model.focus();
}

function closeSettings() {
  els.modal.hidden = true;
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.model, els.model.value);
  closeSettings();
  showToast("Settings saved");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2500);
}

// ---------- Explanation ----------
function setGenerating(active) {
  isGenerating = active;
  const label = els.explain.querySelector("span");
  if (active) {
    label.textContent = "Stop";
    els.explain.classList.add("is-stop");
    els.explain.querySelector("svg").innerHTML = '<rect x="6" y="6" width="12" height="12" rx="1"/>';
    setStatus("Thinking…", "busy");
  } else {
    label.textContent = "Explain";
    els.explain.classList.remove("is-stop");
    els.explain.querySelector("svg").innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function stopGeneration() {
  stopRequested = true;
}

async function explainCode() {
  const code = editor.getValue().trim();
  if (!code) {
    showToast("Add some code first");
    return;
  }
  if (typeof puter === "undefined") {
    renderError("The AI library didn't load. Check your internet connection and reload the page.");
    setStatus("Error", "error");
    return;
  }

  const lang = currentLanguage();
  const depth = els.depth.value;
  const model = savedModel();

  lastMarkdown = "";
  stopRequested = false;
  els.copy.disabled = true;
  els.output.innerHTML =
    '<div class="loading-state"><div class="spinner"></div><span>The AI is reading your code…</span></div>';
  setGenerating(true);

  const prompt = `${SYSTEM_PROMPT}\n\nExplain the following ${lang.name} code.\n\n${DEPTH_PROMPTS[depth]}\n\n\`\`\`${lang.id}\n${code}\n\`\`\``;

  try {
    const response = await puter.ai.chat(prompt, { model, stream: true });
    let firstChunk = true;

    for await (const part of response) {
      if (stopRequested) break;
      if (part && part.text) {
        if (firstChunk) {
          els.output.innerHTML = '<div class="explanation-content streaming-cursor"></div>';
          firstChunk = false;
        }
        lastMarkdown += part.text;
        scheduleRender();
      }
    }

    if (renderTimer) {
      clearTimeout(renderTimer);
      renderTimer = null;
    }

    if (!lastMarkdown) {
      if (stopRequested) {
        renderEmptyState();
        setStatus("Stopped", "ready");
      } else {
        throw new Error("The AI returned an empty response. Please try again.");
      }
    } else {
      renderMarkdown(lastMarkdown, false);
      els.copy.disabled = false;
      setStatus(stopRequested ? "Stopped" : "Ready", "ready");
    }
  } catch (err) {
    renderError(friendlyError(err));
    setStatus("Error", "error");
  } finally {
    setGenerating(false);
  }
}

function friendlyError(err) {
  const message =
    (err && err.message) ||
    (err && err.error && err.error.message) ||
    (typeof err === "string" ? err : "");
  if (/auth|sign.?in|permission|cancel|popup/i.test(message)) {
    return "Puter needs a free account for AI usage. Click Explain again and complete the free sign-in in the popup window.";
  }
  if (/usage|credit|limit|quota|allowance/i.test(message)) {
    return "The free usage allowance was reached. Sign into your Puter account when prompted, or try again later.";
  }
  return message || "Something went wrong. Check your connection and try again.";
}

function scheduleRender() {
  if (renderTimer) return;
  renderTimer = setTimeout(() => {
    renderTimer = null;
    renderMarkdown(lastMarkdown, true);
  }, 80);
}

function renderMarkdown(markdown, streaming) {
  const html = DOMPurify.sanitize(marked.parse(markdown));
  els.output.innerHTML = `<div class="explanation-content${streaming ? " streaming-cursor" : ""}">${html}</div>`;
}

function renderEmptyState() {
  els.output.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z"></path>
        <line x1="9" y1="22" x2="15" y2="22"></line>
      </svg>
      <h2>Understand any code, instantly</h2>
      <p>Paste or type code on the left, pick a language and depth, then hit <strong>Explain</strong> (or <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).</p>
    </div>`;
}

function renderError(message) {
  const box = document.createElement("div");
  box.className = "error-box";
  const title = document.createElement("strong");
  title.textContent = "Couldn't get an explanation";
  const body = document.createElement("p");
  body.textContent = message;
  box.appendChild(title);
  box.appendChild(body);
  els.output.innerHTML = "";
  els.output.appendChild(box);
}

async function copyExplanation() {
  if (!lastMarkdown) return;
  try {
    await navigator.clipboard.writeText(lastMarkdown);
    showToast("Explanation copied");
  } catch {
    showToast("Copy failed — your browser blocked clipboard access");
  }
}

init();