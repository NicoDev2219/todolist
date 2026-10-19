import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import { Search, Plus, Pencil, Trash2, X, CalendarDays, Check, ListTodo, Sparkles } from 'lucide-react';
import './style.css';

// Normalize common typo in local .env (e.g. /api/n) and remove trailing slash.
const API = (import.meta.env.VITE_API_URL || 'http://localhost:3333/api')
  .trim()
  .replace(/\/api\/n\/?$/i, '/api')
  .replace(/\/$/, '');
const today = () => new Date().toISOString().slice(0, 10);
function dueOf(task) { return task.dueDate ?? task.due_date ?? null; }
function normalize(task) { return { ...task, completed: Boolean(task.completed), dueDate: dueOf(task) ? String(dueOf(task)).slice(0, 10) : '' }; }

function DinoScene() {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer, frame, observer;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111014, 0.035);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 3.3, 11.8);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc9c1ff, 0x21182c, 2.0));
    const key = new THREE.DirectionalLight(0xffe5be, 3.2); key.position.set(-3, 7, 5); scene.add(key);
    const rim = new THREE.PointLight(0x9a6cff, 25, 18); rim.position.set(3, 3, -1); scene.add(rim);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x211a2c, roughness: 0.8, metalness: 0.1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.45; scene.add(floor);
    const grid = new THREE.GridHelper(60, 60, 0x8f63ed, 0x3c2c56); grid.position.y = -1.43; grid.material.transparent = true; grid.material.opacity = 0.24; scene.add(grid);

    // Build a stylized low-poly T-rex entirely from 3D meshes.
    const dino = new THREE.Group(); scene.add(dino); dino.position.set(0.7, -0.25, 0); dino.scale.setScalar(1.2);
    const skin = new THREE.MeshStandardMaterial({ color: 0x8eeb9c, roughness: 0.42, metalness: 0.08 });
    const lightSkin = new THREE.MeshStandardMaterial({ color: 0xc4f7a2, roughness: 0.48 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x243b36, roughness: 0.35 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffd36e, emissive: 0xff8a2a, emissiveIntensity: 2.2 });
    const addMesh = (parent, geo, mat, pos, scale, rot) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if(scale)m.scale.set(...scale); if(rot)m.rotation.set(...rot); parent.add(m); return m; };
    const sphere = (parent, mat, pos, scale) => addMesh(parent, new THREE.SphereGeometry(1, 16, 12), mat, pos, scale);
    sphere(dino, skin, [0,0,0], [1.12,0.8,0.62]);
    sphere(dino, lightSkin, [0.1,-0.37,0.12], [0.77,0.32,0.5]);
    sphere(dino, skin, [0.48,0.55,0], [0.66,0.68,0.55]);
    sphere(dino, skin, [0.92,0.83,0.03], [0.76,0.36,0.43]);
    sphere(dino, dark, [1.27,0.61,0.04], [0.54,0.12,0.39]);
    sphere(dino, lightSkin, [1.25,0.49,0.04], [0.5,0.09,0.35]);
    sphere(dino, eyeMat, [0.83,0.91,0.39], [0.105,0.105,0.055]);
    sphere(dino, dark, [0.86,0.91,0.435], [0.035,0.075,0.02]);
    // Tiny arms and claws
    for (const z of [-0.38,0.38]) {
      const arm = sphere(dino, skin, [0.55,0.17,z], [0.18,0.34,0.16]); arm.rotation.z = -0.5;
      sphere(dino, dark, [0.68,-0.02,z], [0.12,0.08,0.12]);
      for(let i=0;i<3;i++) addMesh(dino,new THREE.ConeGeometry(0.035,0.12,6),dark,[0.73+i*0.045,-0.05,z+(i-1)*0.07],[1,1,1],[0,0,-1.3]);
    }
    // Back spikes
    for(let i=0;i<7;i++) addMesh(dino,new THREE.ConeGeometry(0.13,0.25,5),lightSkin,[-0.72+i*0.22,0.63+Math.sin(i/6*Math.PI)*0.12,0],[1,1,1],[0,0,-0.15]);
    const tail = new THREE.Group(); tail.position.set(-0.85,0.06,0); dino.add(tail);
    sphere(tail,skin,[-0.45,-0.03,0],[0.68,0.32,0.32]); sphere(tail,skin,[-0.95,-0.1,0],[0.48,0.2,0.2]);
    const legs=[];
    for(const z of [-0.31,0.31]) {
      const leg = new THREE.Group(); leg.position.set(-0.23,-0.43,z); dino.add(leg);
      sphere(leg,skin,[0,-0.35,0],[0.28,0.48,0.25]); sphere(leg,lightSkin,[0.18,-0.67,0.04],[0.38,0.13,0.29]);
      for(let j=0;j<3;j++) addMesh(leg,new THREE.ConeGeometry(0.045,0.12,5),dark,[0.42,-0.69,(j-1)*0.13],[1,1,1],[0,0,-Math.PI/2]);
      legs.push(leg);
    }
    // Glowing portal rings in the background
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55,0.035,12,100), new THREE.MeshBasicMaterial({color:0x9d6cff,transparent:true,opacity:0.85})); ring.position.set(-2.6,0.3,-2.3); scene.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.8,0.012,8,100), new THREE.MeshBasicMaterial({color:0x70f0c1,transparent:true,opacity:0.5})); ring2.position.copy(ring.position); scene.add(ring2);
    const stars = new THREE.Group(); scene.add(stars);
    for(let i=0;i<85;i++){ const dot = new THREE.Mesh(new THREE.SphereGeometry(Math.random()*0.022+0.008,6,6),new THREE.MeshBasicMaterial({color:i%3===0?0x8ef4ce:0xc7a8ff,transparent:true,opacity:Math.random()*0.65+0.2})); dot.position.set((Math.random()-0.5)*15,Math.random()*5-0.2,-2-Math.random()*8); stars.add(dot); }
    const clock = new THREE.Clock();
    const resize = () => { if(!host.clientWidth||!host.clientHeight)return; camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth,host.clientHeight); };
    observer = new ResizeObserver(resize); observer.observe(host);
    const animate = () => { frame=requestAnimationFrame(animate); const t=clock.getElapsedTime();
      dino.position.y=-0.25+Math.abs(Math.sin(t*9))*0.16; dino.position.x=0.7+Math.sin(t*0.7)*0.12;
      legs[0].rotation.z=Math.sin(t*9)*0.62; legs[1].rotation.z=Math.sin(t*9+Math.PI)*0.62;
      tail.rotation.z=Math.sin(t*4)*0.18; dino.rotation.y=Math.sin(t*1.2)*0.07;
      ring.rotation.z=t*0.12; ring2.rotation.z=-t*0.09; stars.rotation.y=Math.sin(t*0.08)*0.06;
      renderer.render(scene,camera);
    }; animate();
    return () => { cancelAnimationFrame(frame); if(observer)observer.disconnect(); renderer.dispose(); if(renderer.domElement.parentNode===host)host.removeChild(renderer.domElement); scene.traverse(o=>{if(o.geometry)o.geometry.dispose(); if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}}); };
  }, []);
  return <div className="dino-stage" ref={hostRef} aria-label="Dinossauro 3D correndo em um cenário futurista"><div className="dino-vignette"/><div className="dino-label"><span className="live-dot"/> DINO MODE <b>03D</b></div><div className="dino-caption">RUN. <em>FOCUS.</em> REPEAT.</div><div className="dino-coordinates">JURASSIC / TASK ENGINE <span>● ONLINE</span></div></div>;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { const timer = setTimeout(() => setDebounced(search), 350); return () => clearTimeout(timer); }, [search]);
  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    if (!response.ok) {
      let message = `Erro ${response.status}`;
      try { const body = await response.json(); message = body.message || message; } catch {}
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }
  async function load() {
    try {
      setError('');
      const data = await request(`/tasks?search=${encodeURIComponent(debounced)}`);
      setTasks((data.tasks || []).map(normalize));
      setTotal(Number(data.total) || 0);
      setCompleted(Number(data.completed) || 0);
    } catch (e) { setError(`Não foi possível conectar à API. Confira se o backend e o MySQL estão rodando. (${e.message})`); }
  }
  useEffect(() => { load(); }, [debounced]);
  const sorted = useMemo(() => [...tasks].sort((a,b) => {
    if (!a.dueDate && !b.dueDate) return Number(a.completed) - Number(b.completed);
    if (!a.dueDate) return 1; if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  }), [tasks]);
  const pending = sorted.filter(t => !t.completed);
  const done = sorted.filter(t => t.completed);
  function openModal(task = null) { setModal(task || 'new'); setTitle(task?.title || ''); setDueDate(task?.dueDate || ''); setError(''); }
  async function save(e) {
    e.preventDefault(); if (!title.trim()) return;
    setBusy(true); setError('');
    try {
      const body = { title: title.trim(), dueDate: dueDate || null };
      if (modal !== 'new') await request(`/tasks/${modal.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await request('/tasks', { method: 'POST', body: JSON.stringify(body) });
      setModal(false); await load();
    } catch (e) { setError(e.message || 'Não foi possível salvar a tarefa.'); }
    finally { setBusy(false); }
  }
  async function toggle(task) {
    try { await request(`/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) }); await load(); }
    catch(e) { setError(e.message); }
  }
  async function remove(task) {
    if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try { await request(`/tasks/${task.id}`, { method: 'DELETE' }); await load(); }
    catch(e) { setError(e.message); }
  }
  function TaskRow({ task }) {
    const overdue = !task.completed && task.dueDate && task.dueDate < today();
    return <article className={`task-row ${task.completed ? 'is-done' : ''}`}>
      <button className={`check ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'} onClick={() => toggle(task)}>{task.completed && <Check size={15}/>}</button>
      <div className="task-content"><div className={`task-title ${overdue ? 'overdue' : ''}`}>{task.title}</div>
      {task.dueDate && <div className="task-date"><CalendarDays size={13}/>{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}{overdue && <span className="late-pill">Em atraso</span>}</div>}</div>
      <div className="row-actions"><button aria-label="Editar tarefa" title="Editar" onClick={() => openModal(task)}><Pencil size={16}/></button><button aria-label="Excluir tarefa" title="Excluir" onClick={() => remove(task)}><Trash2 size={16}/></button></div>
    </article>;
  }
  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span>to</span><i>*</i><span>do</span><b>.</b></a><div className="top-right"><span className="status-dot"></span> Seu espaço de foco</div></header>
    <section className="hero"><DinoScene/><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> UM PASSO DE CADA VEZ</div><h1>Faça acontecer<span>.</span></h1><p>Organize suas ideias. Conquiste o seu dia.</p></div></section>
    <section className="workspace">
      <div className="section-heading"><div><h2>Minhas tarefas</h2><p>Um pouco de progresso todo dia.</p></div><button className="primary-button" onClick={() => openModal()}><Plus size={17}/> Nova tarefa</button></div>
      <div className="stats"><div className="stat-card"><span className="stat-icon"><ListTodo size={18}/></span><div><small>TOTAL DE TAREFAS</small><strong>{total}</strong></div></div><div className="stat-card"><span className="stat-icon green"><Check size={18}/></span><div><small>CONCLUÍDAS</small><strong>{completed}</strong></div><div className="progress-track"><span style={{width: `${total ? Math.min(100, completed / total * 100) : 0}%`}}/></div></div></div>
      <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarefas..." aria-label="Buscar tarefas"/>{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={16}/></button>}<kbd>⌘ K</kbd></div>
      {error && <div className="error-banner">{error}</div>}
      <div className="list-heading"><span>EM ANDAMENTO</span><span>{pending.length} {pending.length === 1 ? 'tarefa' : 'tarefas'}</span></div>
      {pending.length ? <div className="task-list">{pending.map(t => <TaskRow key={t.id} task={t}/>)}</div> : <div className="empty-state"><div className="empty-icon"><Check size={24}/></div><h3>You have no pending tasks.</h3><p>{debounced ? 'Tente outra busca ou adicione uma nova tarefa.' : 'Tudo em dia por aqui. Que tal planejar o próximo passo?'}</p><button onClick={() => openModal()}><Plus size={16}/> Criar tarefa</button></div>}
      {done.length > 0 && <><div className="list-heading completed-heading"><span>CONCLUÍDAS</span><span>{done.length}</span></div><div className="task-list">{done.map(t => <TaskRow key={t.id} task={t}/>)}</div></>}
    </section>
    <button className="floating-add" aria-label="Criar tarefa" onClick={() => openModal()}><Plus size={26}/></button>
    {modal !== false && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><form className="modal" onSubmit={save}><div className="modal-head"><div><span className="modal-kicker">{modal !== 'new' ? 'AJUSTE SUA LISTA' : 'TIRE DA CABEÇA, COLOQUE NO PAPEL'}</span><h2>{modal !== 'new' ? 'Edit Task' : 'Create Task'}</h2></div><button type="button" className="close-button" onClick={() => setModal(false)} aria-label="Fechar"><X size={20}/></button></div><label htmlFor="task-title">Nome da tarefa</label><input id="task-title" autoFocus maxLength={180} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Estudar React..." required/><label htmlFor="task-date">Data limite <span>(opcional)</span></label><input id="task-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancelar</button><button className="primary-button" disabled={busy}>{busy ? 'Salvando...' : modal !== 'new' ? 'Salvar alterações' : 'Criar tarefa'}</button></div></form></div>}
    <footer>Feito para focar no que importa <span>✳</span></footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
