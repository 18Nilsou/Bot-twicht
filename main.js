
/*

//script sql

Create table users (
    nom VARCHAR,
    listeIdBan VARCHAR
);

Create table ban (
    id SERIAL,
    listePseudo VARCHAR
);

//jeu de donnee exemple

insert into ban (listePseudo) values ('nils, malcom, léonie');
insert into ban (listePseudo) values ('papa, maman, papi');

insert into users (nom ,listeIdBan) values ('nilsou18_','2');

*/

const tmi = require('tmi.js');//Twitch
const pg = require('pg');


const client = new tmi.Client({ //on init le bot
    options: { debug: true },
    identity: {
        username: 'nilsbot',
        password: 'oauth:kh0o5fs3u0v1dapzb0gbc6g29bpw1d'
    },
    channels:['nilsou18_']  //list des chaine ecouter
});

const baseDonnee = new pg.Client({
    user: 'cohvfcot',
    host: 'mouse.db.elephantsql.com',
    database: 'cohvfcot',
    password: '2D0Qj0QvPdszLOW-Qxf2gUyJENDYXsnJ',
    port: 5432,
});

baseDonnee.connect()

client.connect();

client.on('message', (channel, tags, message, self) => {
    if(self) return;
	message = message.toLowerCase();

    let messageSave = message;
    let i = messageSave.indexOf(' ');

    if (i !== -1) {
        message = messageSave.substring(0, i);
    }

     if ((tags['badges'] !== null) && (tags['badges']['broadcaster'] === '1' || tags['badges']['moderator'] === '1')){
        switch (message) {
            case '!ban':
                let pseudo = messageSave.substring(i,end);
                client.ban(channel, pseudo);
                break;
            case '!saveplace':
                savePlaceBan(channel)
                break;
            default:
                client.say(channel, '!saveplace => pour ban les utilisateur de la liste \n !add $pseudo => pour ajouter un nom a la liste')
                break;
        }
     }
});


async function savePlaceBan(chaine){
    const tabBan = await listeBan(chaine);
    console.log(tabBan);
    tabBan.forEach(compte =>{
        //client.ban(chaine, compte, "savePlace Ban")
        client.say(chaine, compte)
    });
}


function listeBan(chaine){
    let res = "";
    let tab = [];
    let requete = 'Select listeidban from users where nom = $1';
    baseDonnee.query(requete, [chaine]).then((result) => {
        res = result.rows[0]['listeidban'];
        if (res.length > 1){
            return res.split(', ');
        }
        tab.push(res);
        return tab;
    }).catch((err) => console.log(err));
}

savePlaceBan('nilsou18_');
