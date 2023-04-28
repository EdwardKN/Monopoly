# Monopol för fan!

# Server
## Krav
* Nodejs

## Instruktioner
1. Ladda ner detta projekt.
2. Gå in i terminal och navigera till detta projekt/server.
3. När du är i den mappen, skriv kommandot `node Application.js` (och tryck på enter) för att starta servern
4. Du kommer att se en address dyka upp i terminalen efter en liten stund. Andra personer som är på **samma** nätverk som du kan skriva in den addressen för att ansluta till ditt monopolspel.
* (PS. Om du vet hur du ska ändra med dina brandväggar för att få andra att ansluta, borde det fungera också; Dock är det helt och hållet på egen risk)

## Config
* För att ändra inställningar i online-versionen så ska du ändra i server/config.json filen. Ändra inte i några andra filer, då detta har en stor risk att förstöra spelet.

### Filstruktur
```
{
    "PORT": Siffra mellan 1 och 65 000,
    "ALLOWED_DOMAINS": Lista med domäner som man kan spela ifrån, om man vill tillåta spel från *https://example.com* så ska man skriva in *example.com*,
    "LOGGING_LEVEL": Antingen "NONE", "STANDARD" eller "VERBOSE" beroende på hur mycket information du vill ha i konsolen,
    "GAME_SETTINGS": {
        "freeParking":      true/false | Ifall fri parkering ska hålla i skattepengar,
        "allFreeparking":   true/false | Ifall fri parkering ska hålla i alla bankpengar,
        "doubleincome":     true/false | Man behöver betala dubbelt så mycket i ränta när man landar på en annan persons ruta och den äger alla av den färggruppen,
        "auctions":         true/false | Man ska kunna auktionera ut rutor om man inte vill köpa den,
        "prisonmoney":      true/false | Man kan betala / få in pengar i fängelse,
        "mortgage":         true/false | Man kan inteckna rutor,
        "even":             true/false | När man bygger byggnader på rutor måste man hålla levlarna på alla byggnader lika (±1),
        "startmoney":           Siffra | Hur mycket pengar man startar med,
        "roundsBeforePurchase": Siffra | Antal varv innan man får köpa rutor
    }
}
```