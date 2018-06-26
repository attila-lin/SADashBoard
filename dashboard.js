function generService(data) {
    var service = {};
    service.Host = data.Host
}

function generServer(data) {
    var item = {};
    item.Name = data.Name;
    item.Mem = data.Mem;
    item.Pid = data.Pid;
    item.Cpu = data.Cpu;
    item.Extra = data.Extra;
    item.ListenAddr = data.ListenAddr;

    item.OuterSwitcher = {}
    data.OuterSwitcher.forEach(element => {
        item.OuterSwitcher[element.ListenAddr] = true;
    });

    item.Service = {}
    data.Service.forEach(element => {
        item.Service[element.Host] = element;
    });

    return item;
}

function checkLinkWithOuterSwitcher(item) {
    items.forEach(element => {

    });
}

var allItems = {}

$(document).ready(function(){
    console.log($("#ul"));

    $.getJSON( "http://127.0.0.1:8080/data/state_9.json", function( data ) {

        var item = generServer(data)
        allItems[item.ListenAddr] = item
        

        data.OuterSwitcher.forEach(element => {
            var item = generServer(element)
            allItems[item.ListenAddr] = item
        });

        console.log(allItems);

        var outList = [];
        $.each( allItems, function( key, val ) {
            outList.push( '<li class="nav-item"><a class="nav-link" href="#"><span data-feather="file-text"></span>' + key + '</a></li>' )
        });

        console.log(outList)
        
        $("#ul").html('<ul class="nav flex-column mb-2">' +  outList.join( "" ) + '</ul>').click( function() {
            console.log('111')
        });
        console.log( $("#ul") )
    });
});