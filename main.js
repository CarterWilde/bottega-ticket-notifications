const fetch = require('node-fetch');
const Notifier = require('node-notifier');
let SoundPath = './defaultBeep.ogg';
if (process.argv[2]) {
    SoundPath = process.argv[2];
}
let CacheClearTimer = 600000;
if(process.argv[4]){
    CacheClearTimer = process.argv[4]
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
            if(tickets.length <= 0){
                ClearCache();
            }
            const fakeTickets = JSON.parse(fs.readFileSync('./fakeTickets.json'));
            for (let i = 0; i < tickets.length; i++) {
                const ticket = tickets[i];
                const CacheTicket = CacheTickets[i]
                //Cleaning up the object
                delete ticket.assigned_users;
                delete ticket.comments;
                delete ticket.ticket_assignment;
                if (CacheTicket == undefined) {
                    CacheTickets.push(ticket);
                    SendNotifications(ticket);
                    return;
                }
                ticket.id !== CacheTicket.id && ticket.user_id !== CacheTicket.user_id && ticket.title !== CacheTicket.title
                    ? SendNotifications(ticket) : CacheTickets.push()
            }
        })
}, 500);

function ClearCache() {
    while(CacheTickets.length > 0){
        CacheTickets.pop();
    }
}
setInterval(ClearCache, 10000);

function SendNotifications(ticket) {
    playSound();
    Notifier.notify({
        title: 'New Devcamp Ticket!',
        message: `From: ${ticket.full_name}\n\rEmail: ${ticket.user_email}\n\rTitle: ${ticket.title}\n\rContent: ${ticket.content}`,
        sound: true
    });
}

function playSound() {
    const { spawn } = require('child_process');
    const audio = spawn(AudioPlayerCmd, [SoundPath]);
}