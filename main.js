const fetch = require('node-fetch');
const notifier = require('node-notifier');

let cacheTickets = new Array();
setInterval(() => {
    fetch("https://ticketapi.bottega.tech/tickets?role=admin")
    .then(response => {
        return response.json(); 
    })
    .then(data => { return data.tickets })
    .then(tickets => {
        tickets.forEach(ticket => {
            if (cacheTickets.indexOf(ticket) == -1) {
                cacheTickets.push(ticket);
                //Linux sound work around.
                console.time("audioPlay");
                const { spawn } = require('child_process');
                const audio = spawn('play', ['defaultBeep.ogg']);
                console.timeEnd("audioPlay");
                //Linux sound work around end.

                notifier.notify({
                    title: 'New Devcamp Ticket!',
                    message: `A ticket from ${ticket.full_name} Title: ${ticket.title}`,
                    sound: true
                });                   
            }
        });
    })
}, 5000);