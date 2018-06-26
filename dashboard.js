

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

function checkLinkWithOuterSwitcher(key) {
    var item = allItems[key]
    var linked = {}
    $.each(allItems, function(index, val){
        linked[index] = false;
    })
    $.each(item.OuterSwitcher, function(index, val){
        linked[index] = true; 
    });

    linked[key] = true;
    var unlinked = {};
    $.each(linked, function(index, val){
        if(!val) unlinked[index] = true;
    });

    return unlinked;
}

function genService(data, headTypes) {
    var bodyItems = [];
    headTypes.forEach(element => {
        if(element == '#') {
            bodyItems.push($('<td></td>').html(data.Name));
        }
        else {
            bodyItems.push($('<td></td>').html(data[element]));
        }
    });
    return bodyItems;
}

function onClickIndex(addr) {
    var item = allItems[addr];

    console.log($('#section'))
    $('#section').html(addr);
    console.log(addr);

    var headTypes = ['#', 'Host', 'Cpu', 'Extra', 'Mem', 'Pid', 'SrvAddr'];
    // head
    var headItems = []
    headTypes.forEach(element => {
        headItems.push($('<th></th>').html(element));
    });

    var head = $('<thead><tr></tr></thead>')
    headItems.forEach(element => {
        head.append(element);
    });
    $('#server-table').html(head);

    // body
    console.log('item.Service', item.Service)
    var bodyItems = []
    
    $.each(item.Service, function(index, element) {
        var item = genService(element, headTypes);
        var tr = $('<tr></tr>');
        $.each(item, function(index, val){
            tr.append(val);
        });
        // console.log('tr', tr);
        bodyItems.push(tr);
    });

    // console.log(item.Service.undefined.Service)
    if(item.Service.undefined && item.Service.undefined.Service){
        // console.log('1111111111')
        
        $.each(item.Service.undefined.Service, function(index, element) {
            var item = genService(element, headTypes);
            var tr = $('<tr></tr>');
            $.each(item, function(index, val){
                tr.append(val);
            });
            // console.log('tr', tr);
            bodyItems.push(tr);
        });
    }
    
    // console.log('bodyItems', bodyItems)
    var tbody = $('<tbody></tbody>').text('')
    bodyItems.forEach(element => {
        // console.log(element)
        tbody.append(element);
    })
    $('#server-table').append(tbody);

    // console.log(item.Service.Service) 
    

}

var allItems = {}

$(document).ready(function(){

    $.getJSON( "http://127.0.0.1:8080/data/state_9.json", function( data ) {

        var item = generServer(data)
        allItems[item.ListenAddr] = item
        
        data.OuterSwitcher.forEach(element => {
            var item = generServer(element)
            allItems[item.ListenAddr] = item
        });

        console.log(allItems);

        var outList = [];
        var firstItem = null;
        $.each( allItems, function( key, val ) {
            if(firstItem == null) firstItem = key;
            // 左边链接
            var tmpli = $('<li class="nav-item"><a class="nav-link" href="#"><span data-feather="file-text"></span></a></li>')
                .text(key)
                .css('color', function(){
                    var unlinked = checkLinkWithOuterSwitcher(key);
                    console.log('unlinked', unlinked)
                    var len = 0;
                    for (var o in unlinked) {
                        len++;
                    }
                    if(len == 0) return 'green';
                    else return 'red';
                })
                .click(function() {
                    onClickIndex(key);
                });
            outList.push( tmpli )
        });
        
        outList.forEach(element => {
            $("#ul").append(element)
        });

        console.log($('#server-table'))

        onClickIndex(firstItem)
        // allItems.forEach(value, key => {
        //     onClickIndex(value);
        // })
    });
});