"use strict";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
const STORAGE_KEYS = {
  apiKey: "codelens.apiKey",
  model: "codelens.model",
  theme: "codelens.theme",
  language: "codelens.language",
  depth: "codelens.depth",
};

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemma-4-31b-it",
];
const DEFAULT_MODEL = MODELS[0];

const WANDBOX_URL = "https://wandbox.org/api/compile.json";
const WANDBOX_COMPILERS = {
  python: "cpython-3.13.8",
  typescript: "typescript-5.6.2",
  java: "openjdk-jdk-22+36",
  c: "gcc-13.2.0-c",
  cpp: "gcc-13.2.0",
  csharp: "mono-6.12.0.199",
  go: "go-1.23.2",
  rust: "rust-1.82.0",
  ruby: "ruby-3.4.9",
  php: "php-8.3.12",
  swift: "swift-6.0.1",
  sql: "sqlite-3.46.1",
  shell: "bash",
  r: "r-4.4.1",
  lua: "lua-5.4.7",
  perl: "perl-5.40.0",
};

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
  run: document.getElementById("runBtn"),
  install: document.getElementById("installBtn"),
  tabExplanation: document.getElementById("tabExplanation"),
  tabOutput: document.getElementById("tabOutput"),
  consoleOutput: document.getElementById("consoleOutput"),
  stdinToggle: document.getElementById("stdinToggle"),
  stdinArrow: document.getElementById("stdinArrow"),
  stdinInput: document.getElementById("stdinInput"),
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
  apiKey: document.getElementById("apiKeyInput"),
  toggleKey: document.getElementById("toggleKeyBtn"),
  model: document.getElementById("modelSelect"),
  saveSettings: document.getElementById("saveSettingsBtn"),
  closeSettings: document.getElementById("closeSettingsBtn"),
  toast: document.getElementById("toast"),
};

// ---------- State ----------
let editor;
let abortController = null;
let isGenerating = false;
let lastMarkdown = "";
let renderTimer = null;
let toastTimer = null;
let installPrompt = null;
let activeTab = "explanation";
let consoleText = "";
let isRunning = false;

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
      "Ctrl-Shift-Enter": () => els.run.click(),
      "Cmd-Shift-Enter": () => els.run.click(),
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
  els.copy.addEventListener("click", copyActive);
  els.run.addEventListener("click", runCode);
  els.stdinToggle.addEventListener("click", () => setStdinOpen(els.stdinInput.hidden));
  els.tabExplanation.addEventListener("click", () => switchTab("explanation"));
  els.tabOutput.addEventListener("click", () => switchTab("output"));

  els.settings.addEventListener("click", () => openSettings());
  els.emptySettings.addEventListener("click", () => openSettings());
  els.closeSettings.addEventListener("click", closeSettings);
  els.saveSettings.addEventListener("click", saveSettings);
  els.toggleKey.addEventListener("click", () => {
    const show = els.apiKey.type === "password";
    els.apiKey.type = show ? "text" : "password";
    els.toggleKey.textContent = show ? "Hide" : "Show";
  });
  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeSettings();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modal.hidden) closeSettings();
  });

  marked.setOptions({ gfm: true, breaks: false });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    els.install.hidden = false;
  });
  els.install.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") els.install.hidden = true;
    installPrompt = null;
  });
  window.addEventListener("appinstalled", () => {
    els.install.hidden = true;
    installPrompt = null;
    showToast("CodeLens installed");
  });
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
function openSettings(notice) {
  els.apiKey.value = localStorage.getItem(STORAGE_KEYS.apiKey) || "";
  els.model.value = savedModel();
  els.modal.hidden = false;
  els.apiKey.focus();
}

function closeSettings() {
  els.modal.hidden = true;
  els.apiKey.type = "password";
  els.toggleKey.textContent = "Show";
}

function saveSettings() {
  const key = els.apiKey.value.trim();
  if (key) localStorage.setItem(STORAGE_KEYS.apiKey, key);
  else localStorage.removeItem(STORAGE_KEYS.apiKey);
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
    abortController = null;
  }
}

function stopGeneration() {
  if (abortController) abortController.abort();
}

async function explainCode() {
  const code = editor.getValue().trim();
  if (!code) {
    showToast("Add some code first");
    return;
  }
  const apiKey = localStorage.getItem(STORAGE_KEYS.apiKey);
  if (!apiKey) {
    openSettings();
    showToast("Add your free Gemini API key first");
    return;
  }

  const lang = currentLanguage();
  const depth = els.depth.value;
  const model = savedModel();

  lastMarkdown = "";
  els.copy.disabled = true;
  els.output.innerHTML =
    '<div class="loading-state"><div class="spinner"></div><span>Gemini is reading your code…</span></div>';
  setGenerating(true);
  abortController = new AbortController();

  const userPrompt = `Explain the following ${lang.name} code.\n\n${DEPTH_PROMPTS[depth]}\n\n\`\`\`${lang.id}\n${code}\n\`\`\``;

  try {
    const response = await fetch(`${API_BASE}${model}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      throw new Error(apiErrorMessage(response.status, errBody));
    }

    await readStream(response.body);
    renderMarkdown(lastMarkdown, false);
    updateCopyButton();
    setStatus("Ready", "ready");
  } catch (err) {
    if (err.name === "AbortError") {
      if (lastMarkdown) {
        renderMarkdown(lastMarkdown, false);
        updateCopyButton();
      } else {
        renderEmptyState();
      }
      setStatus("Stopped", "ready");
    } else {
      renderError(err.message || "Something went wrong. Check your connection and try again.");
      setStatus("Error", "error");
    }
  } finally {
    setGenerating(false);
  }
}

async function readStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      let event;
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }

      if (event.error) {
        throw new Error(event.error.message || "The AI stream failed mid-response.");
      }

      const candidate = event.candidates && event.candidates[0];
      const parts = (candidate && candidate.content && candidate.content.parts) || [];
      for (const part of parts) {
        if (part.thought) continue;
        if (part.text) {
          if (firstChunk) {
            els.output.innerHTML = '<div class="explanation-content streaming-cursor"></div>';
            firstChunk = false;
          }
          lastMarkdown += part.text;
          scheduleRender();
        }
      }
    }
  }
  if (firstChunk) throw new Error("The AI returned an empty response. Please try again.");
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

function apiErrorMessage(status, errBody) {
  const detail = errBody && errBody.error && errBody.error.message;
  switch (status) {
    case 400:
      if (/api key/i.test(detail || "")) {
        return "Your API key was rejected. Open Settings and paste a valid key from aistudio.google.com/apikey.";
      }
      return detail || "The request was rejected (HTTP 400). Please try again.";
    case 403:
      return "This API key doesn't have access to the selected model. Try a different model in Settings.";
    case 404:
      return "The selected model wasn't found. Pick a different model in Settings.";
    case 429:
      return "Free-tier rate limit reached. Wait a minute and try again — the free quota resets over time.";
    case 500:
    case 503:
      return "Google's servers are busy right now. Please try again in a few seconds.";
    default:
      return detail || `Request failed (HTTP ${status}). Please try again.`;
  }
}

// ---------- Tabs & copy ----------
function switchTab(tab) {
  activeTab = tab;
  const isExpl = tab === "explanation";
  els.output.hidden = !isExpl;
  els.consoleOutput.hidden = isExpl;
  els.tabExplanation.classList.toggle("active", isExpl);
  els.tabOutput.classList.toggle("active", !isExpl);
  els.tabExplanation.setAttribute("aria-selected", String(isExpl));
  els.tabOutput.setAttribute("aria-selected", String(!isExpl));
  updateCopyButton();
}

function updateCopyButton() {
  els.copy.disabled = activeTab === "explanation" ? !lastMarkdown : !consoleText;
}

async function copyActive() {
  const text = activeTab === "explanation" ? lastMarkdown : consoleText;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(activeTab === "explanation" ? "Explanation copied" : "Output copied");
  } catch {
    showToast("Copy failed — your browser blocked clipboard access");
  }
}

// ---------- Code execution ----------
function setRunning(active) {
  isRunning = active;
  els.run.disabled = active;
  els.run.querySelector("span").textContent = active ? "Running…" : "Run";
}

function setConsoleStatus(text) {
  const el = els.consoleOutput.querySelector(".console-status");
  if (el) el.textContent = text;
}

function appendConsole(text, kind) {
  const pre = els.consoleOutput.querySelector(".console-pre");
  if (!pre) return;
  const span = document.createElement("span");
  if (kind === "stderr") span.className = "console-stderr";
  span.textContent = text;
  pre.appendChild(span);
  consoleText += text;
  updateCopyButton();
  els.consoleOutput.scrollTop = els.consoleOutput.scrollHeight;
}

function setStdinOpen(open) {
  els.stdinInput.hidden = !open;
  els.stdinToggle.setAttribute("aria-expanded", String(open));
  els.stdinArrow.textContent = open ? "▾" : "▸";
  if (open) els.stdinInput.focus();
}

function readsInput(code, langId) {
  if (langId === "javascript") return /\bprompt\s*\(/.test(code);
  if (langId === "html" || langId === "css") return false;
  return /\b(scanf|fgets|gets|getchar|cin|input\s*\(|raw_input|readline|ReadLine|readLine|Scanner|nextLine|nextInt|nextDouble|nextFloat|bufio|read\s|read\()/.test(code);
}

async function runCode() {
  const code = editor.getValue().trim();
  if (!code) {
    showToast("Add some code first");
    return;
  }
  const lang = currentLanguage();
  const supported = lang.id === "javascript" || lang.id === "html" || lang.id === "css" || WANDBOX_COMPILERS[lang.id];
  if (!supported) {
    showToast(lang.name + " can't be run here" + (lang.id === "kotlin" ? " — the free runner doesn't support it yet" : ""));
    return;
  }
  if (isRunning) return;

  switchTab("output");
  consoleText = "";
  els.consoleOutput.innerHTML = '<div class="console-status">Starting…</div><pre class="console-pre"></pre>';
  const stdin = els.stdinInput.value;
  if (!stdin.trim() && readsInput(code, lang.id)) {
    appendConsole("Hint: this program asks for input. Open \"Program input\" below the editor, type the answers (one per line), then press Run again.\n\n", "stdout");
    setStdinOpen(true);
  }
  setRunning(true);
  try {
    if (lang.id === "javascript") {
      await runJsLocally(code, stdin);
    } else if (lang.id === "html") {
      renderPreview(code, "HTML preview — rendered locally in your browser.");
    } else if (lang.id === "css") {
      renderPreview(wrapCssPreview(code), "CSS preview on sample elements — rendered locally.");
    } else {
      await runWandbox(code, lang, stdin);
    }
  } catch (err) {
    appendConsole((err.message || "Run failed.") + "\n", "stderr");
    setConsoleStatus("Failed.");
  } finally {
    setRunning(false);
  }
}

function runJsLocally(code, stdin) {
  return new Promise((resolve) => {
    const workerSource = `
      const format = (v) => {
        if (typeof v === "string") return v;
        try { return JSON.stringify(v) ?? String(v); } catch { return String(v); }
      };
      const send = (type, args) => self.postMessage({ type, text: args.map(format).join(" ") });
      console.log = (...a) => send("stdout", a);
      console.info = console.log;
      console.warn = (...a) => send("stdout", a);
      console.error = (...a) => send("stderr", a);
      let inputLines = [];
      let inputIndex = 0;
      self.prompt = (msg) => {
        const value = inputIndex < inputLines.length ? inputLines[inputIndex] : null;
        inputIndex++;
        send("stdout", [(msg ? msg + " " : "") + (value === null ? "(no more input — add lines to Program input)" : value)]);
        return value;
      };
      self.onmessage = async (e) => {
        inputLines = (e.data.stdin || "").split("\\n");
        try {
          const fn = new Function('"use strict"; return (async () => {' + e.data.code + '\\n})()');
          const result = await fn();
          if (result !== undefined) send("stdout", [result]);
          self.postMessage({ type: "done" });
        } catch (err) {
          send("stderr", [String((err && err.stack) || err)]);
          self.postMessage({ type: "done" });
        }
      };
    `;
    const worker = new Worker(URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" })));
    const timer = setTimeout(() => {
      worker.terminate();
      appendConsole("Stopped: code ran longer than 5 seconds (possible infinite loop).\n", "stderr");
      setConsoleStatus("Stopped — time limit reached.");
      resolve();
    }, 5000);
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "done") {
        clearTimeout(timer);
        worker.terminate();
        setConsoleStatus("Finished — ran locally in your browser.");
        resolve();
      } else {
        appendConsole(msg.text + "\n", msg.type);
      }
    };
    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      appendConsole((err.message || "Worker error") + "\n", "stderr");
      setConsoleStatus("Finished with errors.");
      resolve();
    };
    setConsoleStatus("Running locally in your browser…");
    worker.postMessage({ code, stdin });
  });
}

async function runWandbox(code, lang, stdin) {
  setConsoleStatus("Running " + lang.name + " on Wandbox — a free public runner (your code is sent to their server)…");
  // Wandbox compiles Java as prog.java, so a public class name would not match the file.
  if (lang.id === "java") {
    code = code.replace(/\bpublic\s+((?:(?:final|abstract|sealed|strictfp)\s+)*)(class|interface|enum|record)\b/g, "$1$2");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ compiler: WANDBOX_COMPILERS[lang.id], code, stdin: stdin || "" }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw new Error("The runner took longer than 60 seconds. Try again.");
    throw new Error("Can't reach the free code runner. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 429) throw new Error("The free runner is busy (rate limit). Wait a few seconds and try again.");
  if (!res.ok) throw new Error("The runner returned an error (HTTP " + res.status + "). Try again.");
  const data = await res.json();
  const compileErr = data.compiler_error || "";
  if (compileErr) appendConsole(compileErr, "stderr");
  if (data.program_output) appendConsole(data.program_output, "stdout");
  const progErr = data.program_error || "";
  if (progErr && progErr !== compileErr && progErr !== data.compiler_message) appendConsole(progErr, "stderr");
  if (data.signal) {
    setConsoleStatus("Killed (" + data.signal + ") — possible infinite loop or time limit.");
  } else if (data.status && data.status !== "0") {
    setConsoleStatus("Finished with exit code " + data.status + ".");
  } else {
    setConsoleStatus("Finished successfully.");
  }
}

function renderPreview(html, status) {
  els.consoleOutput.innerHTML = "";
  const bar = document.createElement("div");
  bar.className = "console-status";
  bar.textContent = status;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.setAttribute("title", "Code preview");
  iframe.srcdoc = html;
  els.consoleOutput.appendChild(bar);
  els.consoleOutput.appendChild(iframe);
  consoleText = html;
  updateCopyButton();
}

function wrapCssPreview(css) {
  return `<!DOCTYPE html>
<html><head><style>${css}</style></head>
<body style="font-family:sans-serif;padding:24px;">
<h1>Heading one</h1>
<p>A paragraph with <a href="#">a link</a> and <strong>bold text</strong>.</p>
<button>Button</button>
<div class="card" style="margin-top:16px;max-width:320px;"><h3>Card title</h3><p>The .card class is a common target.</p></div>
<ul><li>First item</li><li>Second item</li></ul>
</body></html>`;
}

init();