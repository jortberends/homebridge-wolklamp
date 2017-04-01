var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-wordclock", "WordClock", WordClock);
};

class WordClock {
	constructor(log, config) {
		this.log = log;
		
		this.name = config.name;
		this.apiroute = config.apiroute;
		
		// Local caching of HSB color space for RGB callback
		this.cache = {};
		this.cache.hue = 0;
		this.cache.saturation = 0;
		this.cache.brightness = 25;
		
		this.service = new Service.Lightbulb(this.name);		
	}

	setPowerState(state, callback) {
	
		this.log("Set state to: "+ state);
		
		var sendState;
		if (state == 0 || state == false) {
			sendState = 2;
		} else {
			sendState = 1;
		}
		
		this.log("sending state: "+sendState)
	
		request.get({
			url: this.apiroute + "?power="+sendState
		}, function (err, response, body) {
			this.log(err);
			this.log(body);
			callback(err);
		}.bind(this));
	}
	
	setBrightness(brightness, callback) {
		this.log("Setting brightness to: "+brightness);
		this.cache.brightness = brightness;
		
		var sendBrightness = (255/100)*brightness;
		
		this.log("Sending brightness: "+sendBrightness);
		
		request.get({
			url: this.apiroute + "?brightness="+sendBrightness
		}, function (err, response, body) {
			this.log(err);
			this.log(body);
			callback(err);
		}.bind(this));
	}
	
	setHue (level, callback) {
		this.log('Caching Hue as %s ...', level);
		this.cache.hue = level;
	this.setRGB(callback);
	}
	
	setSaturation (level, callback) {
		this.log('Caching Saturation as %s ...', level);
		this.cache.saturation = level;
		this.setRGB(callback);
	}
	
	setRGB (callback) {
		var rgb = this.hsvToRgb(this.cache.hue, this.cache.saturation, this.cache.brightness);
		request.get({
			url: this.apiroute + "?r="+rgb.r+"&g="+rgb.g+"&b="+rgb.b
		}, function (err, response, body) {
			this.log(err);
			this.log(body);
			callback(err);
		}.bind(this));
	}
		
	getName(callback) {
		this.log("getName: ", this.name);
		var error = null;
		callback(error, this.name);
	}
	
	getServices() {
		this.log("Setting up services.");
		
		var informationService = new Service.AccessoryInformation();
		
		informationService
			.setCharacteristic(Characteristic.Manufacturer, 'Jort Berends')
			.setCharacteristic(Characteristic.Model, 'WordClock')
			.setCharacteristic(Characteristic.SerialNumber, '1');
		
		this.service
			.getCharacteristic(Characteristic.On)
			.on('set', this.setPowerState.bind(this));
		
		this.service
			.addCharacteristic(new Characteristic.Brightness())
			.on('set', this.setBrightness.bind(this));
		
		this.service
			.addCharacteristic(new Characteristic.Hue())
			.on('set', this.setHue.bind(this));
		
		this.service
			.addCharacteristic(new Characteristic.Saturation())
			.on('set', this.setSaturation.bind(this));
		
		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));
		
		return [informationService, this.service];
	}
	
	/**
	* Converts an HSV color value to RGB. Conversion formula
	* adapted from http://stackoverflow.com/a/17243070/2061684
	* Assumes h in [0..360], and s and l in [0..100] and
	* returns r, g, and b in [0..255].
	*
	* @param   {Number}  h       The hue
	* @param   {Number}  s       The saturation
	* @param   {Number}  l       The lightness
	* @return  {Array}           The RGB representation
	*/
	hsvToRgb(h, s, v) {
		var r, g, b, i, f, p, q, t;
		
		h /= 360;
		s /= 100;
		v /= 100;
		
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break;
			case 5: r = v; g = p; b = q; break;
		}
		var rgb = { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
		return rgb;
	}

}	