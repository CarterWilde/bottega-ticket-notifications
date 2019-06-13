const fetch = require('node-fetch');
const Notifier = require('node-notifier');
let SoundPath = './defaultBeep.ogg';
if (process.argv[2]) {
    SoundPath = process.argv[2];
}
let AudioPlayerCmd;
if (process.argv[3]) {
    AudioPlayerCmd = process.argv[3]
} else {
    switch (process.platform) {
        case 'darwin':
            AudioPlayerCmd = 'afplay';
            break;
        case 'freebsd':
            AudioPlayerCmd = 'printf';
            break;
        case 'linux':
            AudioPlayerCmd = 'printf'
            break;
        case 'openbsd':
            AudioPlayerCmd = 'printf'
            break;
        case 'sunos':
            AudioPlayerCmd = 'audioplay'
            break;
        case 'win32':
            AudioPlayerCmd = 'start'
            break;
    }
}

let CacheTickets = new Array();
setInterval(() => {
    fetch("https://ticketapi.bottega.tech/tickets?role=admin")
        .then(response => {
            return response.json();
        })
        .then(data => { return data.tickets })
        .then(tickets => {
            tickets.forEach(ticket => {
                //Cleaning up the object
                delete ticket.assigned_users;
                delete ticket.comments;
                delete ticket.ticket_assignment;

                if (CacheTickets.indexOf(ticket) == -1) {
                    CacheTickets.push(ticket);
                    playSound();
                    Notifier.notify({
                        title: 'New Devcamp Ticket!',
                        message: `A ticket from ${ticket.full_name} Title: ${ticket.title}`
                    });
                }
            });
        })
}, 5000);

function playSound() {
    const { spawn } = require('child_process');
    const audio = spawn(AudioPlayerCmd, [SoundPath]);
}