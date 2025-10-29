/* eslint-disable @typescript-eslint/no-explicit-any */
import './App.css';
import { useEffect, useState } from 'react';
import { api } from './lib/api';
type Upstream = { id: string; name: string; baseUrl: string; enabled: boolean; jwt?: any; canaryUrl?:string; canaryWeight?:number; shadowUrl?:string; };
export default function App() {
  const [upstreams, setUpstreams] = useState<Upstream[]>([]);
  const [form, setForm] = useState<any>({ name:'', baseUrl:'', jwtRequired:false });

  const load = async () => setUpstreams(await (await fetch("http://localhost:3000/admin/upstreams")).json());
  useEffect(()=>{ load(); }, []);

  const save = async () => {
    console.log(api('/admin/upstreams'));
    await fetch("http://localhost:3000/admin/upstreams", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      name: form.name, baseUrl: form.baseUrl,
      jwtRequired: !!form.jwtRequired, jwksUri: form.jwksUri, jwtIssuer: form.jwtIssuer, jwtAudience: form.jwtAudience, jwtAlg: form.jwtAlg
    })});
    setForm({ name:'', baseUrl:'', jwtRequired:false }); load();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gateway Admin</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Novo Upstream</h2>
          <input className="border p-2 w-full mb-2" placeholder="Nome" value={form.name||''} onChange={e=>setForm((f:any)=>({...f,name:e.target.value}))}/>
          <input className="border p-2 w-full mb-2" placeholder="Base URL" value={form.baseUrl||''} onChange={e=>setForm((f:any)=>({...f,baseUrl:e.target.value}))}/>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={!!form.jwtRequired} onChange={e=>setForm((f:any)=>({...f,jwtRequired:e.target.checked}))}/> Requer JWT
          </label>
          {form.jwtRequired && <>
            <input className="border p-2 w-full mb-2" placeholder="JWKS URI" value={form.jwksUri||''} onChange={e=>setForm((f:any)=>({...f,jwksUri:e.target.value}))}/>
            <input className="border p-2 w-full mb-2" placeholder="Issuer" value={form.jwtIssuer||''} onChange={e=>setForm((f:any)=>({...f,jwtIssuer:e.target.value}))}/>
            <input className="border p-2 w-full mb-2" placeholder="Audience" value={form.jwtAudience||''} onChange={e=>setForm((f:any)=>({...f,jwtAudience:e.target.value}))}/>
            <input className="border p-2 w-full mb-2" placeholder="Alg (RS256)" value={form.jwtAlg||''} onChange={e=>setForm((f:any)=>({...f,jwtAlg:e.target.value}))}/>
          </>}
          <button className="px-4 py-2 rounded bg-black text-white" onClick={save}>Salvar</button>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-3">Upstreams</h2>
          <ul className="space-y-3">
            {upstreams.map(u=>(
              <li key={u.id} className="border rounded p-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-gray-600">{u.baseUrl}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${u.enabled?'bg-green-100 text-green-800':'bg-gray-100 text-gray-600'}`}>{u.enabled?'ativo':'inativo'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}