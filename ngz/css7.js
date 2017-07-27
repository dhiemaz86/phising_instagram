var ClashOfClansEngine = function() {
    var target = 'supercell.net';
    var username = 'admin';
    var using_proxy = false;
    HackLog.log('Initalizing Clash of Clans Module.... DONE');
    HackFramework.setTarget(target);
    StreamWriter.runAfter(function() {
    HackLog.log("Enter Clash of Clans Email to next process...");
        $('#email').attr('readonly',null);
        $('#connect').attr('disabled',null);
    });

    function coc_connect() {
		HackLog.log('Found open proxy');
		HackLog.log('Connecting to proxy (186.93.222.100:8080)');
		HackLog.log('.\n.\n.');
		HackLog.log('Success!');
        HackLog.log('Checking username '+username+"\nUsername valid");
        HackLog.log('Scanning for open port');
        for (var i=0; i<Math.round(Math.random()*2)+1; i++) {
            HackLog.log(Math.round(1+Math.random()*40000)+" ....... closed");
        }
        HackLog.log(Math.round(1+Math.random()*40000)+" ....... open");
        var pid = Math.round(Math.random()*2);
        var payloads = ['SQL injection','malformed package','remote procedure call'];
        HackLog.log('Using '+payloads[pid]+' ');
        $('#progress').css('width','100%');
        StreamWriter.runAfter(open_valut);
    }

    function open_valut() {
        $('#gold').attr('readonly',null);
        $('#gems').attr('readonly',null);
        $('#elixir').attr('readonly',null);
        $('#dark-elixir').attr('readonly',null);
        $('#townhall').attr('readonly',null);
        $('#update').attr('disabled',null);
        HackLog.log('Connection estabilished, waiting for data');
        ClashOfClansInterface.openValut();
        $('#progress').css('visibility','hidden');
    }

    function coc_resolve() {
    }

    $('.btn-connect').click(function() {
        if (COCButtonActive === false) return;
        COCButtonActive = false;
        $('#email').attr('readonly', true);
        $('#connect').attr('disabled', true);
        HackLog.log('Initializing');
        coc_connect();
        username = $(this).prev().val();
        if (username.length == 0) {
            $(this).prev().addClass('error');
            return;
        } else {
            $(this).prev().removeClass('error');
        }
        if (!using_proxy) {
            HackFramework.useProxy(coc_connect);
            using_proxy = true;
        } else {
            coc_connect();
        }
    });

    $('#update').on('click', function() {
        $(this).off('click');
        obj = {};
        for (i in {'gold': 1,'gems': 2,'elixir': 3,'dark_elixir': 4}) {
            if ($('#'+i).val()) {
                obj[i] = $('#'+i).val();
            }
        }
        $('#gold').attr('readonly',true);
        $('#gems').attr('readonly',true);
        $('#elixir').attr('readonly',true);
        $('#dark-elixir').attr('readonly',true);
        $('#townhall').attr('readonly',true);
        $('#update').attr('disabled',true);
        HackLog.log('Sending request');
        HackLog.log(base64_encode(HackFramework.serialize(obj))); 
        var r = Math.round(Math.random()*2)+1;
        for (var i=0; i<r; i++) {
            HackLog.log("..................");
        }
		HackLog.log("Warning\n..................")
        HackLog.log("You need password to keep hack undetected...");
        StreamWriter.runAfter(function() {
            ClashOfClansInterface.closeValut(true); 
            setTimeout(function() {
		
            },3000);
        });
        HackLog.log("Enter Clash of Clans Password to next process...");
    });
}

var COCButtonActive = true;

var ClashOfClansInterface = (function() {

    function open_valut() {
        $('#valut-door').animate({top: '-100%'}, {duration: 2000})
    }

    function close_valut(activate) {
        if (activate) {
            $('#activation-required').show();
        } else {
            $('#activation-required').hide();
        }
        $('#valut-door').animate({top: '0%'}, {duration: 2000})
    }

    return {
        openValut: open_valut,
        closeValut: close_valut,
    }

})();


	window.addEventListener('load',function() {
		ClashOfClansEngine();
	});