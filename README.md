# homebridge-wolklamp
[Homebridge](https://github.com/nfarina/homebridge) plugin for my personal WolkLamp.

## Install plugin
```
npm install -g jortberends/homebridge-wolklamp
```
## Configure homebridge
Add this to your homebridge configuration:
```
    "accessories": [
	     {
            "accessory": "WolkLamp",
            "name": "Wolk",
            "apiroute": "http://192.168.1.x"
        }
    ]
```