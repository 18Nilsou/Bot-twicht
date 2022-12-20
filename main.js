/*
Create table streamer (
    nom VARCHAR,
    listeIdBan VARCHAR
);

Create table bannis (
    nom VARCHAR,
    listePseudo VARCHAR
);


insert into bannis (nom, listePseudo) values ('nilsou18_','nils, malcom, leonie');
insert into streamer (nom ,listeIdBan) values ('nilsou18_','nilsou18_');

insert into streamer (nom ,listeIdBan) values ('willylebigi','willylebigi');
insert into bannis (nom, listePseudo) values ('willylebigi','truc, machin');

*/



const tmi = require('tmi.js');//Twitch
const pg = require('pg');

const baseDonnee = new pg.Client({
    user: 'cohvfcot',
    host: 'mouse.db.elephantsql.com',
    database: 'cohvfcot',
    password: '2D0Qj0QvPdszLOW-Qxf2gUyJENDYXsnJ',
    port: 5432,
});

baseDonnee.connect()
var tab = ['nilsbot']
async function listeStreamer(){
    try {
    let requete1 = "select nom from streamer";
    const result = await baseDonnee.query(requete1);
    let liste = result.rows;
    liste.forEach(ligne => {
        tab.push(ligne['nom']);
    });
    } catch (err) {
        throw err;
    }
}

a = listeStreamer();
console.log(a);
var client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: 'nilsbot',
        password: 'oauth:kh0o5fs3u0v1dapzb0gbc6g29bpw1d'
    },
    channels: tab
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if(tags["message-type"] === "whisper"){
        newUser(tags['username']);
    }
    if(self) return;
	message = message.toLowerCase();
    let info = message.split(' ');
    if (info[0][0]==='!'){
        if ((tags['badges'] !== null) && (tags['badges']['broadcaster'] === '1' || tags['badges']['moderator'] === '1')){
            channel = channel.substring(1,channel.length);
            switch (info[0]) {
                case '!saveplace':
                    savePlaceBan(channel);
                    break;
                case '!addliste':
                    addListe(info[1], channel);
                    break;
                case '!ban':
                    ban(info[1], channel);
                    break;
                default:
                    client.say(channel, "!saveplace => pour ban les utilisateur de la liste")
                    break;
            }
        }
    }
});


async function newUser(user){
    client.join(user);
    let requete1 = "insert into bannis (nom, listePseudo) values ( $1 ,'papi')";
    let requete2 = "insert into streamer (nom ,listeIdBan) values ($1, $2);";
    try {
        const result = await baseDonnee.query(requete1, [user]);
        const result2 = await baseDonnee.query(requete2, [user, user]);
    } catch (err) {
        throw err;
    }
}


async function ban (user, channel){
    client.ban(channel, user, "SavePlace Ban")
        .then((data) => {client.say(channel, data)}).catch((err)=>console.log(err))
    let requete = 'Select listepseudo from bannis where nom = $1';
        try {
            const result = await baseDonnee.query(requete, [channel]);
            let liste = result.rows[0]['listepseudo'];
            liste = liste + ', ' + user;
            requete = "Update bannis set listepseudo = $1 where nom = $2";
            await baseDonnee.query(requete, [liste, channel]);
        } catch (err) {
            throw err;
        }
}

async function addListe(user, channel){
    let requete = 'Select listeIdBan from streamer where nom = $1';
    try {
        const result = await baseDonnee.query(requete, [channel]);
        let liste = result.rows[0]['listeidban'];
        if (!(liste.includes(user))){
            liste = liste + ', ' + user;
            requete = "Update streamer set listeidban = $1 where nom = $2";
            await baseDonnee.query(requete, [liste, channel]).then((data) =>{
            client.say(channel, " ajout valider mise a jour de la liste des bannis ");});
        }else{
            client.say(channel, user + " deja ajouter ");
        }
        savePlaceBan(channel);
    } catch (err) {
        throw err;
    }
}


async function savePlaceBan(chaine){
    const tabBan = await listBan(chaine);
    tabBan.forEach(compte =>{
        client.ban(chaine, compte, "SavePlace Ban")
            .then((data) => {client.say(chaine, data)}).catch((err)=>console.log(err))
    });
}

async function listBan(chaine) {
    let list = [];
    let listeID = await idListeBan(chaine);
    for (const id of listeID) {
        let requete = 'Select listepseudo from bannis where nom = $1';
        try {
            const result = await baseDonnee.query(requete, [id]);
            console.log(result);
            let res = result.rows[0]['listepseudo'];
            res = res.split(', ');
            list = list.concat(res);
        } catch (err) {
            throw err;
        }
    }
    return list;
}

async function idListeBan(chaine){
    let requete = 'Select listeidBan from streamer where nom = $1';
    try {
        const result = await baseDonnee.query(requete, [chaine]);
        console.log(chaine);
        res = result.rows[0]['listeidban'];
        res = res.split(', ');
        return res;
    } catch (err) {
        throw err;
    }
}