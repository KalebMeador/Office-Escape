'use strict';
const $ = id => document.getElementById(id);
const saveKey = 'nightshift.five-doors.v1';

function newRun() {
    return {
        level: 0, records: missions.map(m => ({
            cwd: m.start, flag: m.word + '-' + String(100 + crypto.getRandomValues(new Uint32Array(1))[0] % 900),
            seconds: 0, commands: 0, mistakes: 0, hints: 0, done: false, uses: {}, log: []
        }))
    };
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
const unlocked = () => missions.slice(0, state.level + 1).flatMap(m => m.commands);

function save() {
    try {
        localStorage.setItem(saveKey, JSON.stringify(state));
    } catch { /* The current run still works in memory. */ }
}

function element(tag, value, className = '') {
    const node = document.createElement(tag);
    node.textContent = value;
    node.className = className;
    return node;
}

function pathOf(path) {
    const parts = (path.startsWith('/') ? path : record().cwd + '/' + path).split('/');
    const stack = [];
    for (const part of parts) {
        if (part === '..') stack.pop();
        else if (part && part !== '.') stack.push(part);
    }
    return '/' + stack.join('/');
}

function filesystem() {
    const entries = new Map([['/', null]]);
    for (const [name, contents] of Object.entries(mission().files)) {
        const path = mission().start + '/' + name;
        const parts = path.split('/');
        for (let i = 2; i < parts.length; i++) entries.set(parts.slice(0, i).join('/'), null);
        entries.set(path, contents.replace('@FLAG', record().flag));
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

    return unlocked().map(command => ({
        command,
        example: examples[command],
        description: descriptions[command]
    }));
}

function line(value, style = '') {
    record().log.push([value, style]);
    if (record().log.length > 160) record().log.shift();
    $('output').append(element('div', value, 'line ' + style));
    $('output').scrollTop = $('output').scrollHeight;
}

function fail(message) {
    throw new Error(message);
}

function execute(raw) {
    const [cmd, ...args] = raw.split(/\s+/);
    const r = record();
    const learn = unlocked().includes(cmd);

    r.commands++;
    line(r.cwd + ' $ ' + raw, 'typed');

    if (learn) {
        r.uses[cmd] ||= { ok: 0, tries: 0 };
        r.uses[cmd].tries++;
    }

    try {
        const fs = filesystem();
        const path = pathOf(args[0] || '.');
        const children = [...fs.keys()].filter(p =>
            p !== path && p.startsWith(path === '/' ? '/' : path + '/')
        );

        const usage = () => fail(
            'Try ' + (commandGuide().find(item => item.command === cmd)?.example || cmd) +
            '. Type help for examples.'
        );

        const file = p => {
            if (!fs.has(p)) fail('File not found. Use ls to check the name and its capitalization.');
            if (fs.get(p) === null) fail('That is a folder. Use ls to list its contents.');
            return fs.get(p);
        };

        if (!learn && !['help', 'hint'].includes(cmd)) {
            fail('Command unavailable. Type help to see this mission’s command key.');
        }

        switch (cmd) {
            case 'help':
                if (args.length) usage();
                line(
                    commandGuide().map(item => item.example + ' — ' + item.description).join('\n') +
                    '\nhint — reveal the next clue\nEnter the key in the separate Door keypad.'
                );
                break;

            case 'hint':
                if (args.length) usage();
                reveal();
                break;

            case 'ls':
                if (args.length > 1) usage();
                if (!fs.has(path)) fail('Path not found. Type ls to see nearby names.');
                if (fs.get(path) !== null) {
                    line(path.split('/').pop());
                } else {
                    line(children
                        .filter(p => p.slice(path === '/' ? 1 : path.length + 1).indexOf('/') === -1)
                        .map(p => p.split('/').pop() + (fs.get(p) === null ? '/' : ''))
                        .sort()
                        .join('   ') || '(empty folder)');
                }
                break;

            case 'cat':
                if (args.length !== 1) usage();
                line(file(path));
                break;

            case 'cd':
                if (args.length !== 1) usage();
                if (!fs.has(path) || fs.get(path) !== null) {
                    fail('Folder not found. Type ls and choose a name marked with /.');
                }
                r.cwd = path;
                line('Current folder: ' + path);
                break;

            case 'grep': {
                if (args.length !== 2) usage();
                const matches = file(pathOf(args[1]))
                    .split('\n')
                    .filter(row => row.includes(args[0]));
                line(matches.join('\n') || 'No matching lines. Check the word and capitalization.');
                break;
            }
        }

        if (learn) r.uses[cmd].ok++;
    } catch (error) {
        r.mistakes++;
        line(error.message, 'error');
    }

    updateControls();
    save();
}

function reveal() {
    const r = record();
    if (r.hints < 3) r.hints++;
    line(clue(r.hints - 1), 'success');
    updateControls();
    save();
}

function clue(i) {
    const m = mission();
    return i === 2
        ? 'Walkthrough (one command per line):\n' + m.hints[i] + '\nEnter ' + record().flag + ' in the Door keypad.'
        : m.hints[i];
}

const time = n => Math.floor(n / 60) + 'm ' + (n % 60) + 's';

function updateControls() {
    const r = record();
    $('hint').textContent = [
        'Get a nudge',
        'Get a bigger nudge',
        'Show the answer',
        'All clues revealed'
    ][r.hints];

    $('hint').disabled = r.done || r.hints === 3;
    $('clues').replaceChildren(...Array.from({ length: r.hints }, (_, i) => element('p', clue(i))));

    $('key').replaceChildren(...commandGuide().map(item => {
        const row = element('div', '', 'entry');
        row.append(element('code', item.example), document.createTextNode(' — ' + item.description));
        return row;
    }));

    $('cwd').textContent = r.cwd;
}

function showMission() {
    const m = mission(), r = record();

    drawPlan();
    $('stage').textContent = 'DOOR ' + (state.level + 1) + ' OF ' + missions.length;
    $('title').textContent = m.title;
    $('story').textContent = m.story;

    $('output').replaceChildren(
        element('div', 'Workstation • ' + m.start, 'line success'),
        element('div', 'Type a command and press Enter. Type help for the command key.', 'line'),
        ...r.log.map(([v, s]) => element('div', v, 'line ' + s))
    );

    $('output').scrollTop = $('output').scrollHeight;
    updateControls();
}

function drawPlan() {
    $('count').textContent = state.level + ' / ' + missions.length + ' opened';

    $('route').replaceChildren(...missions.map((m, i) => {
        const status = i < state.level ? 'Open' : i === state.level ? 'Current' : 'Locked';
        const item = element('li', '', i < state.level ? 'done' : i === state.level ? 'active' : '');
        const icon = element('span', '', 'door-icon');

        icon.setAttribute('aria-hidden', 'true');
        if (i === state.level) item.setAttribute('aria-current', 'step');

        item.append(icon, element('b', m.title), element('span', status));
        return item;
    }));
}

function summary() {
    drawPlan();
    $('game').hidden = true;
    $('summary').hidden = false;

    $('results').replaceChildren(...state.records.map((r, i) => {
        const row = element('tr', '');
        row.append(...[missions[i].title, time(r.seconds), r.commands, r.mistakes, r.hints]
            .map(v => element('td', v)));
        return row;
    }));

    const groups = {};
    for (const [c, [, , skill]] of Object.entries(guide)) {
        groups[skill] ||= { ok: 0, tries: 0 };
        for (const r of state.records) {
            groups[skill].ok += r.uses[c]?.ok || 0;
            groups[skill].tries += r.uses[c]?.tries || 0;
        }
    }

    $('skills').replaceChildren(...Object.entries(groups).map(([name, s]) => {
        const box = element('div', '', 'stat');
        box.append(
            element('b', name),
            element('span', s.tries ? s.ok + ' of ' + s.tries + ' commands ran successfully' : 'No commands attempted'),
            element('span', !s.tries ? 'Try this skill next run' : s.ok === s.tries ? 'Clean run' : 'Revisit the command key')
        );
        return box;
    }));

    $('finish').focus();
}

$('form').onsubmit = e => {
    e.preventDefault();
    const raw = $('command').value.trim();
    if (!raw || record().done) return;

    $('command').value = '';

    if (raw.toUpperCase() === record().flag) {
        const message = 'You found a door key! It is in the Door keypad below. Press Enter or choose Unlock door.';
        line(message, 'success');
        $('feedback').textContent = message;
        $('door-key').value = record().flag;
        $('door-key').focus();
        save();
        return;
    }

    execute(raw);
    if (!record().done) $('command').focus();
};

$('hint').onclick = reveal;

$('pad').onsubmit = e => {
    e.preventDefault();
    const input = $('door-key');
    const key = input.value.trim().toUpperCase();
    if (!record() || !key) return;

    if (key !== record().flag) {
        record().mistakes++;
        $('feedback').textContent = 'The door is still locked. Check the letters, dash, and digits in the file.';
        input.select();
        save();
        return;
    }

    const previous = mission().title;
    record().done = true;
    state.level++;
    save();

    input.value = '';
    $('command').value = '';

    if (state.level === missions.length) {
        summary();
    } else {
        showMission();
        $('feedback').textContent = previous + ' door opened. Find the next key here.';
        $('title').focus();
    }
};

$('again').onclick = () => {
    state = newRun();
    save();
    $('feedback').textContent = '';
    $('door-key').value = '';
    $('summary').hidden = true;
    $('game').hidden = false;
    showMission();
    $('command').focus();
};

setInterval(() => {
    if (!document.hidden && record() && !record().done) {
        record().seconds++;
        if (record().seconds % 5 === 0) save();
    }
}, 1000);

window.addEventListener('pagehide', save);

if (state.level === missions.length) summary();
else showMission();

save();