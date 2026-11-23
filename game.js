show me the full code for fixing index

In Visual Studio, open index.html, press Ctrl+A, and replace its contents with the code below. This version uses Office Escape for the browser tab, header, and main heading, and connects to your existing styles.css, missions.js, and game.js.

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Office Escape</title>

    <link rel="stylesheet" href="styles.css">

    <script defer src="missions.js"></script>
    <script defer src="game.js"></script>
</head>

<body>
    <header>
        <div class="wrap brand">
            <b class="mark" aria-hidden="true">OE</b>
            <strong>Office Escape</strong>
        </div>
    </header>

    <main class="wrap">
        <div class="intro">
            <p class="eyebrow">A LINUX ESCAPE GAME</p>
            <h1>Office Escape</h1>

            <p>
                Friday, 6:05 p.m. Your intern badge has expired.
                The night technician left a key at each workstation.
                Five doors stand between you and the weekend.
            </p>
        </div>

        <section class="plan" aria-label="Office floor plan">
            <div class="planhead">
                <h2>Office floor plan</h2>
                <b id="count"></b>
            </div>

            <ol id="route"></ol>
        </section>

        <div id="game">
            <section class="brief">
                <p class="eyebrow" id="stage"></p>
                <h2 id="title" tabindex="-1"></h2>
                <p id="story"></p>
            </section>

            <div class="grid">
                <div>
                    <section class="terminal" aria-label="Terminal">
                        <div class="bar">
                            <b>›_ &nbsp; Terminal</b>
                            <small id="cwd"></small>
                        </div>

                        <div id="output"
                             role="log"
                             tabindex="0"
                             aria-label="Terminal output"></div>

                        <form id="form" autocomplete="off">
                            <label for="command" aria-label="Linux command">$</label>

                            <input type="text"
                                   id="command"
                                   placeholder="Type a command…"
                                   autocapitalize="none"
                                   spellcheck="false">

                            <button type="submit">Run ↵</button>
                        </form>
                    </section>

                    <section class="card keypad" aria-label="Door keypad">
                        <form id="pad" autocomplete="off">
                            <label for="door-key">Door keypad</label>
                            <p>Enter the key you found in a file.</p>

                            <div class="keyrow">
                                <input type="text"
                                       id="door-key"
                                       placeholder="Enter door key"
                                       spellcheck="false">

                                <button type="submit">Unlock door →</button>
                            </div>
                        </form>

                        <p id="feedback" role="status"></p>
                    </section>
                </div>

                <aside>
                    <section class="card">
                        <h3>Command guide</h3>
                        <div id="key"></div>

                        <p class="note">
                            A folder holds files. A name ending in / is a folder.
                            Type <code>help</code> to see the guide in the terminal.
                        </p>
                    </section>

                    <section class="card">
                        <h3>Need a clue?</h3>
                        <button type="button" id="hint"></button>
                        <div id="clues" aria-live="polite"></div>
                    </section>
                </aside>
            </div>
        </div>

        <section id="summary" hidden>
            <p class="eyebrow">FIVE DOORS OPEN</p>
            <h2 id="finish" tabindex="-1">You escaped the office.</h2>

            <p>
                The lobby door swings open.
                Your phone buzzes: “See you Monday, intern.”
            </p>

            <details>
                <summary>View your practice breakdown</summary>

                <h3>Command skills</h3>
                <div id="skills"></div>

                <div class="scroll">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Door</th>
                                <th scope="col">Active time</th>
                                <th scope="col">Commands</th>
                                <th scope="col">Mistakes</th>
                                <th scope="col">Hints</th>
                            </tr>
                        </thead>
                        <tbody id="results"></tbody>
                    </table>
                </div>
            </details>

            <button type="button" id="again">Play again</button>
        </section>
    </main>
</body>
</html>

Press Ctrl+S, then refresh your local game page. The browser tab and heading should both read Office Escape. To check that the scripts loaded too, type help in the game’s terminal and press Enter. You should see the commands available for your current room.
is there anything else we should fix? or change? what is your recommendation

I’d keep Office Escape at five doors and make one change before pushing: give beginners command examples they can successfully run in the room they’re in.

Right now, Reception’s guide shows cat note.txt, but that room contains handoff.txt and hours.txt. A first-time player can copy the example exactly, get “File not found,” and have it counted as a mistake. The same issue comes up later with cd records and grep EXIT shift.log.

I’d use real examples that teach the command while leaving the key for the player to discover:
Room	Example to show	What the player learns
Reception	cat hours.txt	Reading a file works immediately. The player can then try the handoff note.
IT office	cd day-shift, then ls	Entering a folder changes what ls shows. The sticky note points them toward night-shift.
Security desk	grep CHECK desk.log	The player sees matching log entries, then tries PASS from the guard’s clue.

I’d also make one small keypad improvement. If someone types a discovered key into the terminal, show “You found a door key! Enter it in the Door keypad below,” and move focus to the keypad. That reinforces the difference between the two inputs without counting a discovery as a mistake.

Then I’d test with one person who has never used Linux. Give them the game without explaining it and watch Reception. Can they list the files, read the note, recognize the key, and open the first door using only what’s on screen? If they can, I’d finish the five-door playthrough and push that version. More rooms or commands can wait.
alright, lets add this fix so it's easier for the user to understand the  linux commands.

For your Visual Studio project, update just game.js. Open
the updated game.js, copy the full code, replace the contents of game.js in your cloned repository, and press Ctrl+S.

The Command guide and help now show examples that work from the player’s current folder. At Reception, cat hours.txt lets a beginner practice reading a real file before trying the handoff note. At the Security desk, grep CHECK desk.log demonstrates how searching works while leaving the player to search for PASS themselves.

If a player enters the correct door key in the terminal, the game now places it in the Door keypad, moves focus there, and explains how to unlock the door. This counts as neither a command nor a mistake.

To test the fix at Reception:

    Refresh your local game page. Type help and confirm it shows cat hours.txt.
    Run cat hours.txt. You should see “Reception closes at six.”
    Run cat handoff.txt, then enter the displayed OWL- key in the terminal. The keypad should fill in and receive focus. The door should still be locked.
    Press Enter. The Copy room should open and the counter should read 1 / 5 opened.

I tested every command example from every reachable directory and verified all five keypad unlocks in the game logic. The updated project, including the JSFiddle version, is also available in
Office-Escape.zip.
game.jsCode


    
  
'use strict';
const $ = id => document.getElementById(id);
const saveKey = 'nightshift.five-doors.v1';
function newRun() {
  return {level:0, records:missions.map(m => ({
    cwd:m.start, flag:m.word+'-'+String(100+crypto.getRandomValues(new Uint32Array(1))[0]%900),
    seconds:0, commands:0, mistakes:0, hints:0, done:false, uses:{}, log:[]
  }))};
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(saveKey));
    if (saved && Number.isInteger(saved.level) && saved.level >= 0 && saved.level <= missions.length &&
      saved.records?.length === missions.length && saved.records.every(r => r && typeof r.flag === 'string' && Array.isArray(r.log) && r.uses)) return saved;
  } catch { /* Storage can be disabled by the browser. */ }
  return newRun();
}
let state = load();
const mission = () => missions[state.level];
const record = () => state.records[state.level];
const unlocked = () => missions.slice(0,state.level+1).flatMap(m => m.commands);
function save() { try { localStorage.setItem(saveKey,JSON.stringify(state)); } catch { /* The current run still works in memory. */ } }
function element(tag, value, className='') {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
}
function pathOf(path) {
  const parts = (path.startsWith('/') ? path : record().cwd+'/'+path).split('/');
  const stack = [];
  for (const part of parts) {
    if (part === '..') stack.pop();
    else if (part && part !== '.') stack.push(part);
  }
  return '/' + stack.join('/');
}
function filesystem() {
  const entries = new Map([['/',null]]);
  for (const [name,contents] of Object.entries(mission().files)) {
    const path = mission().start+'/'+name;
    const parts = path.split('/');
    for (let i=2;i<parts.length;i++) entries.set(parts.slice(0,i).join('/'),null);
    entries.set(path,contents.replace('@FLAG',record().flag));
  }
  return entries;
}
// Examples use real files. Outside their folder, show a path that still works.
function commandGuide() {
  const room = mission();
  const cwd = record().cwd;
  const samples = {
    '/reception': 'hours.txt',
    '/copy': 'queue.txt',
    '/it': 'day-shift/notice.txt',
    '/security': 'shifts.txt',
    '/lobby': 'desk-note.txt'
  };
  function examplePath(relative) {
    const full = room.start + '/' + relative;
    const prefix = cwd === '/' ? '/' : cwd + '/';
    return full.startsWith(prefix) ? full.slice(prefix.length) : full;
  }
  const examples = {
    ls: 'ls',
    cat: 'cat ' + examplePath(samples[room.start])
  };
  if (unlocked().includes('cd')) {
    const practiceFolder = Object.keys(room.files).find(name => name.includes('/'));
    if (cwd !== room.start) {
      examples.cd = cwd === '/' ? 'cd ' + room.start : 'cd ..';
    } else if (room.start === '/it') {
      examples.cd = 'cd day-shift';
    } else {
      examples.cd = practiceFolder ? 'cd ' + practiceFolder.split('/')[0] : 'cd ..';
    }
  }
  if (unlocked().includes('grep')) {
    examples.grep = room.start === '/security'
      ? 'grep CHECK ' + examplePath('desk.log')
      : 'grep LIGHTS ' + examplePath('friday/closing.log');
  }
  const descriptions = {
    ls: 'List the files and folders here.',
    cat: 'Read the named file. Try another filename from ls.',
    cd: 'Change folders, then type ls to see what is inside. Two dots (..) go up one folder.',
    grep: 'Search a file for a word. Only lines containing that exact text appear.'
  };
  return unlocked().map(command => ({command, example: examples[command], description: descriptions[command]}));
}
function line(value,style='') {
  record().log.push([value,style]);
  if (record().log.length>160) record().log.shift();
  $('output').append(element('div',value,'line '+style));
  $('output').scrollTop = $('output').scrollHeight;
}


