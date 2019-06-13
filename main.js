const fetch = require('node-fetch');
const Notifier = require('node-notifier');
const os = require('os');
let SoundPath = './defaultBeep.ogg';
if(process.argv[2]){
    SoundPath = process.argv[2];
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
                
                if (cacheTickets.indexOf(ticket) == -1) {
                    cacheTickets.push(ticket);
                    linuxSound();
                    Notifier.notify({
                        title: 'New Devcamp Ticket!',
                        message: `A ticket from ${ticket.full_name} Title: ${ticket.title}`,
                        sound: true
                    });
                }
            });
        })
}, 5000);

function linuxSound() {
    if(os.platform().toLowerCase() == "linux"){
        const { spawn } = require('child_process');
        const audio = spawn('play', [SoundPath]);
    }
}