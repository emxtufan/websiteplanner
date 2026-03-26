// ─── LOCATION CARD ────────────────────────────────────────────────────────────
const LocCard: React.FC<{
  label: string; time?: string; name?: string; address?: string; wazeLink?: string;
  editMode?: boolean;
  onLabelChange?: (v: string) => void;
  onTimeChange?: (v: string) => void;
  onNameChange?: (v: string) => void;
  onAddressChange?: (v: string) => void;
  onWazeChange?: (v: string) => void;
}> = ({ label, time, name, address, wazeLink, editMode = false, onLabelChange, onTimeChange, onNameChange, onAddressChange, onWazeChange }) => {
  if (!editMode && !name && !time && !address && !wazeLink) return null;
  const enc = address ? encodeURIComponent(address) : '';
  return (
    <div style={{
      background: `linear-gradient(135deg,rgba(92,0,153,.55),rgba(58,0,111,.7))`,
      border: `1.5px solid rgba(245,166,35,.3)`,
      borderTop: `3px solid ${C.gold}`,
      borderRadius: 16, padding: '18px 22px',
      backdropFilter: 'blur(8px)',
      boxShadow: `0 6px 28px rgba(0,0,0,.45), inset 0 1px 0 rgba(245,166,35,.12)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(245,166,35,.04),transparent)',
        backgroundSize:'200% 100%', animation:'ua-shimmer 4s linear infinite', pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 .5 L7 4.8 L11.5 6 L7 7.2 L6 11.5 L5 7.2 L.5 6 L5 4.8 Z" fill={C.gold}/>
          </svg>
          <InlineEdit tag="p" editMode={editMode} value={label} onChange={v => onLabelChange?.(v)}
            textLabel="Locatie - eticheta"
            style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.5em', textTransform:'uppercase', color:C.gold, margin:0, opacity:.85 }}/>
        </div>
        {(time !== undefined || editMode) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke={C.lavender} strokeWidth=".8" opacity=".7"/>
              <path d="M6.5 3.5 L6.5 6.5 L8.8 8.5" stroke={C.lavender} strokeWidth=".9"
                strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
            </svg>
            <InlineTime editMode={editMode} value={time || ''} onChange={v => onTimeChange?.(v)}
              textKey="loc-time" textLabel="Locatie - ora"
              style={{ fontFamily:F.body, fontSize:22, fontWeight:800, color:C.lavender, margin:0, letterSpacing:1 }}/>
          </div>
        )}
        <InlineEdit tag="p" editMode={editMode} value={name || ''} onChange={v => onNameChange?.(v)}
          placeholder="Nume locatie..." textLabel="Locatie - nume"
          style={{ fontFamily:F.label, fontSize:12, color:C.white, margin:'0 0 3px', letterSpacing:.5, lineHeight:1.5 }}/>
        {(address || editMode) && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginTop:5 }}>
            <svg width="10" height="13" viewBox="0 0 10 14" fill="none" style={{ flexShrink:0, marginTop:2 }}>
              <path d="M5 0C2.8 0 1 1.8 1 4c0 3 4 9 4 9s4-6 4-9C9 1.8 7.2 0 5 0z" fill={`${C.gold}88`}/>
              <circle cx="5" cy="4" r="1.5" fill={C.purpleMid}/>
            </svg>
            <InlineEdit tag="p" editMode={editMode} value={address || ''} onChange={v => onAddressChange?.(v)}
              placeholder="Adresa..." textLabel="Locatie - adresa"
              style={{ fontFamily:F.body, fontSize:11, fontWeight:600, color:`rgba(221,182,248,.55)`, margin:0, lineHeight:1.6, fontStyle:'italic' }}/>
          </div>
        )}
        {editMode && (
          <div style={{ marginTop:8 }}>
            <InlineWaze editMode={editMode} value={wazeLink || ''} onChange={v => onWazeChange?.(v)}
              textLabel="Locatie - waze link"
              style={{ fontFamily:F.body, fontSize:10, color:C.lavender }}/>
          </div>
        )}
        {!editMode && (wazeLink || address) && (
          <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:12 }}>
            {wazeLink && (
              <a href={wazeLink} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:5, padding:'6px 16px',
                borderRadius:50, background:C.gold, color:C.purple,
                fontFamily:F.label, fontSize:9, letterSpacing:'.3em', textTransform:'uppercase',
                textDecoration:'none', fontWeight:700, boxShadow:`0 3px 12px ${C.goldGlow}`,
              }}>✦ Waze</a>
            )}
            {address && (
              <a href={`https://maps.google.com/?q=${enc}`} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:5, padding:'6px 16px',
                borderRadius:50, background:'transparent', color:C.gold,
                border:`1.5px solid rgba(245,166,35,.5)`,
                fontFamily:F.label, fontSize:9, letterSpacing:'.3em', textTransform:'uppercase',
                textDecoration:'none',
              }}>◉ Maps</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
