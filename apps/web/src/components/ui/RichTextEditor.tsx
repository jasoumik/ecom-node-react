"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function RichTextEditor({ value, onChange, label, required, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync initial value or external updates to the editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if content is significantly different to avoid cursor jumping
      // Simple check: if empty or completely different. 
      // For a robust editor, we'd need better diffing, but for this simple one:
      if (value === "" && editorRef.current.innerHTML !== "<br>") {
          editorRef.current.innerHTML = "";
      } else if (editorRef.current.innerHTML === "" && value) {
          editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
        handleInput(); // Sync changes immediately
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title }: { icon: any, command: string, arg?: string, title: string }) => (
    <button
      type="button"
      onClick={(e) => {
          e.preventDefault();
          execCommand(command, arg);
      }}
      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={`border rounded-lg overflow-hidden transition-all ${isFocused ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200 dark:border-slate-700'}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <ToolbarButton icon={Bold} command="bold" title="Bold" />
          <ToolbarButton icon={Italic} command="italic" title="Italic" />
          <ToolbarButton icon={Underline} command="underline" title="Underline" />
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <ToolbarButton icon={Heading1} command="formatBlock" arg="H1" title="Heading 1" />
          <ToolbarButton icon={Heading2} command="formatBlock" arg="H2" title="Heading 2" />
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
          <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
          <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
          <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                const url = prompt("Enter URL:");
                if (url) execCommand("createLink", url);
            }}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Link"
          >
            <LinkIcon size={16} />
          </button>
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none prose dark:prose-invert max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: value }} // Initial render
        />
      </div>
    </div>
  );
}
