'use client';
import { useEffect, useState } from 'react';
type RecordItem = {
  id: string;
  filename: string;
  path: string;
  createdAt: string;
  title?: string;
  category?: string;
  tags?: string[];
  entities?: string[];
  summary?: string;
  driveFileId?: string;
};
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [items, setItems] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  async function refresh() {
    const res = await fetch('/api/search?query=' + encodeURIComponent(search));
    const data = await res.json();
    setItems(data.items || []);
  }
  useEffect(() => { refresh(); }, [search]);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('tags', tags);
    setLoading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      setFile(null);
      setTags('');
      await refresh();
      alert('Uploaded!');
    } catch (err:any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid">
      <h1 style={{fontSize:24,fontWeight:700}}>Digital Filing Cabinet</h1>
      <form onSubmit={onSubmit} className="card grid">
        <label>Take a photo or choose an image</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e)=>setFile(e.target.files?.[0] || null)}
        />
        <label>Tags / notes (optional)</label>
        <input
          type="text"
          value={tags}
          onChange={(e)=>setTags(e.target.value)}
          placeholder="e.g., receipt, insurance, 2025-09-24"
        />
        <button disabled={loading || !file} className="card" style={{textAlign:'center'}}>
          {loading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      <div className="card grid">
        <label>Search</label>
        <input
          type="text"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search title, tags, summary…"
        />
      </div>
      <div className="grid">
        {items.map(it => (
          <div key={it.id} className="card">
            <div style={{display:'flex',gap:12}}>
              <img src={it.path.replace(/^\./,'')} alt={it.title || it.filename} width={96} height={96} style={{objectFit:'cover',borderRadius:8}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{it.title || it.filename}</div>
                <div style={{fontSize:12,color:'#6b7280'}}>{new Date(it.createdAt).toLocaleString()}</div>
                {it.category && <div className="badge">{it.category}</div>}
                {it.tags?.map(t => <span key={t} className="badge">{t}</span>)}
                {it.entities?.slice(0,4).map(e => <span key={e} className="badge">{e}</span>)}
                {it.summary && <p style={{marginTop:8}}>{it.summary}</p>}
                <div style={{marginTop:8, fontSize:12}}>
                  <a href={it.path.replace(/^\./,'')} target="_blank" rel="noreferrer">Open file</a>
                  {it.driveFileId && <> · <span>Drive ID: {it.driveFileId}</span></>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length===0 && <div className="card">No documents yet.</div>}
      </div>
    </main>
  );
}