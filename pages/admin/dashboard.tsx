import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';

const taxonomyGroups = [
  ['CATEGORY', 'Categories'], ['SUBCATEGORY', 'Subcategories'], ['ACTIVITY', 'Business activities'],
  ['ITEM_TYPE', 'Item types'], ['CONDITION', 'Conditions'], ['USER_INTENT', 'User intents'],
  ['SERVICE', 'Services'], ['PRODUCT', 'Products'], ['CAPABILITY', 'Business capabilities'],
  ['LANGUAGE', 'Languages'], ['TAG', 'Tags']
] as const;

type Taxonomy = { id: string; kind: string; name_en: string; name_ar: string; slug: string; is_active: boolean; sort_order: number };
type Suggestion = { id: string; kind: string; name_en: string; name_ar: string | null; status: string; created_at: string };
type ImportPreview = { headers: string[]; rows: Array<Record<string, unknown>>; errors: string[]; staged: boolean; published: boolean };
type Business = { id: string; name_en: string; name_ar: string; slug: string | null; publication_status: string; is_searchable: boolean; verification_status: string; created_at: string; updated_at: string };

const AdminDashboard = () => {
  const [token, setToken] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState('Enter the admin API token to load Beta data.');
  const [activeKind, setActiveKind] = useState('CATEGORY');
  const [newTaxonomy, setNewTaxonomy] = useState({ nameEn: '', nameAr: '', slug: '' });
  const [business, setBusiness] = useState({ nameEn: '', nameAr: '', slug: '', phone: '', descriptionEn: '', descriptionAr: '' });
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const response = await fetch(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [businessData, taxonomyData, suggestionData] = await Promise.all([request('/api/admin/businesses'), request('/api/admin/taxonomies'), request('/api/admin/suggestions')]);
      setBusinesses(businessData);
      setTaxonomies(taxonomyData);
      setSuggestions(suggestionData);
      setStatus(`Loaded ${businessData.length} businesses, ${taxonomyData.length} taxonomy values and ${suggestionData.length} pending suggestions.`);
      localStorage.setItem('masfah_admin_token', token);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not load admin data'); }
  }, [request, token]);

  useEffect(() => { setToken(localStorage.getItem('masfah_admin_token') ?? ''); }, []);

  const addTaxonomy = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await request('/api/admin/taxonomies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: activeKind, ...newTaxonomy }) });
      setNewTaxonomy({ nameEn: '', nameAr: '', slug: '' });
      await loadData();
      setStatus('Taxonomy value added as active data.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not add taxonomy'); }
  };

  const deactivate = async (id: string) => {
    try { await request(`/api/admin/taxonomies?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); await loadData(); setStatus('Taxonomy value deactivated.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not deactivate taxonomy'); }
  };

  const review = async (id: string, action: string) => {
    try { await request('/api/admin/suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) }); await loadData(); setStatus(`Suggestion ${action.toLowerCase()}.`); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not review suggestion'); }
  };

  const createDraft = async (event: FormEvent) => {
    event.preventDefault();
    try { await request('/api/admin/businesses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(business) }); setBusiness({ nameEn: '', nameAr: '', slug: '', phone: '', descriptionEn: '', descriptionAr: '' }); setStatus('Business saved as DRAFT and remains unpublished.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not save business'); }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    try { setImportPreview(await request('/api/admin/import-businesses', { method: 'POST', body: formData })); setStatus('Import staged for review; nothing was published.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not preview import'); }
  };

  const visibleTaxonomies = taxonomies.filter((item) => item.kind === activeKind);

  return <div className="min-h-screen bg-gray-50 flex" dir="ltr">
    <aside className="w-72 bg-black text-white p-6 hidden md:block"><div className="text-xl font-bold mb-10 tracking-tighter">MASFAH ADMIN</div><nav className="space-y-2 text-sm">{['Businesses', 'Taxonomies', 'Locations & Zones', 'Suggestions review', 'Imports'].map((item, index) => <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className={`block py-3 px-4 rounded-lg ${index === 0 ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>{item}</a>)}</nav></aside>
    <main className="flex-1 p-6 md:p-10 max-w-7xl">
      <header className="flex flex-wrap gap-4 justify-between items-center mb-8"><div><p className="text-xs text-gray-400 uppercase tracking-widest">Musaffah + ICAD · Beta</p><h1 className="text-3xl font-black">Manage MASFAH data</h1></div><div className="flex gap-2"><input aria-label="Admin API token" type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Admin API token" className="border rounded-lg px-3 py-2" /><button onClick={loadData} className="bg-black text-white px-4 py-2 rounded-lg font-bold">Load</button></div></header>
      <p className="mb-6 text-sm text-blue-800 bg-blue-50 rounded-lg p-3" role="status">{status}</p>

      <section id="businesses" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"><h2 className="text-xl font-bold mb-2">Businesses and drafts</h2><p className="text-gray-500 text-sm mb-4">AL JALLAF remains unpublished and unverified while the new trade license is pending.</p><div className="space-y-3 mb-6">{businesses.map((item) => <div key={item.id} className="border rounded-xl p-4"><div className="flex flex-wrap justify-between gap-3"><div><b>{item.name_en}</b> · {item.name_ar}<p className="text-xs text-gray-400">{item.id}</p></div><div className="text-sm text-right"><p>{item.publication_status} · {item.verification_status}</p><p>Searchable: {item.is_searchable ? 'YES' : 'NO'}</p></div></div></div>)}{!businesses.length && <p className="text-gray-500">No loaded businesses. Enter the admin token and press Load.</p>}</div><h3 className="font-bold mb-2">Add another business as draft</h3><form onSubmit={createDraft} className="grid md:grid-cols-2 gap-3">{(['nameEn', 'nameAr', 'slug', 'phone', 'descriptionEn', 'descriptionAr'] as const).map((field) => <input key={field} required={['nameEn', 'nameAr'].includes(field)} value={business[field]} onChange={(event) => setBusiness({ ...business, [field]: event.target.value })} placeholder={field} className="border rounded-lg p-3" />)}<button className="bg-blue-600 text-white rounded-lg p-3 font-bold md:col-span-2">Save draft</button></form></section>

      <section id="taxonomies" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"><div className="flex flex-wrap gap-2 mb-4">{taxonomyGroups.map(([kind, label]) => <button key={kind} onClick={() => setActiveKind(kind)} className={`px-3 py-2 rounded-lg text-sm font-bold ${activeKind === kind ? 'bg-black text-white' : 'bg-gray-100'}`}>{label}</button>)}</div><h2 className="text-xl font-bold mb-4">{activeKind} management</h2><form onSubmit={addTaxonomy} className="grid md:grid-cols-4 gap-2 mb-5"><input required value={newTaxonomy.nameEn} onChange={(event) => setNewTaxonomy({ ...newTaxonomy, nameEn: event.target.value })} placeholder="English name" className="border rounded-lg p-3" /><input required value={newTaxonomy.nameAr} onChange={(event) => setNewTaxonomy({ ...newTaxonomy, nameAr: event.target.value })} placeholder="Arabic name" className="border rounded-lg p-3" /><input required value={newTaxonomy.slug} onChange={(event) => setNewTaxonomy({ ...newTaxonomy, slug: event.target.value })} placeholder="slug" className="border rounded-lg p-3" /><button className="bg-black text-white rounded-lg p-3 font-bold">Add option</button></form><div className="divide-y">{visibleTaxonomies.map((item) => <div key={item.id} className="py-3 flex justify-between"><span><b>{item.name_en}</b> · {item.name_ar} <small className="text-gray-400">{item.slug}</small></span><button onClick={() => deactivate(item.id)} className="text-red-600 text-sm">Deactivate</button></div>)}{!visibleTaxonomies.length && <p className="text-gray-500">No loaded values for this type.</p>}</div></section>

      <section id="suggestions-review" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"><h2 className="text-xl font-bold mb-2">Suggestions review</h2><p className="text-gray-500 text-sm mb-4">Approve, edit later, merge, or reject. Nothing is published automatically.</p>{suggestions.map((item) => <div key={item.id} className="border rounded-lg p-4 mb-3 flex flex-wrap justify-between gap-3"><div><b>{item.name_en}</b>{item.name_ar && ` · ${item.name_ar}`}<p className="text-xs text-gray-400">{item.kind} · {item.id}</p></div><div className="flex gap-2"><button onClick={() => review(item.id, 'APPROVE')} className="border px-3 py-2 rounded">Approve</button><button onClick={() => review(item.id, 'REJECT')} className="border px-3 py-2 rounded">Reject</button></div></div>)}{!suggestions.length && <p className="text-gray-500">No pending suggestions.</p>}</section>

      <section id="imports" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"><h2 className="text-xl font-bold mb-2">CSV / Excel import</h2><p className="text-gray-500 text-sm mb-4">Upload for validation and preview only. Publishing is disabled.</p><input type="file" accept=".csv,.xlsx,.xls" onChange={importFile} />{importPreview && <div className="mt-4 text-sm"><p>Headers: {importPreview.headers.join(', ') || 'none'}</p><p className={importPreview.errors.length ? 'text-red-700' : 'text-green-700'}>{importPreview.errors.length ? importPreview.errors.join(' · ') : `Previewed ${importPreview.rows.length} rows; staged=${importPreview.staged}; published=${importPreview.published}`}</p></div>}</section>
    </main>
  </div>;
};

export default AdminDashboard;
