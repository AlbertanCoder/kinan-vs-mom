"""Check audio/vo2: every spoken line has a clip, every clip decodes and is long enough, the right voice
says each line, and the boss clips in audio/voice/ still use Shad's picked voices. Exits 0 only if all pass.

    python check.py [--seed N]

1. Re-reads index.html (extract_lines.cjs): each line's html AND plain form is a key in clips.json.
2. Each clip: exists, ffprobe says mp3 / mono / 24 kHz / 32-48 kbps / longer than 0.5 s, and a full
   ffmpeg decode reports no error. No stray mp3 files.
3. Voices: the speaker key the game computes -> the characters that key can mean (from SPEAKERS in
   index.html) -> that character's voice (voice_cast_final.json or the placeholder table). Compared with
   the voice written into each clip's own ID3 tag and with gen_log.json. All lines are checked; 10 random
   ones are printed in full as the spot check.
4. audio/voice/ boss clips: byte-identical to the manifest recording, made with the picked voice."""
import json
import os
import random
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.dont_write_bytecode = True   # no __pycache__ in the web folder
sys.path.insert(0, HERE)
from make_vo2 import NAME_TO_CHAR, LOOSE_NAME, load_cast, CONCEPT  # noqa: E402

# speaker key (index.html SPEAKERS / speakerOf) -> the characters it can stand for. None = no "<b>NAME:</b>" at
# the start (narration, or a toast that starts with an emoji). BOSS lines (the title call-out) are the narrator.
KEY_CHARS = {
    'k': {'kinan'}, 'm': {'mom'}, 'c': {'chenoa'}, 'd': {'robin'}, 's': {'shad'}, 'n': {'neighbour'},
    'f': {'foreman'}, 'cd': {'conductor'}, 'br': {'barker'}, 'dz': {'drizzle'}, 'b': {'ph_bigkid'},
    'lg': {'ph_lifeguard'}, 'lj': {'ph_lumberjack'}, 'ps': {'ph_static'},
    'mech': {'ph_megamech', 'ph_pumpjack', 'roborex', 'glitchy'},
    None: {'narrator', 'glitchy', 'ph_goalie', 'ph_neighbourwife'},
}
problems = []


def bad(msg):
    problems.append(msg)


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                        'format=duration,bit_rate:format_tags=comment:stream=codec_name,channels,sample_rate',
                        '-of', 'json', path], capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0:
        return None
    j = json.loads(r.stdout)
    s = (j.get('streams') or [{}])[0]
    f = j.get('format') or {}
    return {'codec': s.get('codec_name'), 'channels': s.get('channels'), 'rate': int(s.get('sample_rate') or 0),
            'kbps': round(int(f.get('bit_rate') or 0) / 1000), 'seconds': float(f.get('duration') or 0),
            'comment': (f.get('tags') or {}).get('comment', '')}


def decodes(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8')
    return r.returncode == 0 and not r.stderr.strip()


def tag(comment):
    return dict(kv.split('=', 1) for kv in comment.split(';') if '=' in kv)


def main():
    seed = int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else random.randrange(10 ** 6)
    cast = load_cast()
    clips = json.load(open(os.path.join(HERE, 'clips.json'), encoding='utf-8'))
    log = json.load(open(os.path.join(HERE, 'gen_log.json'), encoding='utf-8'))
    by_file = {e['file']: e for e in log['clips']}
    if log.get('failed'):
        bad('gen_log lists %d failed lines' % len(log['failed']))

    # 1. every line index.html can speak has a clip, under both keys
    r = subprocess.run(['node', os.path.join(HERE, 'extract_lines.cjs')], capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0:
        print('extract_lines failed: ' + r.stderr)
        sys.exit(1)
    lines = json.loads(r.stdout)['lines']
    for l in lines:
        for k in (l['html'], l['plain']):
            if k not in clips:
                bad('no clip for: %r' % k[:90])
    if len(log['clips']) != len(lines):
        bad('gen_log has %d clips but index.html has %d lines' % (len(log['clips']), len(lines)))

    # 2. every clip decodes, is mono 24 kHz 32-48 kbps and longer than 0.5 s; no strays
    files = sorted(set(clips.values()))
    on_disk = sorted(f for f in os.listdir(HERE) if f.endswith('.mp3'))
    for f in sorted(set(on_disk) - set(files)):
        bad('stray mp3 not in clips.json: ' + f)
    info, total = {}, 0
    for f in files:
        p = os.path.join(HERE, f)
        if not os.path.exists(p):
            bad('missing file ' + f)
            continue
        total += os.path.getsize(p)
        i = probe(p)
        if not i:
            bad('ffprobe cannot read ' + f)
            continue
        info[f] = i
        if i['codec'] != 'mp3' or i['channels'] != 1 or i['rate'] != 24000:
            bad('%s is %s / %s ch / %s Hz' % (f, i['codec'], i['channels'], i['rate']))
        if not 32 <= i['kbps'] <= 48:
            bad('%s bitrate %s kbps' % (f, i['kbps']))
        if i['seconds'] <= 0.5:
            bad('%s is only %.2f s' % (f, i['seconds']))
        if not decodes(p):
            bad('%s does not decode cleanly' % f)

    # 3. the right voice on every line (key -> character -> voice; file tag and log agree)
    rows = []
    for l in lines:
        f = clips.get(l['html'])
        if not f or f not in info:
            continue
        m = LOOSE_NAME.match(l['html'])
        name = m.group(1).strip().upper() if m else 'NARRATOR'
        char = NAME_TO_CHAR.get(name)
        allowed = {'narrator'} if name == 'BOSS' else KEY_CHARS.get(l['key'], set())
        if char not in allowed:
            bad('%s: speaker %s (key %r) gave character %s, key allows %s' % (f, name, l['key'], char, sorted(allowed)))
        c = cast[char]
        t = tag(info[f]['comment'])
        want = (c['voice'], c['rate'], c['pitch'], c.get('fx') or 'none')
        got = (t.get('voice'), t.get('rate'), t.get('pitch'), t.get('fx'))
        e = by_file.get(f, {})
        logged = (e.get('voice'), e.get('rate'), e.get('pitch'), e.get('fx') or 'none')
        if got != want or logged != want or t.get('char') != char:
            bad('%s: voice tag %s / log %s, expected %s (%s)' % (f, got, logged, want, char))
        rows.append((f, l['key'], name, char, c['name'], t.get('voice'), t.get('fx'), t.get('pitch_used'), info[f]['seconds'], l['plain']))
    random.seed(seed)
    print('SPOT CHECK (10 random lines, seed %d): file | key | speaker in text | character | voice in clip tag | fx | pitch used | seconds' % seed)
    for row in random.sample(rows, min(10, len(rows))):
        print('  %s | %s | %s | %s (%s) | %s | %s | %s | %.2f s\n      "%s"' % (row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9][:100]))

    # 4. the boss clips the boss agent wired (audio/voice/<id>.mp3) still match the manifest + picked voices
    man = {e['id']: e for e in json.load(open(os.path.join(CONCEPT, 'lines', 'manifest.json'), encoding='utf-8'))['entries']}
    vdir = os.path.join(REPO, 'audio', 'voice')
    boss_ok = 0
    for f in sorted(os.listdir(vdir)):
        if not f.endswith('.mp3'):
            continue
        p, e = os.path.join(vdir, f), man.get(f[:-4])
        if not e:
            bad('audio/voice/%s has no manifest entry' % f)
            continue
        c = cast[e['speaker']]
        v = e['voice']
        same = open(p, 'rb').read() == open(os.path.join(CONCEPT, 'lines', e['file'].replace('/', os.sep)), 'rb').read()
        i = probe(p)
        if not same:
            bad('audio/voice/%s differs from the manifest recording' % f)
        if (v['voice'], v['rate'], v['pitch'], v.get('fx')) != (c['voice'], c['rate'], c['pitch'], c.get('fx')):
            bad('audio/voice/%s was made with %s, pick is %s' % (f, v['voice'], c['voice']))
        if not i or i['seconds'] <= 0.5 or not decodes(p):
            bad('audio/voice/%s does not decode or is too short' % f)
        else:
            boss_ok += 1

    by_char = {}
    for e in log['clips']:
        by_char[e['char']] = by_char.get(e['char'], 0) + 1
    print('lines in index.html: %d · clips: %d · keys in clips.json: %d · total %.2f MB' % (len(lines), len(files), len(clips), total / 1e6))
    print('reused from manifest: %d · generated: %d' % (sum(1 for e in log['clips'] if str(e.get('source', '')).startswith('reused')),
                                                       sum(1 for e in log['clips'] if e.get('source') == 'generated')))
    print('lines by character: ' + ', '.join('%s %d' % kv for kv in sorted(by_char.items(), key=lambda kv: -kv[1])))
    print('shortest clip: %.2f s · longest: %.2f s' % (min(i['seconds'] for i in info.values()), max(i['seconds'] for i in info.values())))
    print('boss clips in audio/voice/ OK: %d' % boss_ok)
    if problems:
        print('FAILED: %d problem(s)' % len(problems))
        for p in problems[:40]:
            print('  - ' + p)
        sys.exit(1)
    print('ALL CHECKS PASSED')


if __name__ == '__main__':
    main()
