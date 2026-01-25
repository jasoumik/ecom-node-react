"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { useToast } from "@/components/ui/Toast";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_URL}/countries`);
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
      setFilteredCountries(Array.isArray(data) ? data : []);
    } catch (e) {
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
      if (!query) {
          setFilteredCountries(countries);
          return;
      }
      const lower = query.toLowerCase();
      setFilteredCountries(countries.filter(c => 
          c.name.toLowerCase().includes(lower) || 
          c.code.toLowerCase().includes(lower)
      ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/countries/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Country deleted", "success");
        fetchCountries();
      } else {
        addToast("Failed to delete country", "error");
      }
    } catch (e) {
      addToast("Error deleting country", "error");
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="lg" className="font-sans text-slate-800 dark:text-white mb-1">Countries</Heading>
            <p className="text-sm text-slate-500">Manage countries of origin</p>
        </div>
        <Button onClick={() => router.push("/admin/countries/create")} className="rounded-xl shadow-lg shadow-sky-500/20">
            + Add Country
        </Button>
      </div>

      <FilterBar onSearch={handleSearch} placeholder="Search countries..." />

      <Table
        data={filteredCountries}
        columns={[
          {
            header: "Flag",
            cell: (country) => (
              <div className="w-12 h-8 rounded overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                {country.flag ? (
                    <img src={country.flag} alt={country.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        {country.code}
                    </div>
                )}
              </div>
            )
          },
          {
            header: "Name",
            accessorKey: "name",
            className: "font-bold text-slate-900 dark:text-white"
          },
          {
            header: "Code",
            accessorKey: "code",
            className: "text-slate-600 dark:text-slate-300 text-sm font-mono"
          },
          {
            header: "Status",
            cell: (country) => (
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                    country.is_active 
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                    {country.is_active ? 'Active' : 'Inactive'}
                </span>
            )
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (country) => (
              <div className="flex justify-end gap-2">
                  <button 
                  onClick={() => router.push(`/admin/countries/${country.id}/edit`)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  title="Edit"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button 
                  onClick={() => handleDelete(country.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
