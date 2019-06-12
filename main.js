const fetch = require('node-fetch');
const notifier = require('node-notifier');
const os = require('os');

let cacheTickets = new Array();
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
                    notifier.notify({
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
        const audio = spawn('play', ['defaultBeep.ogg']);
    }
}