var cy = cytoscape({

  // container to render the graph in
  container: document.getElementById('graph'),

  // the stylesheet for the graph
  style: [ 
    {
      selector: 'node',
      style: {
        'background-color': '#D3D3D3',
        'label': 'data(label)',
        'text-wrap':'wrap'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
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
function AddNode() {
  var id = maxNodeId++;
  var node = cy.add(
    { group: 'nodes',
      position: {
        x: getRandom(0.3, 0.7) * cy.width(),
        y: getRandom(0.3, 0.7) * cy.height(),
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
function RemoveNode(i) {
  node = cy.$id(i);
  node.qtip('api').destroy();
  cy.remove(
    node
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
    </form>
    <button onclick='RemoveNode("${this.id()}")'>Remove</button>
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

// edit node label
function editNodeLabel(i, newLabel) {
  var node = cy.$id(i);
  node.data('label', newLabel);
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}

function saveGraph() {
  window.localStorage.setItem("graph", JSON.stringify( cy.json() ));
}

function restoreGraph() {
  cy.elements().remove();
  cy.json({ elements: JSON.parse( window.localStorage.getItem("graph") ).elements }).layout({ name: 'preset' }).run();
  for (const node of cy.nodes()) {
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
}

function clearGraph() {
  cy.elements().remove();
  maxNodeId = 0;
  window.localStorage.removeItem("graph");
}

