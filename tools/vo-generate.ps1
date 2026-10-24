# Render real voice-over clips for Kinan vs. Mom from the system voices,
# shaped per character with ffmpeg (pitch / EQ / reverb). Output: vo/*.mp3 + vo/clips.json
Add-Type -AssemblyName System.Speech
$VO = 'C:\Users\SHADHUNTER\Desktop\Kinan vs. Mom\vo'
New-Item -ItemType Directory -Force $VO | Out-Null
$FF = 'ffmpeg'

# character = @{ sapi voice, SAPI rate, pitch multiplier, extra ffmpeg filter }
$CHAR = @{
  kinan  = @{ voice = 'Microsoft Zira Desktop'; rate = 1;  pitch = 1.18; fx = '' }
  mom    = @{ voice = 'Microsoft Zira Desktop'; rate = 0;  pitch = 1.02; fx = '' }
  chenoa = @{ voice = 'Microsoft Zira Desktop'; rate = 1;  pitch = 1.10; fx = '' }
  dad    = @{ voice = 'Microsoft David Desktop'; rate = -1; pitch = 0.80; fx = '' }
  shad   = @{ voice = 'Microsoft David Desktop'; rate = 0;  pitch = 1.07; fx = '' }
  drizzle= @{ voice = 'Microsoft David Desktop'; rate = -2; pitch = 0.72; fx = 'aecho=0.7:0.6:70|140:0.35|0.2' }
  narr   = @{ voice = 'Microsoft David Desktop'; rate = 0;  pitch = 0.95; fx = '' }
}

# (who, html exactly as the game says it)
$LINES = @(
@('kinan', '<b>KINAN:</b> We did it! The storm is gone! BEST. BIRTHDAY. EVER!'),
@('mom', '<b>MOM:</b> Come here, birthday boy — that was INCREDIBLE!'),
@('dad', '<b>DAD:</b> ...Uh, kids? Why does the horizon look... bent?'),
@('chenoa', '<b>CHENOA:</b> Little bro... are those PLANETS?!'),
@('kinan', '<b>KINAN:</b> Whoa... everything feels... different. Like the world just got MORE of itself!'),
@('shad', '<b>SHAD:</b> The graphics just got CLEANER. How is this POSSIBLE?!'),
@('dad', '<b>DAD:</b> Well. I always said we needed more yard.'),
@('kinan', '<b>KINAN:</b> Our house is a PLANET now. The yard is a floating garden up here. THIS. IS. THE BEST. BIRTHDAY. EVER.'),
@('kinan', '<b>KINAN:</b> Everything is ROUND! I can run all the way around the world!'),
@('kinan', '<b>KINAN:</b> I got a POWER STAR! A real one! I am keeping it FOREVER.'),
@('mom', '<b>MOM:</b> Bring it home, sweetie. ...How do we get home?'),
@('dad', '<b>DAD:</b> One planet at a time, guys. One planet at a time.'),
@('shad', '<b>SHAD:</b> Can we PLEASE keep the 3D?'),
@('kinan', '<b>KINAN:</b> My socks are WALKING. My Lego is ANGRY. And why are there COINS everywhere?!'),
@('mom', '<b>MOM (DEBBIE):</b> Good morning, birthday boy! ...Going somewhere?'),
@('mom', '<b>MOM:</b> Nobody leaves this room until it''s clean. CLEAN. YOUR. ROOM.'),
@('mom', '<b>MOM:</b> Fine, it''s clean ENOUGH. Now take your time out there, okay? No rush. NO rush.'),
@('kinan', '<b>KINAN:</b> ...Why does she keep saying no rush?'),
@('dad', '<b>DAD:</b> Big day, bud. Bring-Your-Kid-to-Work Day. Grab your hard hat, we''re heading out to the patch.'),
@('kinan', '<b>KINAN:</b> The oilfield?! Where you go when you''re "out of town"?!'),
@('dad', '<b>DAD:</b> They''re pumping oil up from way, WAY down. Don''t climb on them. I''m serious.'),
@('chenoa', '<b>CHENOA:</b> I supervise a whole restaurant. I can supervise YOU. I''m 6''3"! Watch out for my PLATES... and my GROUND POUND!'),
@('drizzle', '<b>DRIZZLE:</b> RUMBLE. RUMBLE. NOBODY. LIKES. RAIN.'),
@('kinan', '<b>KINAN:</b> Is THAT what this is about?'),
@('kinan', '<b>KINAN:</b> Hey! Go rain on somebody else!'),
@('shad', '<b>SHAD:</b> Ha! It likes you. Let''s call it <b>Drizzle</b>.'),
@('kinan', '<b>KINAN:</b> See? Rain isn''t bad. You made all this green!'),
@('narr', 'Gravity is light in space: Kinan jumps <b>higher</b> and falls <b>slower</b>. Stand on a ⭐ <b>Launch Star</b> (the springs) to blast sky-high!'),
@('narr', 'Grab the floating <b>Star Bits</b>, watch out for space ghosts... and reach the big <b>Power Star</b> at the end!')
)

function To-Speech($html) {
  $t = $html -replace '<[^>]+>', ' '
  $t = $t -replace '&[a-z#0-9]+;', ' '
  $t = [regex]::Replace($t, '[\uD83C-\uD83F][\uDC00-\uDFFF]', ' ')
  $t = [regex]::Replace($t, '[\u2190-\u2BFF\u2600-\u27BF\uFE0F]', ' ')
  $t = [regex]::Replace($t, '^[A-Z0-9 ·()''\.!-]{1,32}:\s*', '')
  return ($t -replace '\s+', ' ').Trim()
}

$map = @{}
$n = 0
foreach ($pair in $LINES) {
  $who = $pair[0]; $html = $pair[1]
  $n++
  $id = '{0}-{1:d2}' -f $who, $n
  $c = $CHAR[$who]
  $wav = Join-Path $VO ($id + '.wav')
  $mp3 = $id + '.mp3'
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice($c.voice)
  $synth.Rate = $c.rate
  $txt = To-Speech $html
  $synth.SetOutputToWaveFile($wav)
  $synth.Speak($txt)
  $synth.Dispose()
  $p = $c.pitch
  $af = "aresample=24000,asetrate=$(24000 * $p),aresample=24000,atempo=$(1 / $p),acompressor=threshold=-20dB:ratio=3:makeup=4,equalizer=f=140:t=q:w=1:g=2"
  if ($c.fx) { $af = $af + ',' + $c.fx }
  & $FF -y -i $wav -af $af -ac 1 -b:a 64k (Join-Path $VO $mp3) 2>$null
  Remove-Item $wav -Force
  $map[$html] = $mp3
}
$json = ($map.GetEnumerator() | ForEach-Object {
  '  ' + (ConvertTo-Json $_.Key) + ': ' + (ConvertTo-Json $_.Value)
}) -join ",`n"
[System.IO.File]::WriteAllText((Join-Path $VO 'clips.json'), ('{' + "`n" + $json + "`n" + '}'), (New-Object System.Text.UTF8Encoding($false)))
Write-Output ('WROTE ' + $n + ' clips + clips.json')