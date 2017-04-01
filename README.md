# homebridge-icy
[Homebridge](https://github.com/nfarina/homebridge) plugin for my personal WordClock.

## Install plugin
```
npm install -g jortberends/homebridge-wordclock
```
## Configure homebridge
Add this to your homebridge configuration:
```
    "accessories": [
	     {
            "accessory": "WordClock",
            "name": "Klok",
            "apiroute": "http://192.168.1.x"
        }
    ]
```