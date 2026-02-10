"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    label: string;
    placeholder: string;
    className?: string;
}

export function SearchableSelect({ 
    options, 
    value, 
    onChange, 
    label, 
    placeholder,
    className
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert if invalid
                if (!options.includes(query) && value) {
                    setQuery(value);
                } else if (!options.includes(query) && !value) {
                    setQuery("");
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, query, value, options]);

    const filteredOptions = options.filter(opt => 
        opt.toLowerCase().includes(query.toLowerCase())
    );

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQuery("");
        onChange("");
        setIsOpen(true);
    };

    return (
        <div className={`w-full relative group ${className}`} ref={wrapperRef}>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm pr-10"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        if (value && e.target.value !== value) onChange("");
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button 
                            type="button" 
                            onClick={handleClear}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <div className="pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>
            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600"
                            onClick={() => {
                                onChange(opt);
                                setQuery(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}