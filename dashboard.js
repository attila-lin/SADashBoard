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

$(document).ready(function(){
    console.log($("#ul"));

    $.getJSON( "http://127.0.0.1:8080/data/state_9.json", function( data ) {
        var items = {};
        // console.log(data)

        var item = generServer(data)
        items[item.ListenAddr] = item
        

        data.OuterSwitcher.forEach(element => {
            var item = generServer(element)
            items[item.ListenAddr] = item
        });

        console.log(items);

        var outList = [];
        $.each( items, function( key, val ) {
            outList.push( '<li class="nav-item"><a class="nav-link" href="#"><span data-feather="file-text"></span>' + key + '</a></li>' )
        });

        // $.each( data, function( key, val ) {
        //   items.push( "<li id='" + key + "'>" + val + "</li>" );
        // });
        console.log(outList)
        
        $("#ul").html('<ul class="nav flex-column mb-2">' +  outList.join( "" ) + '</ul>');
        console.log( $("#ul") )
    });
});