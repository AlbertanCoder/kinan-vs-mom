"""Kinan vs. Worlds - make the replacement voice clips in audio/vo2/ with Shad's picked voices.

    python make_vo2.py            make every missing clip, then write clips.json + gen_log.json
    python make_vo2.py --redo X   remake the clips of character X (e.g. narrator) and rewrite the maps
    python make_vo2.py --dry      print the plan (file, key, speaker, voice, spoken text, reuse) and make nothing

Lines come from extract_lines.cjs (read from index.html). Voices come from
Kinan Map Concept/voices/voice_cast_final.json (Shad's picks, 2026-10-27); characters with no pick
use the PLACEHOLDERS below and are listed in README.md. Effects and the edge-tts retry (ease the pitch
10 Hz toward 0 when the service refuses it) are the same as Kinan Map Concept/voices/lines/build_lines.py.
A line whose text is already recorded in voices/lines/manifest.json with the same character and the
picked voice reuses that recording. Every clip: mono, 24 kHz, 40 kbps; ID3 comment holds voice settings.
Writes only inside this folder (temporary files go to the system temp folder)."""
import asyncio
import html as htmllib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
CONCEPT = r'C:\Users\SHADHUNTER\Desktop\Kinan Map Concept\voices'
CAST_FILE = os.path.join(CONCEPT, 'voice_cast_final.json')
MANIFEST = os.path.join(CONCEPT, 'lines', 'manifest.json')
LOG = os.path.join(HERE, 'gen_log.json')
CLIPS = os.path.join(HERE, 'clips.json')
DELAY = 0.6
BITRATE = '40k'

FX = {   # same filters as build_lines.py / make_voices_bosses.py
    'robot': r"afftfilt=real='hypot(re\,im)*sin(0)':imag='hypot(re\,im)*cos(0)':win_size=512:overlap=0.75,volume=1.6",
    'glitch': "vibrato=f=11:d=0.5,acrusher=bits=7:mode=log:aa=1:mix=0.35,aecho=0.6:0.5:25:0.3",
    'echo': "aecho=0.8:0.85:90|180:0.35|0.2",
    'flange': "flanger=delay=2:depth=4:speed=0.6",
}

# the bold speaker name in the game's text -> character in voice_cast_final.json (or a placeholder below)
NAME_TO_CHAR = {
    'KINAN': 'kinan', 'MOM': 'mom', 'CHENOA': 'chenoa', 'DAD': 'robin', 'ROBIN': 'robin', 'SHAD': 'shad',
    'SHAD AND CHENOA': 'shad', 'NOSY NEIGHBOUR': 'neighbour', 'NEIGHBOUR': 'neighbour', 'FOREMAN': 'foreman',
    'SAFETY FOREMAN': 'foreman', 'CONDUCTOR': 'conductor', 'BARKER': 'barker', 'DRIZZLE': 'drizzle',
    'GLITCHY': 'glitchy', 'REX': 'roborex',
    'NARRATOR': 'narrator', 'BOSS': 'narrator',
    'MEGA-MECH': 'ph_megamech', '???': 'ph_megamech', 'PUMPJACK PETE': 'ph_pumpjack', 'BIG KID': 'ph_bigkid',
    'LIFEGUARD': 'ph_lifeguard', 'LUMBERJACK': 'ph_lumberjack', 'PROFESSOR STATIC': 'ph_static',
    'THE BIG GOALIE': 'ph_goalie', "THE NEIGHBOUR'S WIFE": 'ph_neighbourwife',
}
# NOT picked by Shad: stand-ins so no line falls back to the robot voice. Voices no family member uses.
PLACEHOLDERS = {
    'narrator': {'name': 'Narrator (story boxes, boss titles, how-to lines)', 'voice': 'en-US-AndrewNeural', 'rate': '+0%', 'pitch': '+0Hz', 'fx': None},
    'ph_megamech': {'name': 'Brick Mega-Mech', 'voice': 'en-US-EricNeural', 'rate': '-10%', 'pitch': '-25Hz', 'fx': 'robot'},
    'ph_pumpjack': {'name': 'Pumpjack Pete', 'voice': 'en-US-SteffanNeural', 'rate': '-12%', 'pitch': '-30Hz', 'fx': 'echo'},
    'ph_bigkid': {'name': 'The Big Kid', 'voice': 'en-US-EricNeural', 'rate': '+8%', 'pitch': '+40Hz', 'fx': None},
    'ph_lifeguard': {'name': 'The Wave Pool Lifeguard', 'voice': 'en-US-SteffanNeural', 'rate': '+6%', 'pitch': '+4Hz', 'fx': None},
    'ph_lumberjack': {'name': 'The Lumberjack Champ', 'voice': 'en-US-ChristopherNeural', 'rate': '-6%', 'pitch': '-16Hz', 'fx': None},
    'ph_static': {'name': 'Professor Static', 'voice': 'en-US-EricNeural', 'rate': '+6%', 'pitch': '+10Hz', 'fx': 'flange'},
    'ph_goalie': {'name': 'The Big Goalie', 'voice': 'en-US-SteffanNeural', 'rate': '+4%', 'pitch': '-6Hz', 'fx': None},
    'ph_neighbourwife': {'name': "The Neighbour's Wife", 'voice': 'en-US-AriaNeural', 'rate': '-8%', 'pitch': '-14Hz', 'fx': None},
}
LOOSE_NAME = re.compile(r'^[^<\w]*<b>([^<:(]+?)\s*(?:\([^)]*\))?:</b>')
EMOJI = re.compile('[\U0001F000-\U0001FFFF\u2190-\u2BFF\u2600-\u27BF\uFE0F\u200D]')


def load_cast():
    cast = {c['char']: dict(c) for c in json.load(open(CAST_FILE, encoding='utf-8'))['cast']}
    for k, v in PLACEHOLDERS.items():
        cast[k] = dict(v, char=k, placeholder=True)
    return cast


def inventory():
    r = subprocess.run(['node', os.path.join(HERE, 'extract_lines.cjs')], capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0:
        raise SystemExit('extract_lines failed: ' + r.stderr)
    return json.loads(r.stdout)['lines']


def char_of(line):
    m = LOOSE_NAME.match(line['html'])
    name = m.group(1).strip().upper() if m else 'NARRATOR'
    if name not in NAME_TO_CHAR:
        raise SystemExit('no voice for speaker %r in %r' % (name, line['html']))
    return name, NAME_TO_CHAR[name]


def tts_text(line):
    if line.get('tts'):
        t = line['tts']
    else:
        t = LOOSE_NAME.sub('', line['html'])   # never read the speaker's name out loud
    t = re.sub(r'<[^>]+>', ' ', t)
    t = htmllib.unescape(t).replace('&', ' and ')
    t = EMOJI.sub(' ', t)
    # all-caps words are emphasis for readers; neural voices can spell them out (same idea as build_lines.py)
    t = re.sub(r"\b[A-Z]{2,}(?:'[A-Z]+)?\b", lambda m: m.group(0)[0] + m.group(0)[1:].lower(), t)
    t = re.sub(r'\s+', ' ', t).strip()
    return re.sub(r'\s+([,!?;:]|\.(?!\.))', lambda m: m.group(1), t)   # '<b>10 times</b>.' left a space before the full stop


def norm(s):
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


def manifest_index(cast):
    """normalized text -> manifest entry, only for recordings made with the character's picked voice."""
    idx = {}
    for e in json.load(open(MANIFEST, encoding='utf-8'))['entries']:
        v = e.get('voice') or {}
        if not e.get('file') or not v:
            continue
        idx.setdefault(norm(e['text']), []).append(e)
    return idx


def same_voice(v, c):
    return (v.get('voice'), v.get('rate'), v.get('pitch'), v.get('fx') or None) == (c['voice'], c['rate'], c['pitch'], c.get('fx') or None)


async def speak(text, voice, rate, pitch, dst):
    """build_lines.py's approach: retry; on refusals ease the pitch 10 Hz toward 0; network trouble backs off longer."""
    import edge_tts
    hz = int(pitch.replace('Hz', ''))
    last = None
    part = dst + '.part'
    for attempt in range(6):
        p = '%+dHz' % hz
        try:
            await edge_tts.Communicate(text, voice, rate=rate, pitch=p).save(part)
            if os.path.getsize(part) < 1000:
                raise edge_tts.exceptions.NoAudioReceived('only %d bytes' % os.path.getsize(part))
            os.replace(part, dst)
            return p
        except edge_tts.exceptions.NoAudioReceived as e:
            last = e
            if attempt % 2 == 1 and hz != 0:
                hz = hz - 10 if hz > 0 else hz + 10
            await asyncio.sleep(1.5)
        except Exception as e:
            last = e
            await asyncio.sleep(5 * (attempt + 1))
        finally:
            if os.path.exists(part):
                os.remove(part)
    raise RuntimeError('no audio after 6 tries (%s %s %s): %r' % (voice, rate, pitch, last))


def encode(src, dst, fx, meta):
    """one pass: optional effect, mono, 24 kHz, 40 kbps, ID3 tags (title, artist, comment with the voice settings)."""
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', src]
    if fx:
        cmd += ['-af', FX[fx]]
    cmd += ['-map_metadata', '-1', '-ac', '1', '-ar', '24000', '-b:a', BITRATE, '-id3v2_version', '3']
    for k, v in meta.items():
        cmd += ['-metadata', '%s=%s' % (k, v)]
    tmp = dst + '.tmp.mp3'
    cmd.append(tmp)
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0:
        if os.path.exists(tmp):
            os.remove(tmp)
        raise RuntimeError('ffmpeg failed for %s: %s' % (dst, r.stderr.strip()[:300]))
    os.replace(tmp, dst)


def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                       capture_output=True, text=True)
    try:
        return round(float(r.stdout.strip()), 2)
    except ValueError:
        return None


def write_maps(log, failed, found):
    """the maps: html form and plain form -> file (the same shape as vo/clips.json), and the generation log."""
    clips, clash = {}, []
    for e in log:
        for k in (e['html'], e['plain']):
            if k in clips and clips[k] != e['file']:
                clash.append(k)
            clips[k] = e['file']
    if clash:
        raise SystemExit('two clips claim the same text: %r' % clash[:5])
    json.dump(clips, open(CLIPS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump({'made_by': 'make_vo2.py', 'cast_file': CAST_FILE, 'lines_found': found, 'clips': log, 'failed': failed},
              open(LOG, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


async def main():
    redo = sys.argv[sys.argv.index('--redo') + 1] if '--redo' in sys.argv else None
    cast = load_cast()
    lines = inventory()
    midx = manifest_index(cast)
    old = {e['file']: e for e in json.load(open(LOG, encoding='utf-8'))['clips']} if os.path.exists(LOG) else {}
    counters, plan = {}, []
    for l in lines:
        name, char = char_of(l)
        counters[char] = counters.get(char, 0) + 1
        fn = '%s_%03d.mp3' % (char.replace('ph_', ''), counters[char])
        plan.append((l, name, char, fn))

    if '--dry' in sys.argv:   # show the plan, make nothing
        for l, name, char, fn in plan:
            c = cast[char]
            m = [e['id'] for e in midx.get(norm(tts_text(l)), []) if same_voice(e['voice'], c)] if not c.get('placeholder') else []
            print(fn, l['key'], name, c['voice'], '|', tts_text(l), '| REUSE ' + m[0] if m else '')
        return
    tmpdir = tempfile.mkdtemp(prefix='vo2_')
    log, made, reused, kept, failed, streak = [], 0, 0, 0, [], 0
    t0 = time.time()
    try:
        for n, (l, name, char, fn) in enumerate(plan, 1):
            c = cast[char]
            text = tts_text(l)
            source = None
            dst = os.path.join(HERE, fn)
            prev = old.get(fn)
            entry = {'file': fn, 'html': l['html'], 'plain': l['plain'], 'key': l['key'], 'name': name, 'char': char,
                     'char_name': c['name'], 'placeholder': bool(c.get('placeholder')), 'tts_text': text,
                     'voice': c['voice'], 'rate': c['rate'], 'pitch': c['pitch'], 'fx': c.get('fx') or None, 'src': l['src']}
            fresh = prev and os.path.exists(dst) and redo != char and all(prev.get(k) == entry[k] for k in ('html', 'tts_text', 'voice', 'rate', 'pitch', 'fx'))
            if fresh:
                entry.update({k: prev[k] for k in ('pitch_used', 'source', 'seconds', 'bytes')})
                log.append(entry)
                kept += 1
                continue
            match = [e for e in midx.get(norm(text), []) if same_voice(e['voice'], c)] if not c.get('placeholder') else []
            meta_base = {'title': l['plain'][:120], 'artist': c['name'], 'album': 'Kinan vs. Worlds vo2'}
            try:
                if match:
                    e = match[0]
                    src = os.path.join(CONCEPT, 'lines', e['file'].replace('/', os.sep))
                    pu = e['voice'].get('pitch_used') or c['pitch']
                    source = 'reused:' + e['id']
                    raw = os.path.join(tmpdir, 'r.mp3')
                    shutil.copyfile(src, raw)
                    fx = None   # the manifest file already carries its effect
                    reused += 1
                else:
                    raw = os.path.join(tmpdir, 'g.mp3')
                    pu = await speak(text, c['voice'], c['rate'], c['pitch'], raw)
                    source = 'generated'
                    fx = c.get('fx')
                    made += 1
                comment = 'voice=%s;rate=%s;pitch=%s;pitch_used=%s;fx=%s;char=%s;key=%s;source=%s' % (
                    c['voice'], c['rate'], c['pitch'], pu, c.get('fx') or 'none', char, l['key'], source)
                encode(raw, dst, fx, dict(meta_base, comment=comment))
                entry.update({'pitch_used': pu, 'source': source, 'seconds': duration(dst), 'bytes': os.path.getsize(dst)})
                log.append(entry)
                streak = 0
                eased = '' if pu == c['pitch'] else ' (pitch eased %s -> %s)' % (c['pitch'], pu)
                print('[%d/%d] %s %s %s %s%s' % (n, len(plan), fn, source, c['voice'], entry['seconds'], eased), flush=True)
            except Exception as ex:
                failed.append({'file': fn, 'html': l['html'], 'error': str(ex)[:300]})
                streak += 1
                print('[%d/%d] FAILED %s: %s' % (n, len(plan), fn, str(ex)[:200]), flush=True)
                if streak >= 4:
                    print('STOPPING: 4 lines in a row failed; the service looks like it is refusing us.', flush=True)
                    break
            if source == 'generated':
                if made % 25 == 0:
                    write_maps(log, failed, len(plan))   # progress survives an interrupted run
                await asyncio.sleep(DELAY)
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    write_maps(log, failed, len(plan))
    print('lines %d: generated %d, reused %d, already made %d, failed %d, %.0f s' % (len(plan), made, reused, kept, len(failed), time.time() - t0))
    if failed:
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
