"""Record every spoken line that has no recording yet (2026-11-03 audit, Shad: "record them all"), with the cast voices
Shad picked (Desktop/Kinan vs Mom/Map Concept/voices/voice_cast_final.json) and the same ffmpeg effects as the voice
script (glitch / echo / robot / mirror), into <repo>/audio/talk/<hash>.mp3 (32 kbps mono, trailing silence cut to 0.25 s).
Then writes <repo>/audio/talk/clips-all.js: hash -> seconds, MERGED into self.KINAN_TALK_CLIPS, so the game's lineClip()
finds them. They are NOT added to KINAN_TALK_FILES: the offline precache stays under its 30 MB budget, and sw.js keeps
each clip after it first plays (mp3 is network-first, cached on success). Offline before a line was ever heard, the
device voice (Settings) says it.
Skips clips already recorded, so it can be re-run after any rewording (a changed line gets a new hash).
usage: python tools/rec-all-lines.py <lines.json from tools/all-lines-extract.cjs> <repo> [--limit=N]"""
import json, os, re, subprocess, sys, time

lines, repo = json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2]
limit = next((int(a.split('=')[1]) for a in sys.argv[3:] if a.startswith('--limit=')), None)
FX = {
    'robot': r"afftfilt=real='hypot(re\,im)*sin(0)':imag='hypot(re\,im)*cos(0)':win_size=512:overlap=0.75,volume=1.6",
    'glitch': "vibrato=f=11:d=0.5,acrusher=bits=7:mode=log:aa=1:mix=0.35,aecho=0.6:0.5:25:0.3",
    'echo': "aecho=0.8:0.85:90|180:0.35|0.2",
    'mirror': "flanger=delay=1:depth=6:speed=0.3,aecho=0.7:0.7:40:0.4",
}
# speaker -> (voice, rate, pitch, fx). The family and named guests are Shad's picks (voice_cast_final.json); the rest
# (marked *) are new picks for characters that never had a voice, kept apart from the family's voices.
V = {
    'KINAN': ('en-US-AnaNeural', '+4%', '-18Hz', None), 'EVERYONE': ('en-US-AnaNeural', '+4%', '-18Hz', None),
    'MOM': ('en-US-JennyNeural', '-5%', '-14Hz', None),
    'DAD': ('en-US-RogerNeural', '-2%', '-6Hz', None), 'ROBIN': ('en-US-RogerNeural', '-2%', '-6Hz', None),
    'CHENOA': ('en-CA-ClaraNeural', '+4%', '-4Hz', None),
    'SHAD': ('en-US-BrianNeural', '+0%', '-4Hz', None),
    'ANNIE': ('en-IN-NeerjaNeural', '-2%', '-2Hz', None),
    'GLITCHY': ('en-US-JennyNeural', '+10%', '+70Hz', 'glitch'),
    'GRANDPA': ('en-US-ChristopherNeural', '-15%', '-14Hz', None),
    'GRANDMA (EDMONTON)': ('en-US-AvaNeural', '-10%', '-22Hz', None),
    'GRANDMA (ONION LAKE)': ('en-US-MichelleNeural', '-16%', '-30Hz', None),
    'MILO': ('en-US-AnaNeural', '+6%', '-8Hz', None), 'AIDEN': ('en-CA-LiamNeural', '+10%', '+45Hz', None),
    'DRIZZLE': ('en-US-BrianNeural', '-10%', '+0Hz', 'echo'),
    'THE RACCOON KING': ('en-US-RogerNeural', '+6%', '+30Hz', None),
    'ROBO-REX': ('en-US-GuyNeural', '-10%', '-25Hz', 'robot'),
    'THE ROBOT COMMANDER': ('en-US-SteffanNeural', '-6%', '-12Hz', 'robot'),
    'BRICK-REX': ('en-US-ChristopherNeural', '-10%', '-35Hz', None),
    'MIRROR KINAN': ('en-US-AnaNeural', '+4%', '-18Hz', 'mirror'),
    'THE CORE GUARDIAN': ('en-US-ChristopherNeural', '-12%', '-30Hz', 'robot'),   # = the Firewall's pick
    "THE NEIGHBOUR'S WIFE": ('en-US-AriaNeural', '-8%', '-10Hz', None),             # *
    'THE BIG OCTOPUS': ('en-US-GuyNeural', '-18%', '-20Hz', 'echo'),               # *
    'THE GIANT BANANA SLUG': ('en-US-ChristopherNeural', '-25%', '-6Hz', None),    # *
    'THE HUNTER DRONE': ('en-US-SteffanNeural', '+4%', '+10Hz', 'robot'),          # *
    'THE MAGPIE FLOCK': ('en-US-JennyNeural', '+18%', '+45Hz', None),              # *
    'THE BIG GOALIE': ('en-CA-LiamNeural', '-10%', '-20Hz', None),                 # *
    'THE BIG BULL MOOSE': ('en-US-GuyNeural', '-15%', '-30Hz', None),              # *
    'BRONCO': ('en-US-RogerNeural', '-5%', '-20Hz', None),                         # *
    'THE ALPHA T-REX': ('en-US-ChristopherNeural', '-12%', '-38Hz', 'echo'),       # *
}
out = os.path.join(repo, 'audio', 'talk'); os.makedirs(out, exist_ok=True)

def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)

def finish(raw, dst, fx):
    """effect (if any), mono 32 kbps, then cut the trailing silence to 0.25 s"""
    # only the END's silence: reversed, the trailing silence is at the start (a stop_periods trim would cut at the first pause)
    af = (FX[fx] + ',' if fx else '') + 'areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.25'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ac', '1', '-ar', '24000', '-b:a', '32k', dst], check=True)

made, skipped, failed = 0, 0, []
todo = [l for l in lines if not os.path.exists(os.path.join(out, l['hash'] + '.mp3'))]
if limit: todo = todo[:limit]
for i, l in enumerate(todo):
    if l['who'] not in V: skipped += 1; continue
    v, rate, pitch, fx = V[l['who']]
    dst = os.path.join(out, l['hash'] + '.mp3'); raw = dst + '.raw.mp3'
    for attempt in range(3):
        try:
            subprocess.run(['edge-tts', '--voice', v, f'--rate={rate}', f'--pitch={pitch}', '--text', l['spoken'], '--write-media', raw], check=True, capture_output=True, timeout=60)
            if os.path.getsize(raw) < 2000: raise RuntimeError('tiny file')
            finish(raw, dst, fx); os.remove(raw); made += 1
            break
        except Exception as e:
            time.sleep(2 + attempt * 3)
            if attempt == 2: failed.append(f"{l['who']}: {l['spoken'][:60]} ({e})")
    if i % 25 == 0: print(f'{i + 1}/{len(todo)} made {made}', flush=True)
    time.sleep(0.4)

# clips-all.js: every audio/talk clip that is not in clips.js (Dad/Grandpa, precached) -> seconds
pre = set(re.findall(r'"([0-9a-f]{8})":', open(os.path.join(out, 'clips.js'), encoding='utf-8').read()))
want = {l['hash'] for l in lines}
# MERGE with the list already there (a short run must never drop the other lines' entries: 2026-11-03 bug)
old = os.path.join(out, 'clips-all.js')
extra = dict((h, float(v)) for h, v in re.findall(r'"([0-9a-f]{8})": ([0-9.]+)', open(old, encoding='utf-8').read())) if os.path.exists(old) else {}
for f in sorted(os.listdir(out)):
    h = f[:-4]
    if f.endswith('.mp3') and len(h) == 8 and h not in pre and h in want: extra[h] = round(dur(os.path.join(out, f)), 2)
body = ',\n'.join(f'  "{h}": {s}' for h, s in sorted(extra.items()))
js = ("/* Every other recorded line (2026-11-03 audit, Shad: \"record them all\"): the cast voices for every line that had no\n"
      "   recording, made by tools/rec-all-lines.py. hash -> seconds, merged into KINAN_TALK_CLIPS (index.html lineClip finds a\n"
      "   line's clip by speaker + words). Not precached (the offline cache keeps its 30 MB budget): each clip is kept by sw.js\n"
      "   after it first plays. Loaded after audio/talk/clips.js. */\n"
      "self.KINAN_TALK_CLIPS = self.KINAN_TALK_CLIPS || {};\n(function (C) {\n  var A = {\n" + body + "\n  };\n"
      "  for (var h in A) if (!C[h]) C[h] = A[h];\n})(self.KINAN_TALK_CLIPS);\n")
open(os.path.join(out, 'clips-all.js'), 'w', encoding='utf-8', newline='\n').write(js)
print('made', made, '| no voice for speaker', skipped, '| failed', len(failed), '| clips-all entries', len(extra))
for f in failed[:20]: print('  FAILED', f)
