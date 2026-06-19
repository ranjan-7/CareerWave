'use client';

import React, { useState, useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Heading, Eye, Edit3 } from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  className = '',
}: RichTextEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to insert markdown tags at cursor position
  const insertTag = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || 'text') + suffix;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Refocus and re-select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText || 'text').length
      );
    }, 0);
  };

  // Very basic Markdown-to-HTML parser for preview
  const parseMarkdown = (md: string) => {
    if (!md) return '<p class="text-slate-400">Nothing to preview...</p>';
    
    // Escape HTML to prevent XSS
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-800 dark:text-white mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-800 dark:text-white mt-4 mb-1.5">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-slate-900 dark:text-white mt-5 mb-2">$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Bullet Lists (matches lines starting with - or *)
    html = html.replace(/^\s*-\s+(.*)$/gim, '<li class="list-disc ml-5 mb-1">$1</li>');
    html = html.replace(/^\s*\*\s+(.*)$/gim, '<li class="list-disc ml-5 mb-1">$1</li>');
    
    // Numbered Lists
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="list-decimal ml-5 mb-1">$1</li>');
    
    // Line breaks / Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-3">');
    html = html.replace(/\n/g, '<br />');

    // Wrap in standard paragraph if not already block-level
    return `<p class="mb-3">${html}</p>`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        
        {/* Toggle between Write and Preview */}
        <div className="flex rounded-md bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              tab === 'write'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Edit3 className="h-3 w-3" /> Write
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              tab === 'preview'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="rounded-lg border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {tab === 'write' ? (
          <>
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => insertTag('**', '**')}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('*', '*')}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('\n## ')}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Heading 2"
              >
                <Heading className="h-3.5 w-3.5" />
              </button>
              <span className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
              <button
                type="button"
                onClick={() => insertTag('\n- ')}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTag('\n1. ')}
                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || 'Markdown is supported...'}
              className="block w-full min-h-[180px] bg-transparent border-0 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 resize-y"
            />
          </>
        ) : (
          <div 
            className="min-h-[220px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-slate-800 dark:text-slate-200 markdown-preview leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
          />
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
