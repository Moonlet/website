
const evilDns = require('evil-dns');
const {scrapper} = require('../utils/scrapper');

// String match
evilDns.add('moonlet.xyz', '212.146.84.81');

scrapper({
    urls: [
        'https://moonlet.xyz',
        'https://moonlet.xyz/404.html',
        'https://moonlet.xyz/favicon.ico',
        
        'https://moonlet.xyz/thank-you/',
        'https://moonlet.xyz/thank-you-update/',
        'https://moonlet.xyz/thank-you-delete/'
    ],
    dest: './website/moonlet.xyz',
    urlFilter: (url) => (url || "").startsWith('https://moonlet.xyz')
});