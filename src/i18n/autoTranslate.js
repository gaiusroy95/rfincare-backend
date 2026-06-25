/**
 * Runtime DOM auto-translation.
 *
 * The app only has ~137 hand-written translation keys, but the vast majority of
 * UI text is hardcoded English. This module translates ALL visible text at
 * runtime by walking the DOM, sending unique strings to the backend /translate
 * endpoint (which caches + proxies a machine-translation provider), and swapping
 * the rendered text in place. A MutationObserver keeps dynamically rendered
 * content (route changes, async data) translated too.
 *
 * Caching: per-language map persisted in localStorage so repeat visits are
 * instant and we minimise provider calls.
 */
import { apiClient } from '../lib/apiClient';

const CACHE_PREFIX = 'rfincare_tcache_';
const BATCH_SIZE = 150;
const DEBOUNCE_MS = 200;

// Never translate content inside these.
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA',
  'SVG', 'PATH', 'CANVAS', 'IFRAME', 'KBD', 'SAMP',
]);
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

let currentLang = 'en';
let observer = null;
let installed = false;

const memCache = new Map();           // lang -> Map(sourceText -> translated)
const origText = new WeakMap();       // textNode -> original English
const origAttrs = new WeakMap();      // element -> { attr: originalValue }
const managedNodes = new Set();       // text nodes we have translated
const managedEls = new Set();         // elements whose attrs we have translated

const pending = new Set();            // source strings awaiting fetch
let flushTimer = null;
let processTimer = null;
let saveTimer = null;

function hasLetters(s) {
  // Source language is English (Latin). Skip strings with no translatable letters.
  return /[A-Za-z]/.test(s);
}

function loadCache(lang) {
  if (memCache.has(lang)) return memCache.get(lang);
  const map = new Map();
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + lang);
    if (raw) {
      const obj = JSON.parse(raw);
      Object.keys(obj).forEach((k) => map.set(k, obj[k]));
    }
  } catch {
    /* ignore */
  }
  memCache.set(lang, map);
  return map;
}

function scheduleSave(lang) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const map = loadCache(lang);
      const obj = {};
      map.forEach((v, k) => { obj[k] = v; });
      window.localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(obj));
    } catch {
      /* quota / serialization issues are non-fatal */
    }
  }, 800);
}

function elementSkipped(el) {
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    if (SKIP_TAGS.has(node.tagName)) return true;
    if (node.isContentEditable) return true;
    if (node.getAttribute && node.getAttribute('translate') === 'no') return true;
    const cls = node.classList;
    if (cls && (cls.contains('notranslate') || cls.contains('no-translate'))) return true;
    node = node.parentElement;
  }
  return false;
}

function splitWhitespace(value) {
  const lead = value.match(/^\s*/)[0];
  const trail = value.match(/\s*$/)[0];
  return { lead, core: value.slice(lead.length, value.length - trail.length), trail };
}

function queue(text) {
  const key = text.trim();
  if (!key) return;
  const cache = loadCache(currentLang);
  if (cache.has(key)) return;
  pending.add(key);
  if (!flushTimer) flushTimer = setTimeout(flush, DEBOUNCE_MS);
}

function applyTextNode(node) {
  let orig = origText.get(node);
  if (orig === undefined) {
    orig = node.nodeValue || '';
    origText.set(node, orig);
  }
  if (currentLang === 'en') {
    if (node.nodeValue !== orig) node.nodeValue = orig;
    return;
  }
  const { lead, core, trail } = splitWhitespace(orig);
  if (!core || !hasLetters(core)) return;
  const cache = loadCache(currentLang);
  const translated = cache.get(core);
  if (translated !== undefined) {
    const next = lead + translated + trail;
    if (node.nodeValue !== next) node.nodeValue = next;
    managedNodes.add(node);
  } else {
    queue(core);
  }
}

function applyAttrs(el) {
  let store = origAttrs.get(el);
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    if (!store) { store = {}; origAttrs.set(el, store); }
    if (store[attr] === undefined) store[attr] = el.getAttribute(attr) || '';
    const orig = store[attr];
    if (currentLang === 'en') {
      if (el.getAttribute(attr) !== orig) el.setAttribute(attr, orig);
      continue;
    }
    const key = (orig || '').trim();
    if (!key || !hasLetters(key)) continue;
    const cache = loadCache(currentLang);
    const translated = cache.get(key);
    if (translated !== undefined) {
      if (el.getAttribute(attr) !== translated) el.setAttribute(attr, translated);
      managedEls.add(el);
    } else {
      queue(key);
    }
  }
}

function collectAndApply(root) {
  if (!root || !document.body) return;
  // Text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const v = node.nodeValue;
      if (!v || !v.trim() || !hasLetters(v)) return NodeFilter.FILTER_REJECT;
      if (elementSkipped(node.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes = [];
  let n;
  // eslint-disable-next-line no-cond-assign
  while ((n = walker.nextNode())) textNodes.push(n);

  // Elements with translatable attributes
  const elWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(el) {
      if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
      for (const a of ATTRS) if (el.hasAttribute(a)) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    },
  });
  const els = [];
  let e;
  // eslint-disable-next-line no-cond-assign
  while ((e = elWalker.nextNode())) els.push(e);

  pauseObserver();
  for (const node of textNodes) applyTextNode(node);
  for (const el of els) applyAttrs(el);
  resumeObserver();
}

async function flush() {
  flushTimer = null;
  const lang = currentLang;
  if (lang === 'en' || pending.size === 0) { pending.clear(); return; }

  const cache = loadCache(lang);
  const need = [...pending].filter((k) => !cache.has(k));
  pending.clear();
  if (need.length === 0) { reapply(); return; }

  try {
    for (let i = 0; i < need.length; i += BATCH_SIZE) {
      const batch = need.slice(i, i + BATCH_SIZE);
      // eslint-disable-next-line no-await-in-loop
      const res = await apiClient.post('/translate', { q: batch, target: lang, source: 'en' });
      const out = res?.data?.translations || [];
      batch.forEach((k, idx) => cache.set(k, out[idx] ?? k));
    }
    scheduleSave(lang);
  } catch {
    // Provider/network issue — leave text in English; will retry on next pass.
    return;
  }
  if (currentLang === lang) reapply();
}

function reapply() {
  // Re-apply translations now that the cache is populated.
  collectAndApply(document.body);
}

function pauseObserver() {
  if (observer) observer.disconnect();
}
function resumeObserver() {
  if (observer && document.body) {
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ATTRS,
    });
  }
}

function scheduleProcess() {
  if (processTimer) return;
  processTimer = setTimeout(() => {
    processTimer = null;
    collectAndApply(document.body);
  }, DEBOUNCE_MS);
}

function onMutations(mutations) {
  if (currentLang === 'en') return;
  for (const m of mutations) {
    if (m.type === 'characterData') {
      // External (React) change to a node we manage — recapture the new English.
      if (origText.has(m.target)) origText.delete(m.target);
    } else if (m.type === 'attributes') {
      const store = origAttrs.get(m.target);
      if (store && m.attributeName) delete store[m.attributeName];
    }
  }
  scheduleProcess();
}

function restoreEnglish() {
  pauseObserver();
  for (const node of managedNodes) {
    if (!node.isConnected) { managedNodes.delete(node); continue; }
    const orig = origText.get(node);
    if (orig !== undefined && node.nodeValue !== orig) node.nodeValue = orig;
  }
  for (const el of managedEls) {
    if (!el.isConnected) { managedEls.delete(el); continue; }
    const store = origAttrs.get(el);
    if (store) {
      for (const attr of ATTRS) {
        if (store[attr] !== undefined && el.getAttribute(attr) !== store[attr]) {
          el.setAttribute(attr, store[attr]);
        }
      }
    }
  }
  resumeObserver();
}

export function setAutoTranslateLanguage(lang) {
  const code = (lang || 'en').split('-')[0];
  currentLang = code;
  if (typeof document === 'undefined' || !document.body) return;
  if (code === 'en') {
    restoreEnglish();
    return;
  }
  collectAndApply(document.body);
}

export function installAutoTranslate(i18n) {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  observer = new MutationObserver(onMutations);

  const start = () => {
    setAutoTranslateLanguage(i18n.language);
    resumeObserver();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  i18n.on('languageChanged', (lang) => setAutoTranslateLanguage(lang));
}
