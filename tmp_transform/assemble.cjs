const fs = require('fs');
const path = require('path');

const base = path.resolve('src/components/invitations');
const tmp = path.resolve('tmp_transform');

// Read step1 result (imports done, base64 replaced)
let content = fs.readFileSync(path.join(base, 'UnicornAcademyTemplate.tsx') + '.step1.tmp', 'utf8');

// ── Step 5: Replace LocCard ──────────────────────────────────────────────────
const locCardStart = '// ─── LOCATION CARD ────────────────────────────────────────────────────────────';
const locCardEnd   = '// ─── COUNTDOWN ────────────────────────────────────────────────────────────────';

const locCardStartIdx = content.indexOf(locCardStart);
const locCardEndIdx   = content.indexOf(locCardEnd);

if (locCardStartIdx === -1) { console.error('LocCard start not found!'); process.exit(1); }
if (locCardEndIdx === -1)   { console.error('LocCard end not found!'); process.exit(1); }

const newLocCard = fs.readFileSync(path.join(tmp, 'new_loccard.tsx'), 'utf8');
content = content.slice(0, locCardStartIdx) + newLocCard + '\n' + content.slice(locCardEndIdx);

console.log('LocCard replaced at:', locCardStartIdx);

// ── Step 6: Insert new components + replace main template ────────────────────
const mainStart = '// ─── MAIN TEMPLATE ────────────────────────────────────────────────────────────';
const mainStartIdx = content.indexOf(mainStart);
if (mainStartIdx === -1) { console.error('Main template start not found!'); process.exit(1); }

// Find the end (export default UnicornAcademyTemplate;)
const exportDefault = '\nexport default UnicornAcademyTemplate;';
const exportIdx = content.lastIndexOf(exportDefault);
if (exportIdx === -1) { console.error('export default not found!'); process.exit(1); }

const newComponents = fs.readFileSync(path.join(tmp, 'new_components.tsx'), 'utf8');
const newMain       = fs.readFileSync(path.join(tmp, 'new_main.tsx'), 'utf8');
const newExports    = fs.readFileSync(path.join(tmp, 'new_exports.tsx'), 'utf8');

// Keep everything before mainStart, then inject new components + new main
content = content.slice(0, mainStartIdx) + newComponents + '\n' + newMain + '\n' + newExports;

console.log('Main template replaced');

// Write final result
const outPath = path.join(base, 'UnicornAcademyTemplate.tsx');
fs.writeFileSync(outPath, content, 'utf8');

// Verify
const written = fs.readFileSync(outPath, 'utf8');
const lines = written.split('\n').length;
console.log('Final file written:', lines, 'lines,', written.length, 'bytes');
console.log('Has InlineEdit import:', written.includes('InlineEdit'));
console.log('Has getUnicornTheme:', written.includes('getUnicornTheme'));
console.log('Has BlockToolbar:', written.includes('const BlockToolbar'));
console.log('Has PhotoBlock:', written.includes('const PhotoBlock'));
console.log('Has MusicBlock:', written.includes('const MusicBlock'));
console.log('Has AudioPermissionModal:', written.includes('const AudioPermissionModal'));
console.log('Has CASTLE_DEFAULT_BLOCKS:', written.includes('export const CASTLE_DEFAULT_BLOCKS'));
console.log('Has CASTLE_PREVIEW_DATA:', written.includes('export const CASTLE_PREVIEW_DATA'));
console.log('Has IMG_SOPHIA path:', written.includes('"/unicornacademy/sophia.jpg"'));
console.log('Has let C:', written.includes('\nlet C = {'));
console.log('Has hexToRgba:', written.includes('const hexToRgba'));
console.log('Has StarField:', written.includes('const StarField'));
console.log('Has UnicornIntro:', written.includes('const UnicornIntro'));
console.log('Has GoldFrame:', written.includes('const GoldFrame'));
