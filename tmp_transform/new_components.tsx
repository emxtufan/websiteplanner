// ─── BLOCK TOOLBAR & INSERT ───────────────────────────────────────────────────
const BLOCK_TYPE_ICONS: Record<string, string> = {
  photo: "🖼", text: "✏️", location: "📍", calendar: "📅", countdown: "⏱",
  timeline: "🕒", music: "🎵", gift: "🎁", whatsapp: "💬", rsvp: "✉️",
  divider: "—", family: "👨‍👩‍👧", date: "📆", description: "📝",
};

const BlockToolbar = ({ onUp, onDown, onToggle, onDelete, visible, isFirst, isLast }: any) => (
  <div className="absolute -top-4 right-2 flex items-center gap-1 rounded-full border bg-white shadow-lg px-2 py-1 opacity-0 group-hover/block:opacity-100 transition-all z-[9999999999999999999999] pointer-events-none group-hover/block:pointer-events-auto">
    <button onClick={onUp} disabled={isFirst} className="p-1 rounded-full hover:bg-purple-50 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-purple-600"/></button>
    <button onClick={onDown} disabled={isLast} className="p-1 rounded-full hover:bg-purple-50 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-purple-600"/></button>
    <div className="w-px h-3 bg-purple-100 mx-1" />
    <button onClick={onToggle} className="p-1 rounded-full hover:bg-purple-50">
      {visible ? <Eye className="w-3 h-3 text-purple-600"/> : <EyeOff className="w-3 h-3 text-gray-400"/>}
    </button>
    <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-500"/></button>
  </div>
);

const InsertBlockButton: React.FC<{
  insertIdx: number;
  openInsertAt: number | null;
  setOpenInsertAt: (v: number | null) => void;
  BLOCK_TYPES: { type: string; label: string; def: any }[];
  onInsert: (type: string, def: any) => void;
}> = ({ insertIdx, openInsertAt, setOpenInsertAt, BLOCK_TYPES, onInsert }) => {
  const isOpen = openInsertAt === insertIdx;
  const [hovered, setHovered] = React.useState(false);
  const visible = hovered || isOpen;
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", height:32, zIndex:20 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ position:"absolute", left:0, right:0, height:1,
        background:`repeating-linear-gradient(to right,${C.gold} 0,${C.gold} 6px,transparent 6px,transparent 12px)`,
        opacity:.4, zIndex:1 }}/>
      <button type="button" onClick={() => setOpenInsertAt(isOpen ? null : insertIdx)}
        style={{ width:26, height:26, borderRadius:"50%",
          background: isOpen ? C.purple : "white",
          border:`1.5px solid ${C.gold}`, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, color: isOpen ? "white" : C.purple,
          boxShadow:"0 2px 10px rgba(0,0,0,0.12)",
          transition:"opacity 0.15s,transform 0.15s,background 0.15s",
          transform: visible ? "scale(1)" : "scale(0.7)", zIndex:2,
          position:"relative", lineHeight:1, fontWeight:700,
        }}>{isOpen ? "x" : "+"}</button>
      {isOpen && (
        <div style={{ position:"absolute", bottom:34, left:"50%", transform:"translateX(-50%)",
          background:"white", borderRadius:16, border:`1px solid ${C.lavender}`,
          boxShadow:"0 16px 48px rgba(58,0,111,0.18),0 4px 16px rgba(0,0,0,0.06)",
          padding:"16px", zIndex:100, width:260 }}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <p style={{ fontFamily:F.label, fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.3em",
            textTransform:"uppercase", color:C.purple, margin:"0 0 10px", textAlign:"center" }}>
            Adauga bloc
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button" onClick={() => onInsert(bt.type, bt.def)}
                style={{ background:C.offWhite, border:`1px solid ${C.lavender}`, borderRadius:10,
                  padding:"8px 4px", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background=C.lavLight; (e.currentTarget as HTMLButtonElement).style.borderColor=C.purple; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background=C.offWhite; (e.currentTarget as HTMLButtonElement).style.borderColor=C.lavender; }}>
                <span style={{ fontSize:18, lineHeight:1 }}>{BLOCK_TYPE_ICONS[bt.type] || "+"}</span>
                <span style={{ fontFamily:F.label, fontSize:"0.5rem", fontWeight:700, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:C.purple, lineHeight:1.2, textAlign:"center" }}>
                  {bt.label.replace(/^[^\s]+\s/, "")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TimelineInsertButton: React.FC<{ editMode: boolean; onAdd: () => void }> = ({ editMode, onAdd }) => {
  if (!editMode) return null;
  return (
    <div style={{ textAlign:"center", marginTop:10 }}>
      <button type="button" onClick={onAdd} style={{
        background:"transparent", border:`1px dashed ${C.lavender}`, borderRadius:999,
        padding:"4px 14px", fontFamily:F.label, fontSize:9, letterSpacing:"0.25em",
        textTransform:"uppercase", color:C.lavender, cursor:"pointer",
      }}>+ Adauga eveniment</button>
    </div>
  );
};

// ─── PHOTO BLOCK ──────────────────────────────────────────────────────────────
const PhotoBlock: React.FC<{
  imageData?: string; altText?: string; editMode: boolean;
  onUpload: (url: string) => void; onAltChange: (v: string) => void; onRemove: () => void;
  aspectRatio?: "1:1"|"4:3"|"3:4"|"16:9"|"free";
}> = ({ imageData, altText, editMode, onUpload, onAltChange, onRemove, aspectRatio = "free" }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const pt: Record<string,string> = { "1:1":"100%","4:3":"75%","3:4":"133%","16:9":"56.25%",free:"66.6%" };
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    deleteUploadedFile(imageData);
    try {
      const form = new FormData(); form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, { method:"POST", headers:{ Authorization:`Bearer ${_s?.token||""}` }, body:form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json(); onUpload(url);
    } catch(e) { console.error(e); } finally { setUploading(false); }
  };
  return (
    <div>
      <div style={{ position:"relative", borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.lavender}`, boxShadow:"0 6px 18px rgba(0,0,0,.35)" }}>
        <div style={{ position:"relative", paddingTop:pt[aspectRatio], overflow:"hidden" }}>
          {imageData ? (
            <img src={imageData} alt={altText||""} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          ) : (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
              background:`linear-gradient(135deg,${C.purpleMid},${C.purple})`, color:C.lavender,
              cursor:editMode ? "pointer" : "default" }}
              onClick={editMode ? () => fileRef.current?.click() : undefined}>
              {uploading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                <div style={{ textAlign:"center" }}>
                  <Upload className="w-8 h-8" style={{ margin:"0 auto 6px", opacity:.85 }}/>
                  <span style={{ fontFamily:F.label, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase" }}>Adauga imagine</span>
                </div>
              )}
            </div>
          )}
          {editMode && imageData && (
            <div className="absolute inset-0 bg-black/35 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="p-2 bg-white rounded-full text-purple-600"><Camera className="w-5 h-5"/></button>
              <button type="button" onClick={() => { deleteUploadedFile(imageData); onRemove(); }} className="p-2 bg-white rounded-full text-red-600"><Trash2 className="w-5 h-5"/></button>
            </div>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f); }} style={{ display:"none" }}/>
      {editMode && (
        <div style={{ marginTop:8 }}>
          <InlineEdit tag="p" editMode={editMode} value={altText||""} onChange={v => onAltChange(v)} placeholder="Text alternativ..."
            textLabel="Foto · alt" style={{ fontFamily:F.body, fontSize:11, color:C.lavender, margin:0, textAlign:"center" }}/>
        </div>
      )}
    </div>
  );
};

// ─── MUSIC BLOCK ──────────────────────────────────────────────────────────────
const MusicBlock: React.FC<{
  block: InvitationBlock; editMode: boolean;
  onUpdate: (p: Partial<InvitationBlock>) => void;
  imperativeRef?: React.MutableRefObject<{ unlock:()=>void; play:()=>void; pause:()=>void }|null>;
}> = ({ block, editMode, onUpdate, imperativeRef }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Ref = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onPlay2 = () => setPlaying(true);
    const onPause2 = () => setPlaying(false);
    a.addEventListener("timeupdate",onTime); a.addEventListener("loadedmetadata",onDur);
    a.addEventListener("ended",onEnd); a.addEventListener("play",onPlay2); a.addEventListener("pause",onPause2);
    return () => {
      a.removeEventListener("timeupdate",onTime); a.removeEventListener("loadedmetadata",onDur);
      a.removeEventListener("ended",onEnd); a.removeEventListener("play",onPlay2); a.removeEventListener("pause",onPause2);
    };
  }, [block.musicUrl, block.musicType]);
  useEffect(() => {
    if (!imperativeRef) return;
    imperativeRef.current = {
      unlock: () => { if (block.musicType==="mp3" && audioRef.current && block.musicUrl) { audioRef.current.play().then(()=>{audioRef.current!.pause();audioRef.current!.currentTime=0;}).catch(()=>{}); } },
      play: () => { if (audioRef.current && block.musicUrl) audioRef.current.play().catch(()=>{}); },
      pause: () => { if (audioRef.current) audioRef.current.pause(); },
    };
  }, [imperativeRef, block.musicType, block.musicUrl]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const pct = duration ? `${(progress/duration)*100}%` : "0%";
  const toggle = () => { const a=audioRef.current; if(!a) return; if(playing){a.pause();}else{a.play().then(()=>setPlaying(true)).catch(()=>{}); } };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { if(!audioRef.current||!duration) return; const r=e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*duration; };
  const handleMp3 = async (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setUploading(true); deleteUploadedFile(block.musicUrl);
    try {
      const form = new FormData(); form.append("file", file);
      const _s = JSON.parse(localStorage.getItem("weddingPro_session") || "{}");
      const res = await fetch(`${API_URL}/upload`, { method:"POST", headers:{ Authorization:`Bearer ${_s?.token||""}` }, body:form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json(); onUpdate({ musicUrl:url, musicType:"mp3" });
    } catch(e) { console.error(e); } finally { setUploading(false); }
  };
  const isActive = !!block.musicUrl;
  return (
    <div style={{ background:"white", border:`1.5px solid ${playing ? C.purple : C.lavender}`, borderRadius:16, padding:"20px 24px",
      transition:"border-color 0.4s,box-shadow 0.4s", boxShadow:playing ? `0 0 0 3px ${hexToRgba(C.purple,0.15)}` : "none" }}>
      <style>{`@keyframes ua-music-bar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>
      {block.musicType==="mp3" && block.musicUrl && <audio ref={audioRef} src={block.musicUrl} preload="metadata"/>}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <div style={{ width:32, height:32, borderRadius:"50%", background:playing ? C.purple : C.offWhite,
          border:`1.5px solid ${playing ? C.purple : C.lavender}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s" }}>
          <Music className="w-4 h-4" style={{ color:playing ? "white" : C.purple }}/>
        </div>
        <span style={{ fontFamily:F.label, fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase",
          color:playing ? C.purple : C.purpleMid, transition:"color 0.3s" }}>
          {playing ? "Se redă acum" : "Melodia zilei"}
        </span>
        {playing && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:14, marginLeft:"auto" }}>
            {[0,0.2,0.1,0.3].map((delay,i) => (
              <div key={i} style={{ width:3, height:14, background:C.purple, borderRadius:2, transformOrigin:"bottom",
                animation:`ua-music-bar 0.7s ease-in-out ${delay}s infinite` }}/>
            ))}
          </div>
        )}
      </div>
      {!isActive && editMode && (
        <div>
          <button type="button" onClick={() => mp3Ref.current?.click()} disabled={uploading}
            style={{ width:"100%", background:C.offWhite, border:`1px dashed ${C.lavender}`, borderRadius:10, padding:"14px 0",
              cursor:uploading ? "not-allowed" : "pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:uploading ? 0.7 : 1 }}>
            {uploading ? <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"/> : <Upload className="w-5 h-5" style={{ color:C.purple, opacity:.7 }}/>}
            <span style={{ fontFamily:F.label, fontSize:9, color:C.purpleMid, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>MP3</span>
          </button>
          <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f=e.target.files?.[0]; if(f) handleMp3(f); }} style={{ display:"none" }}/>
        </div>
      )}
      {!isActive && !editMode && (
        <div style={{ textAlign:"center", padding:"16px 0", opacity:.4 }}>
          <Music className="w-8 h-8" style={{ color:C.purple, display:"block", margin:"0 auto 6px" }}/>
          <p style={{ fontFamily:F.body, fontSize:12, fontStyle:"italic", color:C.purpleMid, margin:0 }}>Melodia va apărea aici</p>
        </div>
      )}
      {isActive && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:52, height:52, borderRadius:10, background:`linear-gradient(135deg,${C.offWhite},${C.lavLight})`,
              flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:`1.5px solid ${C.lavender}` }}>
              <Music className="w-5 h-5" style={{ color:C.purple, opacity:.7 }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <InlineEdit tag="p" editMode={editMode} value={block.musicTitle||""} onChange={v => onUpdate({musicTitle:v})}
                placeholder="Titlul melodiei..." textLabel="Muzica · titlu"
                style={{ fontFamily:F.display, fontSize:14, fontStyle:"italic", color:C.purple, margin:0, lineHeight:1.3 }}/>
              <InlineEdit tag="p" editMode={editMode} value={block.musicArtist||""} onChange={v => onUpdate({musicArtist:v})}
                placeholder="Artist..." textLabel="Muzica · artist"
                style={{ fontFamily:F.body, fontSize:10, color:C.purpleMid, margin:"2px 0 0" }}/>
            </div>
          </div>
          <div onClick={seek} style={{ height:4, background:C.lavender, borderRadius:99, marginBottom:6, cursor:"pointer", position:"relative" }}>
            <div style={{ height:"100%", borderRadius:99, background:C.purple, width:pct, transition:"width 0.3s linear" }}/>
            <div style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", left:pct, marginLeft:-5,
              width:10, height:10, borderRadius:"50%", background:C.purple, transition:"left 0.3s linear" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <span style={{ fontFamily:F.body, fontSize:9, color:C.purpleMid }}>{fmt(progress)}</span>
            <span style={{ fontFamily:F.body, fontSize:9, color:C.purpleMid }}>{duration ? fmt(duration) : "--:--"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20 }}>
            <button type="button" onClick={() => { const a=audioRef.current; if(a) a.currentTime=Math.max(0,a.currentTime-10); }}
              style={{ background:"none", border:"none", cursor:"pointer", padding:4, opacity:.5 }}>
              <SkipBack className="w-4 h-4" style={{ color:C.purple }}/>
            </button>
            <button type="button" onClick={toggle}
              style={{ width:44, height:44, borderRadius:"50%", background:C.purple, border:"none", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 4px 16px ${hexToRgba(C.purple,0.35)}` }}>
              {playing ? <Pause className="w-4 h-4" style={{ color:"white" }}/> : <Play className="w-4 h-4" style={{ color:"white", marginLeft:2 }}/>}
            </button>
            <button type="button" onClick={() => { const a=audioRef.current; if(a) a.currentTime=Math.min((duration||a.currentTime+10),a.currentTime+10); }}
              style={{ background:"none", border:"none", cursor:"pointer", padding:4, opacity:.5 }}>
              <SkipForward className="w-4 h-4" style={{ color:C.purple }}/>
            </button>
          </div>
          {editMode && (
            <div style={{ marginTop:12, textAlign:"center", display:"flex", justifyContent:"center", gap:8 }}>
              <button type="button" onClick={() => mp3Ref.current?.click()}
                style={{ background:C.offWhite, border:`1px solid ${C.lavender}`, borderRadius:99, padding:"4px 14px",
                  cursor:"pointer", fontFamily:F.label, fontSize:9, color:C.purpleMid, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                Schimba sursa
              </button>
              <button type="button" onClick={() => { deleteUploadedFile(block.musicUrl); onUpdate({musicUrl:"",musicType:"none" as any}); setPlaying(false); setProgress(0); setDuration(0); }}
                style={{ background:"transparent", border:`1px dashed ${C.lavender}`, borderRadius:99, padding:"4px 12px",
                  cursor:"pointer", fontFamily:F.label, fontSize:9, color:C.purpleMid, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                Sterge
              </button>
              <input ref={mp3Ref} type="file" accept="audio/*,.mp3" onChange={e => { const f=e.target.files?.[0]; if(f) handleMp3(f); }} style={{ display:"none" }}/>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AUDIO PERMISSION MODAL ───────────────────────────────────────────────────
const AudioPermissionModal: React.FC<{ childName: string; onAllow: () => void; onDeny: () => void }> = ({ childName, onAllow, onDeny }) => (
  <div style={{ position:"fixed", inset:0, zIndex:10020, display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ position:"absolute", inset:0, background:hexToRgba(C.purple,0.65), backdropFilter:"blur(8px)" }}/>
    <div style={{ position:"relative", background:"white", borderRadius:24, padding:"36px 32px 28px", maxWidth:340, width:"90%", textAlign:"center",
      boxShadow:"0 24px 80px rgba(0,0,0,0.35)", border:`1px solid ${C.lavender}` }}>
      <style>{`@keyframes ua-audio-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>
      <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.lavLight},${C.purpleLight})`,
        display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px",
        animation:"ua-audio-pulse 2s ease-in-out infinite", boxShadow:`0 8px 24px ${hexToRgba(C.purpleLight,0.35)}` }}>
        <Music className="w-8 h-8" style={{ color:C.purple }}/>
      </div>
      <p style={{ fontFamily:F.display, fontSize:28, color:C.purple, margin:"0 0 6px", lineHeight:1.2 }}>{childName}</p>
      <p style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:C.purpleMid, margin:"0 0 8px" }}>te invită la petrecere magică</p>
      <p style={{ fontFamily:F.body, fontSize:11, color:"#5f6f84", margin:"0 0 28px", lineHeight:1.6 }}>Invitația are o melodie specială.<br/>Vrei să activezi muzica?</p>
      <button type="button" onClick={onAllow} style={{ width:"100%", padding:"14px 0",
        background:`linear-gradient(135deg,${C.purpleLight},${C.purple})`, border:"none", borderRadius:50,
        cursor:"pointer", fontFamily:F.label, fontSize:11, fontWeight:700, color:"white",
        letterSpacing:"0.1em", marginBottom:10, boxShadow:`0 6px 20px ${hexToRgba(C.purpleLight,0.4)}` }}>
        Da, activeaza muzica
      </button>
      <button type="button" onClick={onDeny} style={{ width:"100%", padding:"10px 0", background:"transparent",
        border:"none", cursor:"pointer", fontFamily:F.body, fontSize:11, color:"#718096" }}>
        Nu, continua fara muzica
      </button>
    </div>
  </div>
);

// ─── CALENDAR MONTH ───────────────────────────────────────────────────────────
const CalendarMonth: React.FC<{ date: string|undefined }> = ({ date }) => {
  if (!date) return null;
  const d = new Date(date);
  const year=d.getFullYear(), month=d.getMonth(), day=d.getDate();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthNames=['IANUARIE','FEBRUARIE','MARTIE','APRILIE','MAI','IUNIE','IULIE','AUGUST','SEPTEMBRIE','OCTOMBRIE','NOIEMBRIE','DECEMBRIE'];
  const dayLabels=['L','M','M','J','V','S','D'];
  const startOffset=(firstDay+6)%7;
  const cells:(number|null)[]=[...Array(startOffset).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
  return (
    <div style={{ background:"white", borderRadius:16, padding:20, textAlign:"center", border:`1px solid ${C.lavender}` }}>
      <p style={{ fontFamily:F.label, fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:C.purple, marginBottom:12 }}>{monthNames[month]} {year}</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
        {dayLabels.map((l,i) => <div key={`${l}-${i}`} style={{ fontSize:9, fontWeight:700, color:C.lavender }}>{l}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
        {cells.map((cell,i) => {
          const isToday = cell===day;
          return <div key={i} style={{ height:26, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:12, fontWeight:isToday?700:400,
            color:isToday?"white":cell?C.purple:"transparent",
            background:isToday?C.purpleLight:"transparent", borderRadius:"50%" }}>{cell||""}</div>;
        })}
      </div>
    </div>
  );
};
