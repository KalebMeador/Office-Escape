// Each terminal represents the files at one workstation.
// @FLAG is replaced with this door's key when the file is read.
const guide = {
    ls: ['ls', 'List files and folders here.', 'Listing files'],
    cat: ['cat note.txt', 'Read a file. Replace note.txt with a listed filename.', 'Reading files'],
    cd: ['cd records', 'Enter a folder by name. Use cd .. to go up one folder.', 'Navigation'],
    grep: ['grep EXIT shift.log', 'Show lines containing a word. Match uppercase and lowercase exactly.', 'Searching text']
};
const missions = [
    {
        title: 'Reception', start: '/reception', commands: ['ls', 'cat'], word: 'OWL',
        story: 'The receptionist left a handoff note on this workstation. Type ls and press Enter to list the files. Then type cat, a space, and the filename to read the note.',
        files: { 'handoff.txt': 'Friday handoff: the key to the first door is @FLAG. See you Monday!', 'hours.txt': 'Reception closes at six.' },
        hints: ['Which filename sounds like a message for the next person?', 'Type ls. Look for handoff.txt.', 'cat /reception/handoff.txt']
    },
    {
        title: 'Copy room', start: '/copy', commands: [], word: 'INK',
        story: 'The printer jammed just as the technician printed your second key. Read the print queue to find out which file holds the spare copy.',
        files: { 'queue.txt': 'Job 14 jammed. A spare copy was saved as carbon.txt.', 'carbon.txt': 'Duplicate door slip: @FLAG', 'toner.txt': 'Cyan cartridge is empty.' },
        hints: ['Use ls to see what the printer saved.', 'Read queue.txt with cat. It names the spare copy.', 'cat /copy/queue.txt\ncat /copy/carbon.txt']
    },
    {
        title: 'IT office', start: '/it', commands: ['cd'], word: 'BYTE',
        story: 'A sticky note reads, “Today’s key is in the night-shift folder.” Type ls to spot the folder, then use cd to step inside.',
        files: { 'night-shift/badge.txt': 'After-hours badge desk. Your door key is @FLAG.', 'day-shift/notice.txt': 'Day passes expire at 18:00.' },
        hints: ['A folder is marked with /. Leave that slash off when typing its name if you like.', 'Type cd night-shift, then ls. Use cat to read the badge file.', 'cd /it/night-shift\nls\ncat badge.txt']
    },
    {
        title: 'Security desk', start: '/security', commands: ['grep'], word: 'LAMP',
        story: 'The guard wrote, “I marked your key with PASS in the desk log.” List the files, then use grep to show just the line containing PASS.',
        files: { 'desk.log': '17:45 CHECK lights\n17:49 CALL reception\n18:00 PASS @FLAG\n18:04 CHECK lobby', 'shifts.txt': 'Night guard: 18:00–06:00' },
        hints: ['Look for a filename ending in .log.', 'Use grep followed by the word PASS and the log filename.', 'grep PASS /security/desk.log']
    },
    {
        title: 'Lobby exit', start: '/lobby', commands: [], word: 'DUSK',
        story: 'One door left. The concierge filed tonight’s release slip in a folder. Read the desk note to learn where to look and which word marks the exit key.',
        files: { 'desk-note.txt': 'Go to the friday folder. Search closing.log for OUTSIDE.', 'friday/closing.log': '17:55 LIGHTS dimmed\n18:00 OUTSIDE @FLAG\n18:05 CLOCK stopped', 'thursday/closing.log': 'Yesterday’s slip was collected.' },
        hints: ['Start with ls and read the desk note.', 'Enter the friday folder, then search closing.log for OUTSIDE.', 'cat /lobby/desk-note.txt\ncd /lobby/friday\ngrep OUTSIDE closing.log']
    }
];


