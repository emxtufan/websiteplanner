// ─── MAIN TEMPLATE ────────────────────────────────────────────────────────────
export type UnicornAcademyTemplateProps = InvitationTemplateProps & {
  editMode?: boolean;
  introPreview?: boolean;
  onProfileUpdate?: (patch: Record<string, any>) => void;
  onBlocksUpdate?: (blocks: InvitationBlock[]) => void;
  onBlockSelect?: (block: InvitationBlock | null, idx: number, textKey?: string, textLabel?: string) => void;
  selectedBlockId?: string;
};

const UnicornAcademyTemplate: React.FC<UnicornAcademyTemplateProps> = ({
  data, onOpenRSVP, introPreview = false,
  editMode = false, onProfileUpdate, onBlocksUpdate, onBlockSelect, selectedBlockId,
}) => {
  const { profile, guest } = data;
  const upProfile = (key: string, value: any) => onProfileUpdate?.({ [key]: value });

  const theme = getUnicornTheme((profile as any).colorTheme);
  C = {
    ...C,
    purple: theme.TEXT,
    purpleMid: theme.PINK_DARK,
    purpleLight: theme.PINK_D,
    purpleGlow: hexToRgba(theme.PINK_D, 0.6),
    lavender: theme.PINK_L,
    lavLight: theme.PINK_XL,
    gold: theme.GOLD,
    goldDeep: hexToRgba(theme.GOLD, 0.8),
    goldPale: hexToRgba(theme.GOLD, 0.5),
    goldGlow: hexToRgba(theme.GOLD, 0.4),
    offWhite: theme.CREAM,
  };

  const safeJSON = (s: string | undefined, fb: any) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };
  const isWedding = !profile.eventType || profile.eventType === 'wedding' || profile.eventType === 'anniversary';

  const blocksFromDB: InvitationBlock[] | null = safeJSON(profile.customSections, null);
  const hasDBBlocks = Array.isArray(blocksFromDB) && blocksFromDB.length > 0;
  const [blocks, setBlocks] = useState<InvitationBlock[]>(() =>
    hasDBBlocks ? blocksFromDB! : CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]
  );
  useEffect(() => {
    const fresh: InvitationBlock[] | null = safeJSON(profile.customSections, null);
    if (Array.isArray(fresh) && fresh.length > 0) setBlocks(fresh);
    else if (fresh !== null && Array.isArray(fresh) && fresh.length === 0) {
      setBlocks(CASTLE_DEFAULT_BLOCKS as unknown as InvitationBlock[]);
    }
  }, [profile.customSections]);

  const [openInsertAt, setOpenInsertAt] = useState<number | null>(null);
  const musicPlayRef = useRef<{ unlock: () => void; play: () => void; pause: () => void } | null>(null);
  const audioAllowedRef = useRef(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  const updBlock = useCallback((idx: number, patch: Partial<InvitationBlock>) => {
    setBlocks(prev => { const nb = prev.map((b, i) => i === idx ? { ...b, ...patch } : b); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const movBlock = useCallback((idx: number, dir: -1 | 1) => {
    setBlocks(prev => { const nb = [...prev]; const to = idx + dir; if (to < 0 || to >= nb.length) return prev; [nb[idx], nb[to]] = [nb[to], nb[idx]]; onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const delBlock = useCallback((idx: number) => {
    setBlocks(prev => { const nb = prev.filter((_, i) => i !== idx); onBlocksUpdate?.(nb); return nb; });
  }, [onBlocksUpdate]);
  const addBlockAt = useCallback((afterIdx: number, type: string, def: any) => {
    setBlocks(prev => {
      const nb = [...prev];
      nb.splice(afterIdx + 1, 0, { id: Date.now().toString(), type: type as InvitationBlockType, show: true, ...def });
      onBlocksUpdate?.(nb);
      return nb;
    });
  }, [onBlocksUpdate]);

  const getTimelineItems = () => safeJSON(profile.timeline, []);
  const updateTimeline = (next: any[]) => { onProfileUpdate?.({ timeline: JSON.stringify(next), showTimeline: true } as any); };
  const addTimelineItem = () => updateTimeline([...getTimelineItems(), { id: Date.now().toString(), title: "", time: "", notice: "" }]);
  const updateTimelineItem = (id: string, patch: any) => updateTimeline(getTimelineItems().map((t: any) => t.id === id ? { ...t, ...patch } : t));
  const removeTimelineItem = (id: string) => updateTimeline(getTimelineItems().filter((t: any) => t.id !== id));

  const handleInsertAt = (afterIdx: number, type: string, def: any) => {
    if (type === "timeline") { if (getTimelineItems().length === 0) addTimelineItem(); }
    addBlockAt(afterIdx, type, def);
    setOpenInsertAt(null);
  };

  const shouldUseIntro = !editMode && !introPreview;
  const [showIntro, setShowIntro] = useState(shouldUseIntro);
  const [contentVisible, setContentVisible] = useState(!shouldUseIntro);
  const hasPlayableMusic = blocks.some((b: any) => b.type === "music" && b.show !== false && !!b.musicUrl);

  useEffect(() => {
    if (!editMode && shouldUseIntro && showIntro && hasPlayableMusic && !audioAllowedRef.current) {
      setShowAudioModal(true);
    } else { setShowAudioModal(false); }
  }, [editMode, shouldUseIntro, showIntro, hasPlayableMusic]);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow='hidden'; document.body.style.position='fixed';
      document.body.style.top='0'; document.body.style.left='0'; document.body.style.right='0';
    } else {
      document.body.style.overflow=''; document.body.style.position='';
      document.body.style.top=''; document.body.style.left=''; document.body.style.right='';
    }
    return () => {
      document.body.style.overflow=''; document.body.style.position='';
      document.body.style.top=''; document.body.style.left=''; document.body.style.right='';
    };
  }, [showIntro]);

  const handleIntroDone = () => {
    window.scrollTo(0,0);
    setShowIntro(false);
    setTimeout(() => {
      window.scrollTo(0,0);
      setContentVisible(true);
      if (audioAllowedRef.current) musicPlayRef.current?.play();
    }, 60);
  };

  const l1 = (profile.partner1Name || 'S').charAt(0).toUpperCase();
  const l2 = !isWedding ? '' : (profile.partner2Name || 'W').charAt(0).toUpperCase();

  const getEventText = () => {
    const map: Record<string,any> = {
      wedding:     { welcome:'Cu onoare vă invităm',       celebration:'căsătoriei',     churchLabel:'Cununia',    venueLabel:'Recepția',   civilLabel:'Cununie Civilă' },
      baptism:     { welcome:'Cu bucurie vă invităm',      celebration:'botezului',       churchLabel:'Botezul',    venueLabel:'Petrecerea', civilLabel:'' },
      anniversary: { welcome:'Cu drag vă invităm alături', celebration:'aniversării',     churchLabel:'Ceremonia',  venueLabel:'Recepția',   civilLabel:'' },
      kids:        { welcome:'Te invităm la',               celebration:'ziua de naștere', churchLabel:'Distracția', venueLabel:'Petrecerea', civilLabel:'' },
    };
    const d = map[profile.eventType || 'wedding'] || map.wedding;
    return {
      welcome:     profile.welcomeText?.trim()     || d.welcome,
      celebration: profile.celebrationText?.trim() || d.celebration,
      churchLabel: profile.churchLabel?.trim()     || d.churchLabel,
      venueLabel:  profile.venueLabel?.trim()      || d.venueLabel,
      civilLabel:  profile.civilLabel?.trim()      || d.civilLabel,
    };
  };
  const texts = getEventText();

  const wd             = profile.weddingDate ? new Date(profile.weddingDate) : null;
  const displayDay     = wd ? wd.getDate() : '';
  const displayMonth   = wd ? wd.toLocaleDateString('ro-RO',{month:'long'}).toUpperCase() : '';
  const displayYear    = wd ? wd.getFullYear() : '';
  const displayWeekday = wd ? wd.toLocaleDateString('ro-RO',{weekday:'long'}) : '';

  const sectionStyle: React.CSSProperties = {
    background:`linear-gradient(135deg,rgba(92,0,153,.5),rgba(58,0,111,.65))`,
    border:`1.5px solid rgba(245,166,35,.22)`,
    borderRadius:20, backdropFilter:'blur(10px)', padding:'22px 22px',
    position:'relative', overflow:'hidden', boxShadow:`0 8px 32px rgba(0,0,0,.45)`,
  };
  const starDots: React.CSSProperties = {
    position:'absolute', inset:0, pointerEvents:'none',
    backgroundImage:'radial-gradient(circle,rgba(245,166,35,.04) 1px,transparent 1px)',
    backgroundSize:'16px 16px',
  };

  const heroTextStyles = (profile as any).heroTextStyles || {};
  const heroBlock: InvitationBlock = { id:"__hero__", type:"__hero__" as any, show:true, textStyles:heroTextStyles } as any;

  const BLOCK_TYPES = [
    { type:"photo",       label:"Foto",       def:{ imageData:"", altText:"", aspectRatio:"1:1", photoClip:"rect", photoMasks:[] } },
    { type:"text",        label:"Text",       def:{ content:"O poveste magică începe..." } },
    { type:"location",    label:"Locatie",    def:{ label:"Locatie", time:"11:00", locationName:"Locatie eveniment", locationAddress:"Strada Exemplu, Nr. 1", wazeLink:"" } },
    { type:"calendar",    label:"Calendar",   def:{} },
    { type:"countdown",   label:"Countdown",  def:{ countdownTitle:"Timp rămas până la eveniment" } },
    { type:"timeline",    label:"Cronologie", def:{} },
    { type:"music",       label:"Muzica",     def:{ musicTitle:"", musicArtist:"", musicType:"none" } },
    { type:"gift",        label:"Cadouri",    def:{ sectionTitle:"Sugestie cadou", content:"", iban:"", ibanName:"" } },
    { type:"whatsapp",    label:"WhatsApp",   def:{ label:"Contact WhatsApp", content:"0700000000" } },
    { type:"rsvp",        label:"RSVP",       def:{ label:"Confirmă Prezența" } },
    { type:"divider",     label:"Linie",      def:{} },
    { type:"family",      label:"Familie",    def:{ label:"Părinții copilului", content:"Cu drag și recunoștință", members:JSON.stringify([{name1:"Mama",name2:"Tata"}]) } },
    { type:"date",        label:"Data",       def:{} },
    { type:"description", label:"Descriere",  def:{ content:"O scurtă descriere..." } },
  ];

  return (
    <>
      <style>{UA_CSS}</style>
      {showAudioModal && (
        <AudioPermissionModal
          childName={profile.partner1Name || "Invitația"}
          onAllow={() => { audioAllowedRef.current = true; musicPlayRef.current?.unlock(); setShowAudioModal(false); }}
          onDeny={() => { audioAllowedRef.current = false; setShowAudioModal(false); }}
        />
      )}
      {showIntro && shouldUseIntro && <UnicornIntro l1={l1} l2={l2} onDone={handleIntroDone}/>}

      <div style={{
        minHeight:'100vh', position:'relative', fontFamily:F.body,
        opacity: contentVisible ? 1 : 0,
        transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
        transition:'opacity .7s cubic-bezier(.4,0,.2,1), transform .7s cubic-bezier(.4,0,.2,1)',
        paddingBottom:60,
      }}>
        <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`url(${IMG_BG})`,
          backgroundSize:'cover', backgroundPosition:'center top', filter:'brightness(.85)' }}/>
        <div style={{ position:'fixed', inset:0, zIndex:0,
          background:'radial-gradient(ellipse 80% 80% at 50% 50%,transparent 40%,rgba(10,0,30,.6) 100%)',
          pointerEvents:'none' }}/>
        <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }}>
          <StarField count={22}/>
        </div>

        <div style={{ position:'relative', zIndex:2, maxWidth:440, margin:'0 auto', padding:'28px 16px 0' }}>

          {/* ── HERO CARD ── */}
          <Reveal from="fade">
            <BlockStyleProvider value={{
              blockId: heroBlock.id, textStyles: heroBlock.textStyles,
              onTextSelect: (textKey, textLabel) => onBlockSelect?.(heroBlock, -1, textKey, textLabel),
            }}>
              <div style={{ ...sectionStyle, textAlign:'center', padding:'36px 28px 32px', borderTop:`3px solid ${C.gold}` }}>
                <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                  background:'linear-gradient(90deg,transparent,rgba(245,166,35,.05),transparent)',
                  backgroundSize:'200% 100%', animation:'ua-shimmer 5s linear infinite' }}/>

                <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:18, marginBottom:20 }}>
                  <Reveal from="left" delay={0.1}><GoldFrame src={IMG_SOPHIA} size={100} float floatDelay={0}/></Reveal>
                  <div style={{ paddingBottom:16, animation:'ua-hornGlow 2.5s ease-in-out infinite' }}><UnicornHorn size={28}/></div>
                  <Reveal from="right" delay={0.1}><GoldFrame src={IMG_WILDSTAR} size={100} float floatDelay={0.5}/></Reveal>
                </div>

                <Reveal from="fade" delay={0.2}>
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div style={{ flex:1, height:'.7px', background:`linear-gradient(to right,transparent,${C.gold})`, opacity:.4 }}/>
                    <StarMedallion size={42}/>
                    <div style={{ flex:1, height:'.7px', background:`linear-gradient(to left,transparent,${C.gold})`, opacity:.4 }}/>
                  </div>
                  <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.62em', textTransform:'uppercase',
                    color:C.gold, margin:'0 0 14px', opacity:.85 }}>
                    Unicorn Academy · Invitație
                  </p>
                </Reveal>

                {(editMode || profile.showWelcomeText !== false) && (
                  <Reveal from="bottom" delay={0.25}>
                    <InlineEdit tag="p" editMode={!!editMode} value={texts.welcome}
                      onChange={v => upProfile("welcomeText", v)} textLabel="Hero - welcome"
                      style={{ fontFamily:F.body, fontSize:13, fontWeight:700, fontStyle:'italic',
                        color:`rgba(221,182,248,.6)`, margin:'0 0 14px', lineHeight:1.7 }}/>
                  </Reveal>
                )}

                <Reveal from="bottom" delay={0.3}>
                  {!isWedding ? (
                    <InlineEdit tag="h1" editMode={!!editMode} value={profile.partner1Name || 'Prenume'}
                      onChange={v => upProfile("partner1Name", v)} textLabel="Hero - nume"
                      style={{ fontFamily:F.display, fontWeight:900, fontSize:'clamp(34px,8.5vw,52px)',
                        color:C.white, margin:'0 0 4px', lineHeight:1.05, letterSpacing:3,
                        textShadow:`0 0 32px rgba(245,166,35,.4), 0 2px 0 rgba(0,0,0,.5)`,
                        maxWidth:'100%', whiteSpace:'normal', overflowWrap:'anywhere', wordBreak:'break-word' }}/>
                  ) : (
                    <div style={{ margin:'0 0 4px' }}>
                      <InlineEdit tag="h1" editMode={!!editMode} value={profile.partner1Name || 'Prenume'}
                        onChange={v => upProfile("partner1Name", v)} textLabel="Hero - nume 1"
                        style={{ fontFamily:F.display, fontWeight:900, fontSize:'clamp(28px,7vw,44px)',
                          color:C.white, margin:0, lineHeight:1.1, letterSpacing:3,
                          textShadow:`0 0 28px rgba(245,166,35,.35), 0 2px 0 rgba(0,0,0,.5)`,
                          maxWidth:'100%', whiteSpace:'normal', overflowWrap:'anywhere', wordBreak:'break-word' }}/>
                      <div style={{ margin:'10px 0', display:'flex', alignItems:'center', gap:14, justifyContent:'center' }}>
                        <div style={{ flex:1, height:'.7px', background:`linear-gradient(to right,transparent,${C.gold})`, opacity:.5 }}/>
                        <span style={{ fontFamily:F.body, fontSize:26, fontWeight:800, color:C.gold, lineHeight:1 }}>&amp;</span>
                        <div style={{ flex:1, height:'.7px', background:`linear-gradient(to left,transparent,${C.gold})`, opacity:.5 }}/>
                      </div>
                      <InlineEdit tag="h1" editMode={!!editMode} value={profile.partner2Name || 'Prenume'}
                        onChange={v => upProfile("partner2Name", v)} textLabel="Hero - nume 2"
                        style={{ fontFamily:F.display, fontWeight:900, fontSize:'clamp(28px,7vw,44px)',
                          color:C.white, margin:0, lineHeight:1.1, letterSpacing:3,
                          textShadow:`0 0 28px rgba(245,166,35,.35), 0 2px 0 rgba(0,0,0,.5)`,
                          maxWidth:'100%', whiteSpace:'normal', overflowWrap:'anywhere', wordBreak:'break-word' }}/>
                    </div>
                  )}
                </Reveal>

                {(editMode || profile.showCelebrationText !== false) && (
                  <Reveal from="bottom" delay={0.35}>
                    <p style={{ fontFamily:F.body, fontSize:13, fontWeight:700, fontStyle:'italic',
                      color:`rgba(221,182,248,.5)`, margin:'12px 0 0', lineHeight:1.7 }}>
                      vă invită la{" "}
                      <InlineEdit tag="span" editMode={!!editMode} value={texts.celebration}
                        onChange={v => upProfile("celebrationText", v)} textLabel="Hero - celebrare"
                        style={{ fontFamily:F.body, fontSize:13, fontStyle:'italic', color:`rgba(221,182,248,.5)` }}/>
                    </p>
                  </Reveal>
                )}

                <div style={{ margin:'24px 0' }}><GoldDivider/></div>

                <Reveal from="bottom" delay={0.4}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:14, marginBottom:24 }}>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.4em', textTransform:'uppercase', color:`rgba(245,166,35,.7)`, margin:'0 0 2px' }}>{displayMonth}</p>
                      <p style={{ fontFamily:F.label, fontSize:8, letterSpacing:'.3em', color:`rgba(245,166,35,.4)`, margin:0 }}>{displayYear}</p>
                    </div>
                    <div style={{ width:68, height:68, borderRadius:'50%',
                      background:`radial-gradient(circle at 38% 35%,${C.purpleLight},${C.purple})`,
                      border:`2.5px solid ${C.gold}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:`0 0 22px ${C.goldGlow}, 0 4px 16px rgba(0,0,0,.5)`,
                      position:'relative', animation:'ua-glow 3s ease-in-out infinite' }}>
                      <div style={{ position:'absolute', inset:5, border:`1px solid rgba(245,166,35,.3)`, borderRadius:'50%' }}/>
                      <span style={{ fontFamily:F.display, fontWeight:700, fontSize:24, color:C.white, lineHeight:1, textShadow:`0 0 10px rgba(245,166,35,.4)` }}>{displayDay}</span>
                    </div>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ fontFamily:F.body, fontSize:12, fontStyle:'italic', color:`rgba(221,182,248,.45)`, margin:0, lineHeight:1.5, textTransform:'capitalize' }}>{displayWeekday}</p>
                    </div>
                  </div>
                </Reveal>

                <Reveal from="bottom" delay={0.45}><Countdown targetDate={profile.weddingDate}/></Reveal>

                <div style={{ margin:'24px 0 18px' }}><GoldDivider medallion/></div>

                <Reveal from="bottom" delay={0.5}>
                  <div style={{ padding:'16px 20px', background:`rgba(92,0,153,.3)`,
                    border:`1.5px solid rgba(245,166,35,.2)`, borderRadius:12, position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'1.5px',
                      background:`linear-gradient(to right,transparent,${C.gold},transparent)`, opacity:.4 }}/>
                    <p style={{ fontFamily:F.label, fontSize:7, letterSpacing:'.55em', textTransform:'uppercase',
                      color:`rgba(245,166,35,.5)`, margin:'0 0 7px' }}>Invitație pentru</p>
                    <p style={{ fontFamily:F.display, fontWeight:700, fontSize:19, color:C.white, margin:0,
                      letterSpacing:1.5, textShadow:`0 0 18px rgba(245,166,35,.2)` }}>
                      {guest?.name || 'Invitatul Special'}
                    </p>
                  </div>
                </Reveal>
              </div>
            </BlockStyleProvider>
          </Reveal>

          {/* ── BLOCKS ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
            {editMode && (
              <InsertBlockButton insertIdx={-1} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                BLOCK_TYPES={BLOCK_TYPES} onInsert={(type,def) => handleInsertAt(-1, type, def)}/>
            )}
            {blocks.filter(b => editMode || b.show !== false).map((block, idx) => {
              const visible = block.show !== false;
              const isSelected = selectedBlockId === block.id;
              return (
                <div key={block.id} className="group/insert">
                  <div
                    className={`relative group/block ${block.type === "divider" ? "" : "py-3"}`}
                    onClick={editMode ? () => onBlockSelect?.(block, idx) : undefined}
                    style={{
                      marginTop: block.blockMarginTop != null ? `${block.blockMarginTop}px` : undefined,
                      marginBottom: block.blockMarginBottom != null ? `${block.blockMarginBottom}px` : undefined,
                      paddingTop: block.blockPaddingTop != null ? `${block.blockPaddingTop}px` : undefined,
                      paddingBottom: block.blockPaddingBottom != null ? `${block.blockPaddingBottom}px` : undefined,
                      paddingLeft: block.blockPaddingH != null ? `${block.blockPaddingH}px` : undefined,
                      paddingRight: block.blockPaddingH != null ? `${block.blockPaddingH}px` : undefined,
                      opacity: block.opacity != null ? block.opacity / 100 : 1,
                      backgroundColor: block.bgColor || undefined,
                      borderRadius: block.blockRadius != null ? `${block.blockRadius}px` : undefined,
                      outline: editMode && isSelected ? `2px solid ${C.gold}` : undefined,
                      outlineOffset: editMode && isSelected ? 4 : undefined,
                    }}
                  >
                    {editMode && (
                      <BlockToolbar onUp={() => movBlock(idx,-1)} onDown={() => movBlock(idx,1)}
                        onToggle={() => updBlock(idx,{show:!visible})} onDelete={() => delBlock(idx)}
                        visible={visible} isFirst={idx===0} isLast={idx===blocks.length-1}/>
                    )}
                    <BlockStyleProvider value={{
                      blockId: block.id, textStyles: block.textStyles,
                      onTextSelect: (textKey,textLabel) => onBlockSelect?.(block,idx,textKey,textLabel),
                      fontFamily: block.blockFontFamily, fontSize: block.blockFontSize,
                      fontWeight: block.blockFontWeight, fontStyle: block.blockFontStyle,
                      letterSpacing: block.blockLetterSpacing, lineHeight: block.blockLineHeight,
                      textColor: block.textColor && block.textColor !== "transparent" ? block.textColor : undefined,
                      textAlign: block.blockAlign,
                    } as BlockStyle}>

                      {block.type === "photo" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <PhotoBlock imageData={block.imageData} altText={block.altText} editMode={editMode}
                            onUpload={url => updBlock(idx,{imageData:url})} onAltChange={v => updBlock(idx,{altText:v})}
                            onRemove={() => updBlock(idx,{imageData:undefined})} aspectRatio={block.aspectRatio as any}/>
                        </div>
                      )}

                      {block.type === "text" && (
                        <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})}
                            placeholder="Text..." style={{fontFamily:F.body,fontSize:14,color:C.lavLight,lineHeight:1.7}}/>
                        </div>
                      )}

                      {block.type === "location" && (
                        <LocCard label={block.label||"Locatie"} time={block.time||""} name={block.locationName}
                          address={block.locationAddress} wazeLink={block.wazeLink} editMode={editMode}
                          onLabelChange={v => updBlock(idx,{label:v})} onTimeChange={v => updBlock(idx,{time:v})}
                          onNameChange={v => updBlock(idx,{locationName:v})} onAddressChange={v => updBlock(idx,{locationAddress:v})}
                          onWazeChange={v => updBlock(idx,{wazeLink:v})}/>
                      )}

                      {block.type === "calendar" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <CalendarMonth date={profile.weddingDate}/>
                        </div>
                      )}

                      {block.type === "countdown" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.countdownTitle||"Timp rămas până la eveniment"}
                            onChange={v => updBlock(idx,{countdownTitle:v})} textLabel="Countdown - titlu"
                            style={{fontFamily:F.label,fontSize:9,letterSpacing:".4em",textTransform:"uppercase",color:C.gold,textAlign:"center",margin:"0 0 10px"}}/>
                          <Countdown targetDate={profile.weddingDate}/>
                        </div>
                      )}

                      {block.type === "timeline" && (() => {
                        const timelineItems = getTimelineItems();
                        if (!editMode && timelineItems.length === 0) return null;
                        return (
                          <div style={sectionStyle}><div style={starDots}/>
                            <p style={{fontFamily:F.label,fontSize:9,letterSpacing:".4em",textTransform:"uppercase",color:C.gold,textAlign:"center",margin:"0 0 14px"}}>Programul zilei</p>
                            {timelineItems.length === 0 && editMode && (
                              <p style={{fontFamily:F.body,fontSize:12,fontStyle:"italic",color:C.lavender,textAlign:"center",margin:"0 0 8px"}}>Adaugă primul moment al zilei.</p>
                            )}
                            {timelineItems.map((item: any, i: number) => (
                              <div key={item.id} style={{display:"grid",gridTemplateColumns:"58px 18px 1fr",alignItems:"stretch",minHeight:44}}>
                                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:10,paddingTop:4}}>
                                  <InlineTime editMode={editMode} value={item.time||""} onChange={v => updateTimelineItem(item.id,{time:v})}
                                    textKey={`timeline:${item.id}:time`} textLabel={`Ora ${i+1}`}
                                    style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.gold,textAlign:"center",width:"100%"}}/>
                                </div>
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                                  <div style={{width:10,height:10,borderRadius:"50%",background:C.gold}}/>
                                  {i < timelineItems.length-1 && (
                                    <div style={{flex:1,width:1,background:`linear-gradient(to bottom,${C.gold},transparent)`,marginTop:4}}/>
                                  )}
                                </div>
                                <div style={{paddingLeft:10,paddingTop:2,paddingBottom:i<timelineItems.length-1?18:0}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                                    <InlineEdit tag="span" editMode={editMode} value={item.title||""}
                                      onChange={v => updateTimelineItem(item.id,{title:v})} placeholder="Moment..."
                                      textKey={`timeline:${item.id}:title`} textLabel={`Titlu ${i+1}`}
                                      style={{fontFamily:F.body,fontSize:13,fontWeight:700,color:C.white}}/>
                                    {editMode && (
                                      <button type="button" onClick={() => removeTimelineItem(item.id)}
                                        style={{background:"none",border:"none",cursor:"pointer",color:C.lavender,fontSize:12,opacity:0.6}}>x</button>
                                    )}
                                  </div>
                                  {(editMode || item.notice) && (
                                    <InlineEdit tag="span" editMode={editMode} value={item.notice||""}
                                      onChange={v => updateTimelineItem(item.id,{notice:v})} placeholder="Nota..."
                                      textKey={`timeline:${item.id}:notice`} textLabel={`Nota ${i+1}`}
                                      style={{fontFamily:F.body,fontSize:11,fontStyle:"italic",color:C.lavender,display:"block",marginTop:4}}/>
                                  )}
                                </div>
                              </div>
                            ))}
                            <TimelineInsertButton editMode={editMode} onAdd={addTimelineItem}/>
                          </div>
                        );
                      })()}

                      {block.type === "music" && (
                        <div style={sectionStyle}><div style={starDots}/>
                          <MusicBlock block={block} editMode={editMode} onUpdate={p => updBlock(idx,p)} imperativeRef={musicPlayRef}/>
                        </div>
                      )}

                      {block.type === "gift" && (
                        <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                          <InlineEdit tag="h3" editMode={editMode} value={block.sectionTitle||"Sugestie de cadou"}
                            onChange={v => updBlock(idx,{sectionTitle:v})}
                            style={{fontFamily:F.display,fontSize:22,color:C.lavLight,margin:"0 0 8px"}}/>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})} multiline
                            style={{fontFamily:F.body,fontSize:12,color:C.lavender,opacity:0.9,lineHeight:1.6}}/>
                          {(block.iban||editMode) && (
                            <div style={{marginTop:10,padding:"8px 12px",borderRadius:12,border:`1px solid ${C.lavender}`,display:"inline-block"}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.iban||""} onChange={v => updBlock(idx,{iban:v})}
                                placeholder="IBAN..." style={{fontFamily:F.body,fontSize:11,color:C.lavLight,margin:0}}/>
                            </div>
                          )}
                          {(block.ibanName||editMode) && (
                            <InlineEdit tag="p" editMode={editMode} value={block.ibanName||""} onChange={v => updBlock(idx,{ibanName:v})}
                              placeholder="Nume beneficiar..." style={{fontFamily:F.body,fontSize:10,color:C.lavender,margin:"6px 0 0"}}/>
                          )}
                        </div>
                      )}

                      {block.type === "whatsapp" && (
                        <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                          <a href={`https://wa.me/${(block.content||"").replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:999,
                              background:C.lavLight,color:C.purple,textDecoration:"none",
                              fontFamily:F.label,fontSize:9,letterSpacing:".3em",textTransform:"uppercase"}}>
                            {block.label||"Contact WhatsApp"}
                          </a>
                          {editMode && (
                            <div style={{marginTop:8}}>
                              <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})}
                                placeholder="Numar..." style={{fontFamily:F.body,fontSize:12,color:C.lavender,margin:0}}/>
                            </div>
                          )}
                        </div>
                      )}

                      {block.type === "rsvp" && (
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <button onClick={() => { if(!editMode) onOpenRSVP?.(); }}
                            style={{padding:"14px 26px",borderRadius:999,
                              background:`linear-gradient(135deg,${C.gold},${C.goldDeep})`,
                              border:"none",fontFamily:F.label,fontSize:10,letterSpacing:".3em",
                              textTransform:"uppercase",color:C.purple,cursor:"pointer",
                              boxShadow:`0 6px 28px ${C.goldGlow}`}}>
                            <InlineEdit tag="span" editMode={editMode} value={block.label||"Confirmă Prezența"}
                              onChange={v => updBlock(idx,{label:v})}/>
                          </button>
                        </div>
                      )}

                      {block.type === "divider" && <GoldDivider/>}

                      {block.type === "family" && (() => {
                        const members: {name1:string;name2:string}[] = (() => { try { return JSON.parse(block.members||"[]"); } catch { return []; } })();
                        const updateMembers = (nm: {name1:string;name2:string}[]) => updBlock(idx,{members:JSON.stringify(nm)} as any);
                        return (
                          <div style={{...sectionStyle,textAlign:"center"}}><div style={starDots}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.label||"Familie"}
                              onChange={v => updBlock(idx,{label:v})}
                              style={{fontFamily:F.label,fontSize:9,letterSpacing:".3em",textTransform:"uppercase",color:C.gold,margin:"0 0 8px"}}/>
                            <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})} multiline
                              style={{fontFamily:F.body,fontSize:12,color:C.lavender,margin:"0 0 12px"}}/>
                            <div style={{display:"flex",flexDirection:"column",gap:10}}>
                              {members.map((m,mi) => (
                                <div key={mi} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
                                  <InlineEdit tag="span" editMode={editMode} value={m.name1}
                                    onChange={v => { const nm=[...members]; nm[mi]={...nm[mi],name1:v}; updateMembers(nm); }}
                                    style={{fontFamily:F.display,fontSize:18,color:C.lavLight}}/>
                                  <span style={{fontFamily:F.body,fontSize:14,color:C.lavender}}>&amp;</span>
                                  <InlineEdit tag="span" editMode={editMode} value={m.name2}
                                    onChange={v => { const nm=[...members]; nm[mi]={...nm[mi],name2:v}; updateMembers(nm); }}
                                    style={{fontFamily:F.display,fontSize:18,color:C.lavLight}}/>
                                  {editMode && members.length>1 && (
                                    <button type="button" onClick={() => updateMembers(members.filter((_,i)=>i!==mi))}
                                      style={{background:"none",border:"none",cursor:"pointer",color:C.lavender,fontSize:14,opacity:0.6}}>x</button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {editMode && (
                              <button type="button" onClick={() => updateMembers([...members,{name1:"Nume 1",name2:"Nume 2"}])}
                                style={{marginTop:12,background:"transparent",border:`1px dashed ${C.lavender}`,borderRadius:999,
                                  padding:"4px 14px",fontFamily:F.label,fontSize:9,letterSpacing:".2em",
                                  textTransform:"uppercase",color:C.lavender,cursor:"pointer"}}>
                                + Adauga
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {block.type === "date" && (
                        <div style={{textAlign:"center",padding:"6px 0"}}>
                          <InlineEdit tag="p" editMode={editMode}
                            value={block.content || `${displayWeekday} ${displayDay} ${displayMonth} ${displayYear}`}
                            onChange={v => updBlock(idx,{content:v})}
                            style={{fontFamily:F.label,fontSize:11,letterSpacing:".3em",color:C.gold,margin:0}}/>
                        </div>
                      )}

                      {block.type === "description" && (
                        <div style={{textAlign:"center",padding:"0 12px"}}>
                          <InlineEdit tag="p" editMode={editMode} value={block.content||""} onChange={v => updBlock(idx,{content:v})}
                            style={{fontFamily:F.body,fontSize:12,color:C.lavender,margin:0,lineHeight:1.7}}/>
                        </div>
                      )}

                    </BlockStyleProvider>
                  </div>
                  {editMode && (
                    <InsertBlockButton insertIdx={idx} openInsertAt={openInsertAt} setOpenInsertAt={setOpenInsertAt}
                      BLOCK_TYPES={BLOCK_TYPES} onInsert={(type,def) => handleInsertAt(idx, type, def)}/>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── FOOTER ── */}
          <Reveal from="fade" delay={0.1}>
            <div style={{ marginTop:28, textAlign:'center' }}>
              <GoldDivider/>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:14, margin:'16px 0 10px' }}>
                <GoldFrame src={IMG_SOPHIA} size={46}/>
                <StarMedallion size={32}/>
                <GoldFrame src={IMG_WILDSTAR} size={46}/>
              </div>
              <p style={{ fontFamily:F.label, fontSize:9, letterSpacing:'.45em', textTransform:'uppercase',
                color:`rgba(245,166,35,.3)`, margin:0 }}>
                Unicorn Academy · {displayYear}
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
};
