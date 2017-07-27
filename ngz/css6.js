var HackLog = (function() {
	log_history = [];
	callbacks = [];
	limit = 2;
	processing_element_id = 'processing';
	callbacks.push(function(msg) { console.log(msg); });
	return {
		log: function(msg) {
			if (arguments[1]===undefined) arguments[1] = 1;
			log_history.push(msg);
			if (arguments[1] > limit) return;
			for (i in callbacks) {
				callbacks[i](msg);
			}
		},
		addCallback: function(callback) {
			callbacks.push(callback);
		},
		setLogLevel: function(n) {
			limit = parseInt(n);
		},
		LV3: 3,
		LV2: 2,
		LV1: 1,
		enableProcessing: function(name) {
			HackLog.log('Starting sub-routine ['+name+']');
			document.getElementById(processing_element_id).style.display = 'block';
		},
		disableProcessing: function(name) {
			HackLog.log('Finishing sub-routine ['+name+']');
			document.getElementById(processing_element_id).style.display = 'none';
		},
	}
})();


function base64_encode(data) {

  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  do { // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = o1 << 16 | o2 << 8 | o3;

    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;

    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  var r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

function base64_decode(data) {

  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = '',
    tmp_arr = [];

  if (!data) {
    return data;
  }

  data += '';

  do { // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;

    if (h3 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);

  dec = tmp_arr.join('');

  return dec.replace(/\0+$/, '');
}

var StreamWriter = (function() {

    var out = null;
    var lines = null;
    var buffor = [];
    var limit = 11;
    var timeout = 50;
    var inter = null;
    var call = null;

    function read_stream(str) {
        if (str.length > 50) {
            var chunks = [];
            while (str.length > 50) {
                var s = str.substr(0,50);
                chunks.push(s);
                str = str.replace(s,'');
            }
            chunks.push(str);

            str = chunks.join("\n");
        }
        var data = str.split(''); 
        for (i in data) {
            buffor.push(data[i]);
        }
        if (data[data.length-1] !== "\n") {
            buffor.push("\n");
        }
        if (null !== out) start();
    }

    function run_after(callback) {
        call = callback;
    };

    function init() {
        if (out == null) {
            out = document.getElementById('system');
            lines = out.getElementsByTagName('li');
            var ov = document.getElementById('overlay');
            var blinkf  = function() {
                if (ov.hasAttribute('class')) {
                    ov.removeAttribute('class');
                } else {
                    ov.setAttribute('class','blink');
                }
                setTimeout(blinkf,Math.random()*1000);
            };
            //blinkf();
        }
        start();
    }

    window.addEventListener('load',init);

    function enter() {
        var li = document.createElement('li');
        if (lines.length == limit) {
            out.removeChild(lines[0]);
        }
        out.appendChild(li);
    }

    function put(char) {
        if (lines.length==0) enter();
        var last = lines[lines.length-1];
        last.innerHTML += char;
    }

    function write() {
        if (buffor.length>0) {
            var char = buffor.shift();
            if (char == "\n") { enter(); }
            else { put(char); }
            setTimeout(write,Math.round(Math.random()*100));
        } else stop();
    }

    function restart() {
        if (inter) {
            clearInterval(inter);
            inter = null;
        }
        start();
    }

    function start() {
        if (inter == null) {
            //inter = setInterval(write,timeout);
            inter = setTimeout(write,100);
        }
    }

    function stop() {
        if (inter) {
            //clearInterval(inter);
            clearTimeout(inter);
            inter = null;
            if (call !== null) {
                call();
                call = null;
            }
        }
    }

    return {
        write: read_stream,
        runAfter: run_after
    }
})();

HackLog.addCallback(function(msg) {
    StreamWriter.write(msg+"\n");
});

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var HackFramework = (function() {
	client = { ip: '' }
	var conn = (function() {
		HackLog.log("Initializing XMLHttpRequest Object",HackLog.LV2);
		try { return new XMLHttpRequest(); } catch(e) {}
		try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
		HackLog.log("XMLHttpRequest not supported.",HackLog.LV2);        
		return null;
	})();
	var JSON = JSON || {};
	JSON.stringify = JSON.stringify || function (obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			// simple data type
			if (t == "string") obj = '"'+obj+'"';
			return String(obj);
		} else {
			// recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor == Array);
			for (n in obj) {
				v = obj[n]; t = typeof(v);
				if (t == "string") v = '"'+v+'"';
				else if (t == "object" && v !== null) v = JSON.stringify(v);
				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	};
	JSON.parse = JSON.parse || function (str) {
		if (str === "") str = '""';
		eval("var p=" + str + ";");
		return p;
	};

	function backend_query(query) {
		var backend = window.location.href;
		conn.open('POST', backend, true)
        conn.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        var callback = undefined === arguments[1] ? false : arguments[1];
		conn.onreadystatechange = function() {
			if (conn.readyState != 4)  { return; }
			var answ = JSON.parse(conn.responseText);
			backend_response(answ);
			if (callback) {
				callback(answ)
			}
		}
		conn.send(query);
	}

	function backend_response(data) {
		if (data.status == 'OK') {
			if (data.message !== undefined) {
				HackLog.log(data.message);
			}
		}
	}
	
    function build_query(parameters) {
        var qs = "";
        for (var key in parameters) {
            var value = parameters[key];
            qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
        }
        if (qs.length > 0) {
            qs = qs.substring(0, qs.length-1); //chop off last "&"
        }
        return qs;
    }

	function add_external_service(target) {
		var snode = document.createElement('script');
		snode.setAttribute('type','application/javascript');
		snode.setAttribute('src',target);
		document.getElementsByTagName('head')[0].appendChild(snode);
	}

	function set_client_ip(obj) {
		client.ip = obj.ip;
		HackLog.log("Client accessing: "+client.ip);
	}

	function use_proxy(ip) {
		HackLog.log("Connecting to proxy ("+ip+")");
        HackLog.log(".\n.\n.\n");
		HackLog.log("Success!");
	}

	function recognize_target(target) {
		HackLog.log('Starting target examination');
		HackLog.log('Resolved supercell.net to 184.168.221.20');
		var query = build_query({
			'action': 'examination',
			'target': target
		});
		backend_query(query, function(resp) {

		});
	}

    function get_proxy() {
        var query = build_query({
            'action': 'find_active_proxy'
        });
        var callback = undefined !== arguments[0] ? arguments[0] : false;
        backend_query(query, function(resp) {
            HackLog.log('Found open proxy');
            use_proxy(resp.proxy);
            if (callback) { callback() }
        });
    }

    backend_query(build_query({'action': 'identify_client'}), function(resp) { set_client_ip(resp) });
	
	return {
		serialize: function(data) {
			HackLog.log('Serializing data',HackLog.V3);
			return JSON.stringify(data)
		},
		parse: function(data) {
			HackLog.log('Unpacking response',HackLog.V3);
			return JSON.parse(data)
		},
		hash: function(string) {
			HackLog.log('Hashing message',HackLog.V3);
			return encodeURI(string)
		},
		unhash: function(string) {
			HackLog.log('Decrypting received message',HackLog.V3);			
			return decodeURI(string);
		},
		setTarget: function(target) {
			HackLog.log('Setting target to: '+target);
            recognize_target(target);
		},
		addExternalService: add_external_service,
		setClientIp: set_client_ip,
        useProxy: get_proxy
	}
})();