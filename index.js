var restify = require('restify');
var builder = require('botbuilder');
let JSDOM = require('jsdom').JSDOM;
let jquery = require('jquery');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: "e39c1ffe-c75a-431f-809a-5ed95981b2ef",
    appPassword: "ULogT3UzDyvpJfOt0Z2OQ1F"
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});
bot.on('typing', function (message) {

});

bot.on('deleteUserData', function (message) {

});

String.prototype.contains = function(content){
  return this.indexOf(content) !== -1;
}
bot.dialog('/', function (session) { 
    if(session.message.text.toLowerCase().contains('hello')){
        session.send(`Hey, How are you? What do you want to eat? Use vatra, gurmand or all commands!`);
      } else if(session.message.text.toLowerCase().contains('help')){
        session.send(`Use vatra, gurmand or all commands!`);        
    } else if(session.message.text.toLowerCase().contains('all')){
        Promise.all([JSDOM.fromURL("http://www.restaurantvatra.ro/"), JSDOM.fromURL("http://www.casagurmandului.ro/")]).then(doms => {    
            let vatra = doms[0].window;
            let gurmand = doms[1].window;
        
            let $ = jquery(vatra.document.defaultView);
            let salate = $("table tr:nth-child(4)").text().trim().split("-").map((x) => { return (x.trim() !== "Salate" ? x.trim() : ""); });
            salate.shift();
            
            let feluri = [$("table tr:nth-child(2)").text().trim().split("1")[1].trim().split("-").map((x) => { return x.trim(); }),
                        $("table tr:nth-child(3)").text().trim().split("2")[1].trim().split("-").map((x) => { return x.trim(); })];
            
            let responseVatra = ("\n\nLa Vatra, felul 1 este reprezentat de:\n     > > " + feluri[0].join(',\n     > > ') + "\n\nla felul 2 avem" + (feluri[1].length > 1 ? " de ales intre: " : ": ") + "\n     > > " + feluri[1].join(',\n     > > ') + "\n\niar ca salate dispunem de " + salate.length + " optiuni: \n     > > " + salate.join(',\n     > > ') + "\n\n");
        
            let elements = gurmand.document.getElementsByClassName("menu-list__item");
            let keys = Object.keys(elements);
            let responseGurmand = "\n\nLa Casa Gurmandului, meniul este diversificat si dispunem de urmatoarele posibilitati: \n";
            keys.forEach((key) => {
                let children = elements[key].children;
                let title = children[0].textContent.trim();
                let content = children[1].textContent.trim().split("\n").map(x => x.trim()).filter(x => x.length > 0);
                if(content.length > 0) {
                    responseGurmand += ("  > " + title + ":\n     > > " + content.join(",\n     > > ") + "\n\n");
                }
            });
            session.send(responseVatra + responseGurmand); 
        }).catch(err => console.log("err", err));         
      }else if(session.message.text.toLowerCase().contains('gurmand')){
        Promise.all([JSDOM.fromURL("http://www.casagurmandului.ro/")]).then(doms => {    
            let gurmand = doms[0].window;
        
            let elements = gurmand.document.getElementsByClassName("menu-list__item");
            let keys = Object.keys(elements);
            let responseGurmand = "\n\nLa Casa Gurmandului, meniul este diversificat si dispunem de urmatoarele posibilitati: \n";
            keys.forEach((key) => {
                let children = elements[key].children;
                let title = children[0].textContent.trim();
                let content = children[1].textContent.trim().split("\n").map(x => x.trim()).filter(x => x.length > 0);
                if(content.length > 0) {
                    responseGurmand += ("  > " + title + ":\n     > > " + content.join(",\n     > > ") + "\n\n");
                }
            });
            session.send(responseGurmand); 
        }).catch(err => console.log("err", err));         
      }else if(session.message.text.toLowerCase().contains('vatra')){
        Promise.all([JSDOM.fromURL("http://www.restaurantvatra.ro/")]).then(doms => {    
            let vatra = doms[0].window;
        
            let $ = jquery(vatra.document.defaultView);
            let salate = $("table tr:nth-child(4)").text().trim().split("-").map((x) => { return (x.trim() !== "Salate" ? x.trim() : ""); });
            salate.shift();
            
            let feluri = [$("table tr:nth-child(2)").text().trim().split("1")[1].trim().split("-").map((x) => { return x.trim(); }),
                        $("table tr:nth-child(3)").text().trim().split("2")[1].trim().split("-").map((x) => { return x.trim(); })];
            
            let responseVatra = ("\n\nLa Vatra, felul 1 este reprezentat de:\n     > > " + feluri[0].join(',\n     > > ') + "\n\nla felul 2 avem" + (feluri[1].length > 1 ? " de ales intre: " : ": ") + "\n     > > " + feluri[1].join(',\n     > > ') + "\n\niar ca salate dispunem de " + salate.length + " optiuni: \n     > > " + salate.join(',\n     > > ') + "\n\n");
        
            session.send(responseVatra); 
        }).catch(err => console.log("err", err));         
      } else {
        session.send(`Unrecognized command! Use help for more info!`);
      }
});