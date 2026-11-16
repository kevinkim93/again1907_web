/**
 * Rebuild the invitation thumbnail: node scripts/generate-invite-og.mjs
 * Uses the site's existing artwork, OFL fonts, and gathering data. No network access.
 * Keep all text inside the central 600 × 510 area for square thumbnail crops.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import { gathering } from '../lib/gathering.js';
import { scheduleDays } from '../lib/gathering-schedule.js';

const root = new URL('../', import.meta.url);
const readAsset = (path) => readFile(new URL(`public/${path}`, root));
const [regular, bold, display, background] = await Promise.all([
  readAsset('fonts/Gathering-Myeongjo-Regular.woff'),
  readAsset('fonts/Gathering-Myeongjo-ExtraBold.woff'),
  readAsset('fonts/Gathering-Display-BlackItalic.woff'),
  readAsset('images/again1907-heaven-light.jpg'),
]);

const [, edition, englishName, koreanName] = gathering.name.match(/^(제\d+차)\s+(Again\s+1907)\s+(.+)$/) ?? [];
if (!edition) throw new Error('Review invitation typography for the updated gathering name.');
const firstDay = scheduleDays[0];
const lastDay = scheduleDays.at(-1);
const dateLabel = `${firstDay.dateTime.replaceAll('-', '. ')} (${firstDay.shortLabel}) — ${lastDay.dateTime.slice(5).replace('-', '. ')} (${lastDay.shortLabel})`;
const line = (text, style) => h('div', { style: { display: 'flex', justifyContent: 'center', ...style } }, text);

const image = new ImageResponse(
  h('div', {
    style: {
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', position: 'relative',
      backgroundColor: '#102a4c', color: '#fbf6e9', fontFamily: 'Gathering Myeongjo',
    },
  },
  h('img', {
    src: `data:image/jpeg;base64,${background.toString('base64')}`,
    width: 1200, height: 630,
    style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  }),
  h('div', {
    style: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundImage: 'linear-gradient(180deg, rgba(7,27,54,0.72), rgba(16,42,76,0.89))',
    },
  }),
  h('div', { style: { position: 'absolute', top: 34, left: 34, width: 1132, height: 562, border: '1px solid rgba(239,227,199,0.38)' } }),
  h('div', {
    style: {
      width: 600, display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', position: 'relative', marginTop: -4,
    },
  },
  line(edition, { fontSize: 27, fontWeight: 800, lineHeight: 1.3 }),
  line(englishName, { fontFamily: 'Gathering Display', fontStyle: 'italic', fontWeight: 900, fontSize: 69, lineHeight: 1.2, marginTop: 8 }),
  line(koreanName, { fontSize: 43, fontWeight: 800, lineHeight: 1.3, marginTop: 12 }),
  h('div', { style: { width: 52, height: 2, backgroundColor: '#d5b77a', marginTop: 25, marginBottom: 20 } }),
  line('초청합니다', { fontSize: 82, fontWeight: 800, lineHeight: 1.3, letterSpacing: -3, color: '#f3dba5' }),
  line(dateLabel, { fontSize: 27, fontWeight: 800, lineHeight: 1.5, marginTop: 26 }),
  line(gathering.venue, { fontSize: 33, fontWeight: 800, lineHeight: 1.5, marginTop: 7 }),
  )),
  {
    width: 1200, height: 630,
    fonts: [
      { name: 'Gathering Myeongjo', data: regular, weight: 400, style: 'normal' },
      { name: 'Gathering Myeongjo', data: bold, weight: 800, style: 'normal' },
      { name: 'Gathering Display', data: display, weight: 900, style: 'italic' },
    ],
  },
);

const output = new URL('public/images/again1907-6th-invite-og.png', root);
const png = Buffer.from(await image.arrayBuffer());
await writeFile(output, png);
console.log(`${fileURLToPath(output)}: 1200 × 630, ${png.byteLength.toLocaleString()} bytes`);
