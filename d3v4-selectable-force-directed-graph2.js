function createV4SelectableForceDirectedGraph(svg, result) {
  // if both d3v3 and d3v4 are loaded, we'll assume
  // that d3v4 is called d3v4, otherwise we'll assume
  // that d3v4 is the default (d3)
  if (typeof d3v4 == 'undefined')
      d3v4 = d3;

  var width = +svg.attr("width"),
      height = +svg.attr("height");

  let parentWidth = d3v4.select('svg').node().parentNode.clientWidth;
  let parentHeight = d3v4.select('svg').node().parentNode.clientHeight;

  var svg = d3v4.select('svg')
  .attr('width', parentWidth)
  .attr('height', parentHeight)

  // remove any previous graphs
  svg.selectAll('.g-main').remove();

  var gMain = svg.append('g')
  .classed('g-main', true);

  var rect = gMain.append('rect')
  .attr('width', parentWidth)
  .attr('height', parentHeight)
  .style('fill', 'white')

  var gDraw = gMain.append('g');

  var zoom = d3v4.zoom()
  .on('zoom', zoomed)

  gMain.call(zoom);


  function zoomed() {
      gDraw.attr('transform', d3v4.event.transform);
  }

  var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

  var nodes = [];
  var links = [];

  var nameKey = {}
  var nodeKey = {};
  var linkKey = {};
  var dfs = function(node) {
    if(node.Name.search('outer') == -1) return;

    if(!nodeKey[node.ListenAddr]){
      nodeKey[node.ListenAddr] = true
      nodes.push({
        "id": node.ListenAddr, 
        "Name": node.Name, 
        "Mem": node.Mem,
        "Pid": node.Pid,
        "Cpu": node.Cpu,
        "Status": node.Status
      })
      nameKey[node.Name] = true
    }

    if(node.OuterSwitcher) {
      node.OuterSwitcher.forEach(element => {
        if(element.Name.search('outer') == -1) return;
        if(element.ListenAddr == node.ListenAddr) return;

        if(!linkKey[node.ListenAddr + ',' + element.ListenAddr]){
          linkKey[node.ListenAddr + ',' + element.ListenAddr] = links.length
          links.push({"source": node.ListenAddr, "target": element.ListenAddr})
        }
        else{
          var pos = linkKey[node.ListenAddr + ',' + element.ListenAddr]
          links[pos].linkTooMuch = true
        }
        
        dfs(element)
      });
    }
    if(node.Service) {
      node.Service.forEach(element => {
        if(element.Name.search('outer') == -1) return;
        if(element.ListenAddr == node.ListenAddr) return;

        if(!linkKey[node.ListenAddr + ',' + element.ListenAddr]){
          linkKey[node.ListenAddr + ',' + element.ListenAddr] = links.length
          links.push({"source": node.ListenAddr, "target": element.ListenAddr})
        }
        else{
          var pos = linkKey[node.ListenAddr + ',' + element.ListenAddr]
          links[pos].linkTooMuch = true
        }

        dfs(element)
      });
    }
  }

  dfs(result)

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    for (let index2 = 0; index2 < nodes.length; index2++) {
      const element = nodes[index2];
      if(node.ListenAddr != element.ListenAddr && !linkKey[node.ListenAddr + ',' + element.ListenAddr]){
        links.push({"source": node.ListenAddr, "target": element.ListenAddr, "unLink": true});
      }
    }
  }

  var graph = {
    "nodes": nodes,
    "links": links
  }

  if (! ("links" in graph)) {
      console.log("Graph is missing links");
      return;
  }

  var nodes = {};
  var i;
  for (i = 0; i < graph.nodes.length; i++) {
      nodes[graph.nodes[i].id] = graph.nodes[i];
      graph.nodes[i].weight = 1.01;
  }

  // the brush needs to go before the nodes so that it doesn't
  // get called when the mouse is over a node
  var gBrushHolder = gDraw.append('g');
  var gBrush = null;

  var link = gDraw.append("g")
      .attr("class", "link")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke", function(d) { 
        if(d.unLink) 
          return 'rgb(134, 44, 44)'
        else if(d.linkTooMuch)
          return 'rgb(68, 44, 134)'
        else
          return '#999'
      })
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var getNodeColor = function(d) {
    if(d.Name.search("outer_switcher") != -1){
      return "green"
    }
    else if(d.Name.search("app_switcher") != -1){
      return "yellow"
    }
    else if(d.Name.search("gas") != -1){
      return "blue"
    }
    else if(d.Name.search("master") != -1){
      return "red"
    }
    else if(d.Name.search("gateway") != -1){
      return "AQUA"
    }
    else if(d.Name.search("guild") != -1){
      return "TEAL"
    }
    else if(d.Name.search("httpproxy") != -1){
      return "NAVY"
    }
    else if(d.Name.search("im") != -1){
      return "FUCHSIA"
    }
    else if(d.Name.search("inner_switcher") != -1){
      return "GRAY"
    }
    else if(d.Name.search("login") != -1){
      return "BLACK"
    }
    else if(d.Name.search("map") != -1){
      return "MAROON"
    }
    else if(d.Name.search("playershop") != -1){
      return "OLIVE"
    }
    else if(d.Name.search("ranklist") != -1){
      return "LIME"
    }
    else if(d.Name.search("team") != -1){
      return "PURPLE"
    }
    else if(d.Name.search("database") != -1){
      return "SILVER"
    }
    else{
      console.log("hehe", d.Name)
      return d.id
    }
  }
  var node = gDraw.append("g")
      .attr("class", "node")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { 
        return getNodeColor(d)
          // if ('color' in d)
          //     return d.color;
          // else
          //     return color(d.group); 
      })
      .call(d3v4.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    
  // add titles for mouseover blurbs
  node.append("title")
      .text(function(d) { 
        return JSON.stringify(d);
      });

  var simulation = d3v4.forceSimulation()
      .force("link", d3v4.forceLink()
              .id(function(d) { return d.id; })
              .distance(function(d) { 
                  return 1000;

                  return dist; 
              })
            )
      .force("charge", d3v4.forceManyBody())
      .force("center", d3v4.forceCenter(parentWidth / 2, parentHeight / 2))
      .force("x", d3v4.forceX(parentWidth/2))
      .force("y", d3v4.forceY(parentHeight/2));

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
      // update node and line positions at every step of 
      // the force simulation
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
  }

  var brushMode = false;
  var brushing = false;

  var brush = d3v4.brush()
      .on("start", brushstarted)
      .on("brush", brushed)
      .on("end", brushended);

  function brushstarted() {
      // keep track of whether we're actively brushing so that we
      // don't remove the brush on keyup in the middle of a selection
      brushing = true;

      node.each(function(d) { 
          d.previouslySelected = shiftKey && d.selected; 
      });
  }

  rect.on('click', () => {
      node.each(function(d) {
          d.selected = false;
          d.previouslySelected = false;
      });
      node.classed("selected", false);

      
  });

  function brushed() {
      if (!d3v4.event.sourceEvent) return;
      if (!d3v4.event.selection) return;

      var extent = d3v4.event.selection;

      node.classed("selected", function(d) {
          return d.selected = d.previouslySelected ^
          (extent[0][0] <= d.x && d.x < extent[1][0]
           && extent[0][1] <= d.y && d.y < extent[1][1]);
      });
  }

  function brushended() {
      if (!d3v4.event.sourceEvent) return;
      if (!d3v4.event.selection) return;
      if (!gBrush) return;

      gBrush.call(brush.move, null);

      if (!brushMode) {
          // the shift key has been release before we ended our brushing
          gBrush.remove();
          gBrush = null;
      }

      brushing = false;
  }

  d3v4.select('body').on('keydown', keydown);
  d3v4.select('body').on('keyup', keyup);

  var shiftKey;

  function keydown() {
      shiftKey = d3v4.event.shiftKey;

      if (shiftKey) {
          // if we already have a brush, don't do anything
          if (gBrush)
              return;

          brushMode = true;

          if (!gBrush) {
              gBrush = gBrushHolder.append('g');
              gBrush.call(brush);
          }
      }
  }

  function keyup() {
      shiftKey = false;
      brushMode = false;

      if (!gBrush)
          return;

      if (!brushing) {
          // only remove the brush if we're not actively brushing
          // otherwise it'll be removed when the brushing ends
          gBrush.remove();
          gBrush = null;
      }
  }

  function dragstarted(d) {
    if (!d3v4.event.active) simulation.alphaTarget(0.9).restart();

    console.log('dragstarted ')
    if (!d.selected && !shiftKey) {
        // if this node isn't selected, then we have to unselect every other node
        node.classed("selected", function(p) { return p.selected = p.previouslySelected = false; });
    }

    d3v4.select(this).classed("selected", function(p) { d.previouslySelected = d.selected; 
      // var nodeInfo = JSON.stringify(d);
      // console.log('click', nodeInfo)
      // // 显示信息
      // svg.selectAll('text')
      //   .data(nodeInfo)
      //   .enter()
      //   .append('text')
      //   .attr('x', 20)
      //   .attr('y', 10)
      //   .attr('width', 1000)
      //   .text(function(d) { return d; });

      return d.selected = true; 
    });

   

    node.filter(function(d) { return d.selected; })
    .each(function(d) { //d.fixed |= 2; 
      d.fx = d.x;
      d.fy = d.y;
    })

  }

  function dragged(d) {
    //d.fx = d3v4.event.x;
    //d.fy = d3v4.event.y;
    node.filter(function(d) { return d.selected; })
    .each(function(d) { 
        d.fx += d3v4.event.dx;
        d.fy += d3v4.event.dy;
    })
  }

  function dragended(d) {
    if (!d3v4.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
      node.filter(function(d) { return d.selected; })
      .each(function(d) { //d.fixed &= ~6; 
          d.fx = null;
          d.fy = null;
      })
  }

  var texts = ['Use the scroll wheel to zoom',
               'Hold the shift key to select nodes']

  svg.selectAll('text')
      .data(texts)
      .enter()
      .append('text')
      .attr('x', 1900)
      .attr('y', function(d,i) { return 470 + i * 18; })
      .text(function(d) { return d; });

  return graph;
};