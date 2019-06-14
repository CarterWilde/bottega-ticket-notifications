const fs = require('fs');
const fetch = require('node-fetch');
const Notifier = require('node-notifier');
const Commander = require('commander');
Commander
    .version('1.0.0')
    .usage('[OPTIONS]...')
    .option('-p, --path <path>', 'Sets the path of what audio clip will be used', './defaultBeep.ogg')
    .option('-c, --cache <cacheTime>', 'Set the interval(miliseconds) of the cache clear', 600000)
    .option('-P, --player <playerExe>', 'Sets the player that will play the sound', 'play')
    .option('-C, --comments', 'Enables comment changes to notify user', false)
    .parse(process.argv);
let AudioPlayerCmd = Commander.player;
let SoundPath = Commander.path;
let CacheClearTimer = Commander.cache;
let CommentsNotify = Commander.comments;
fs.writeFileSync('./tickets.cache.json', '[]');
let CacheTickets = JSON.parse(fs.readFileSync('./tickets.cache.json'));
ClearCache();
setInterval(() => {
    fetch("https://ticketapi.bottega.tech/tickets?role=admin")
        .then(response => {
            return response.json();
        })
        .then(data => { return data.tickets })
        .then(tickets => {
            if (tickets.length <= 0) {
                ClearCache();
            }
            for (let i = 0; i < tickets.length; i++) {
                const ticket = tickets[i];
                const CacheTicket = CacheTickets[i]
                //Cleaning up the object
                delete ticket.assigned_users;
                if (!CommentsNotify) { delete ticket.comments; }
                delete ticket.ticket_assignment;
                if (CacheTicket == undefined) {
                    CacheTickets.push(ticket);
                    fs.writeFile('tickets.cache.json', JSON.stringify(CacheTickets), (err) => {
                        if (err) throw err;
                    });
                    SendNotifications(ticket);
                    return;
                }
                ticket.id !== CacheTicket.id && ticket.user_id !== CacheTicket.user_id && ticket.title !== CacheTicket.title && ticket.comments !== CacheTicket.comments
                    ? SendNotifications(ticket) : CacheTickets.push()
            }
        })
}, 500);

function ClearCache() {
    while (CacheTickets.length > 0) {
        CacheTickets.pop();
        fs.writeFile('tickets.cache.json', JSON.stringify(CacheTickets), (err) => {
            if (err) throw err;
        });
    }
}
setInterval(ClearCache, parseInt(CacheClearTimer));

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