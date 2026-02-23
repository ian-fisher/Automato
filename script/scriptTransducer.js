nodeBasicColor = '#D3D3D3';
nodeFinalColor = '#90EE90';
edgeBasicColor = '#ccc';


var cyTransducer = cytoscape({

  // container to render the graph in
  container: document.getElementById('graph'),

  // the stylesheet for the graph
  style: [
    {
      selector: 'node',
      style: {
        'background-color': nodeBasicColor,
        'label': 'data(label)',
        'text-wrap':'wrap'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'label': 'data(label)',
        'line-color': edgeBasicColor,
        'target-arrow-color': edgeBasicColor,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    }
  ],

  layout: {
    name: 'grid',
    rows: 1
  }

});

var maxNodeId = 0;

// can use reference to eles later
restoreGraph();


function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// add node
function addNode() {
  var id = maxNodeId++;
  var node = cyTransducer.add(
    { group: 'nodes',
      position: {
        x: getRandom(0.3, 0.7) * cyTransducer.width(),
        y: getRandom(0.3, 0.7) * cyTransducer.height(),
      },
      data: {
        id: id,
        label: `n${id}`
      }
    },
  );
  node.on('free',
    function(evt){
      saveGraph();
    });
  addQtip(node);
  saveGraph();
}

// remove node
function removeNode(i) {
  node = cyTransducer.$id(i);
  node.qtip('api').destroy();
  cyTransducer.remove(
    node
  );
  saveGraph();
  if (window.localStorage.getItem("initialNodeId") == i) {
    window.localStorage.removeItem("initialNodeId");
  }
}

// remove edge
function removeEdge(i) {
  edge = cyTransducer.$id(i);
  edge.qtip('api').destroy();
  cyTransducer.remove(
    edge
  );
  saveGraph();
}

// add qtip to new node
function addQtip(node) {
  node.qtip({
  content: function(){
    return `
    <form onkeydown="return event.key != 'Enter';">
    <input id="node_${node.data('id')}_label_edit"
    type="text" onchange="editNodeLabel('${node.data('id')}', this.value)"
    value="${node.data('label')}" maxlength="5">
    <br>
    <label for="is_initial_${node.data('id')}">Is Initial:</label>
    <input type="checkbox" id="is_initial_${node.data('id')}"
    ${node.data('isInitial') ? 'checked' : ''}
    onchange="nodeInitialCallback('${node.data('id')}')">
    <br>
    </form>
    <button onclick='removeNode("${this.id()}")'>Remove node</button>
    <button onclick='addEdgeCallback("${this.id()}")'>Add edge</button>
    `
  },
  position: {
    my: 'top center',
    at: 'bottom center'
  },
  style: {
    classes: 'qtip-bootstrap',
    tip: {
      width: 16,
      height: 8
    }
  }
});
}

// add qtip to edge
function addQtipEdge(edge) {
  edge.qtip({
  content: function(){
    return `
    <button onclick='removeEdge("${this.id()}")'>Remove edge</button>
    `
  },
  position: {
    my: 'top center',
    at: 'bottom center'
  },
  style: {
    classes: 'qtip-bootstrap',
    tip: {
      width: 16,
      height: 8
    }
  }
});
}

function edgeFormSubmit(event) {
  event.preventDefault();
  console.log(event);
}

// edit node label
function editNodeLabel(i, newLabel) {
  var node = cyTransducer.$id(i);
  node.data('label', newLabel);
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}

// save graph to local storage
function saveGraph() {
  window.localStorage.setItem("transducer", JSON.stringify( cyTransducer.json() ));
}

// restore graph from local storage
function restoreGraph() {
  cyTransducer.elements().remove();
  console.log(window.localStorage.getItem("transducer"))
  cyTransducer.json({ elements: JSON.parse( window.localStorage.getItem("transducer") ).elements }).layout({ name: 'preset' }).run();
  for (const node of cyTransducer.nodes()) {
    if (node.data('isInitial')) {
      node.style('shape', 'round-triangle');
    }
    addQtip(node);
    var nodeId = parseInt(node.data('id'));
    if (nodeId >= maxNodeId) {
      maxNodeId = nodeId + 1;
    }
    node.on('free',
    function(evt){
      saveGraph();
    });
  }
  for (const edge of cyTransducer.edges()) {
    addQtipEdge(edge);
  }
}


// remove all nodes and edges
function clearGraph() {
  cyTransducer.elements().remove();
  maxNodeId = 0;
  window.localStorage.removeItem("graph");
  window.localStorage.removeItem("initialNodeId");
}

// on clicking "is final" checkbox
function nodeFinalCallback(i) {
  var node = cyTransducer.$id(i);
  var isFinal = node.data('isFinal') || false;
  if (isFinal) {
    node.data('isFinal', false);
    node.style('background-color', nodeBasicColor);
  }
  else {
    node.data('isFinal', true);
    node.style('background-color', nodeFinalColor);
  }
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}

// on clicking "is initial" checkbox
function nodeInitialCallback(i) {
  var node = cyTransducer.$id(i);
  var isInitial = node.data('isInitial') || false;
  if (isInitial) {
    node.data('isInitial', false);
    node.style('shape', 'ellipse');
    window.localStorage.removeItem("initialNodeId");
  }
  else {
    if (window.localStorage.getItem("initialNodeId") != null) {
      console.log(window.localStorage.getItem("initialNodeId"))
      var initialNode = cyTransducer.$id(window.localStorage.getItem("initialNodeId"));
      initialNode.data('isInitial', false);
      initialNode.style('shape', 'ellipse');
      initialNode.qtip('api').destroy();
      addQtip(initialNode);
    }
    node.data('isInitial', true);
    node.style('shape', 'round-triangle');
    window.localStorage.setItem("initialNodeId", i);
  }
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}


// on clicking "add edge" button
function addEdgeCallback(sourceId) {
  window.currentAddingEdgeSource = sourceId;
}

// add edge between two nodes
function addEdge(sourceId, targetId) {
  cyTransducer.add(
    { group: 'edges',
      data: {
        id: `e${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
      }
    },
  );
  var edge = cyTransducer.$id(`e${sourceId}-${targetId}`);
  addQtipEdge(edge);
  saveGraph();
}

// callback: tap on node
// if currently adding edge, add edge
// else, show qtip
cyTransducer.on('tap', 'node', function(evt){
  var node = evt.target;
  if (window.currentAddingEdgeSource != null) {
    addEdge(window.currentAddingEdgeSource, node.data('id'));
    window.currentAddingEdgeSource = null;
  } else {
    node.qtip('api').show();
  }
});

// clicking on background cancels edge adding
cyTransducer.on('tap', function (evt) {
  if (evt.target === cyTransducer) {
    window.currentAddingEdgeSource = null;
  }
});

// export graph as png
function exportPNG() {
  var png64 = cyTransducer.png({scale: 1, full: true});
  const a = document.createElement('a');
  a.href = png64;
  a.download = 'graph.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}