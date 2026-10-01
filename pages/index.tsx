import React, { useState } from 'react';
import Head from 'next/head';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSummary, setSearchSummary] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ id: string; name: string; category?: string; location?: string; matchScore: number; matchedOn: string[] }>>([]);
  const [relatedSuggestions, setRelatedSuggestions] = useState<Array<{ label: string; query: string }>>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const runSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchSummary(null);
    setSearchError(null);
    setResults([]);
    setRelatedSuggestions([]);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Search failed');
      const intent = data.intent;
      setSearchSummary(intent ? `Understood: ${[intent.item_type, intent.item_condition, intent.user_intent, ...(intent.required_capabilities || []), intent.zone].filter(Boolean).join(' · ')}` : null);
      setResults(data.results || []);
      setRelatedSuggestions(data.relatedSuggestions || []);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const examples = [
    { ar: "من يشتري القوارب المكسورة ويستلمها؟", en: "Who buys broken boats and collects them?" },
    { ar: "عندي ستاير قديمة وأبا حد يشتريها", en: "I have old curtains and want someone to buy them" },
    { ar: "أبا حد يشتري معدات مطاعم مستعملة في ICAD ويستلمها", en: "Who buys used restaurant equipment in ICAD and can collect it?" },
    { ar: "عندي دراجات أطفال قديمة في البيت وأبا حد يشيلها", en: "Someone to remove old kids bicycles from my home" }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans" dir="auto">
      <Head>
        <title>MASFAH | مصفح - Everything in Musaffah</title>
        <meta name="description" content="AI-powered search for Musaffah factories, workshops, and shops." />
      </Head>

      {/* Header / Nav */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter">MASFAH</div>
        <div className="space-x-4 flex items-center">
          <button className="text-sm font-medium hover:underline">العربية</button>
          <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">
            Claim Business
          </button>
        </div>
      </header>

      {/* Main Search Section */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-40 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Everything in Musaffah. One Search.
        </h1>
        <p className="text-gray-500 text-lg mb-12">
          مصفح — كل اللي تدور عليه، ببحث واحد.
        </p>

        {/* Central Search Box */}
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-16 pr-32 py-6 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-3xl text-xl transition-all outline-none shadow-sm hover:shadow-md"
            placeholder="شو تدور عليه في مصفح؟ / What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={runSearch} disabled={isSearching} className="absolute right-3 top-3 bottom-3 bg-black text-white px-8 rounded-2xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSearching ? 'Understanding…' : 'Search'}
          </button>
        </div>
        {searchSummary && <p className="mt-5 text-sm text-blue-700 bg-blue-50 rounded-xl px-4 py-3">{searchSummary}</p>}
        {searchError && <p className="mt-5 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{searchError}</p>}
        {results.length > 0 && <div className="mt-8 text-left space-y-3">{results.map((result) => <article key={result.id} className="border rounded-2xl p-5 bg-white shadow-sm"><div className="flex justify-between gap-4"><div><h2 className="font-bold text-lg">{result.name}</h2><p className="text-sm text-gray-500">{[result.category, result.location].filter(Boolean).join(' · ')}</p></div><span className="text-sm font-bold text-blue-700">{result.matchScore} match</span></div><p className="text-xs text-gray-400 mt-2">Matched on: {result.matchedOn.join(', ') || 'published listing'}</p></article>)}</div>}
        {relatedSuggestions.length > 0 && <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left"><p className="font-bold text-blue-900">ما حصلنا خدمة مطابقة بالضبط. جرّب خدمات بحرية قريبة:</p><div className="mt-3 flex flex-wrap gap-2">{relatedSuggestions.map((suggestion) => <button key={suggestion.query} onClick={() => setSearchQuery(suggestion.query)} className="rounded-full bg-white px-4 py-2 text-sm text-blue-800 shadow-sm">{suggestion.label}</button>)}</div></div>}

        {/* Examples Section */}
        <div className="mt-12">
          <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-widest">Example Searches</p>
          <div className="flex flex-wrap justify-center gap-3">
            {examples.map((ex, i) => (
              <button 
                key={i}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                onClick={() => setSearchQuery(ex.ar)}
              >
                {ex.ar}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer (Simplified) */}
      <footer className="border-t border-gray-100 p-8 text-center text-gray-400 text-sm">
        &copy; 2026 MASFAH. The Musaffah Search Engine.
      </footer>
    </div>
  );
};

export default HomePage;
