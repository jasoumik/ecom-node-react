"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { FullScreenLoader } from "@/components/ui/Loader";

export default function AdminMediaPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Extract base URL from API_URL (remove /api)
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchMedia(currentFolder);
  }, [currentFolder]);

  const fetchMedia = async (folderId: string | null) => {
    setLoading(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        fetch(`${API_URL}/media/folders${folderId ? `?parentId=${folderId}` : ''}`),
        fetch(`${API_URL}/media/files${folderId ? `?folderId=${folderId}` : ''}`)
      ]);
      
      const foldersData = await foldersRes.json();
      const filesData = await filesRes.json();
      
      setFolders(Array.isArray(foldersData) ? foldersData : []);
      setFiles(Array.isArray(filesData) ? filesData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    
    try {
      const res = await fetch(`${API_URL}/media/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent_id: currentFolder }),
      });
      if (res.ok) {
        addToast("Folder created", "success");
        fetchMedia(currentFolder);
      }
    } catch (e) {
      addToast("Error creating folder", "error");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    if (currentFolder) formData.append("folderId", currentFolder);

    try {
      const res = await fetch(`${API_URL}/media/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        addToast("File uploaded", "success");
        fetchMedia(currentFolder);
      } else {
        addToast("Upload failed", "error");
      }
    } catch (e) {
      addToast("Error uploading file", "error");
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await fetch(`${API_URL}/media/files/${id}`, { method: "DELETE" });
      addToast("File deleted", "success");
      fetchMedia(currentFolder);
    } catch (e) {
      addToast("Error deleting file", "error");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder and all contents?")) return;
    try {
      await fetch(`${API_URL}/media/folders/${id}`, { method: "DELETE" });
      addToast("Folder deleted", "success");
      fetchMedia(currentFolder);
    } catch (e) {
      addToast("Error deleting folder", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            {currentFolder && (
                <button onClick={() => setCurrentFolder(null)} className="text-sky-500 hover:underline">
                    ← Root
                </button>
            )}
            <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Media Library</Heading>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" onClick={handleCreateFolder} className="rounded-xl">
                + New Folder
            </Button>
            <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5">
                    Upload File
                </span>
                <input type="file" className="hidden" onChange={handleUpload} />
            </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 p-6 min-h-[400px]">
        {folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="text-4xl mb-2">📁</div>
                <p>This folder is empty</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {folders.map(folder => (
                    <div key={folder.id} className="group relative">
                        <div 
                            onClick={() => setCurrentFolder(folder.id)}
                            className="aspect-square bg-sky-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-sky-200"
                        >
                            <div className="text-4xl mb-2">📂</div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate px-2 w-full text-center">{folder.name}</div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        >
                            ×
                        </button>
                    </div>
                ))}
                
                {files.map(file => (
                    <div key={file.id} className="group relative">
                        <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            {file.type === 'image' ? (
                                <img src={`${BASE_URL}${file.url}`} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    📄
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 truncate">{file.name}</div>
                        <button 
                            onClick={() => handleDeleteFile(file.id)}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
