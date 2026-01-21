var cy = cytoscape({

  // container to render the graph in
  container: document.getElementById('graph'),

  // the stylesheet for the graph
  style: [ 
    {
      selector: 'node',
      style: {
        'background-color': '#D3D3D3',
        'label': 'data(label)'
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
AddNode();


function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// add node
function AddNode() {
  var id = maxNodeId++;
  var eles = cy.add(
    { group: 'nodes',
      position: {
        x: getRandom(0.3, 0.7) * cy.width(),
        y: getRandom(0.3, 0.7) * cy.height(),
      },
      data: { 
        id: id,
        label: `Node ${id}`
      }
    },
  );
  addQtip(eles);
}

// remove node
function RemoveNode(i) {
  node = cy.$id(i);
  node.qtip('api').destroy();
  cy.remove(
    node
  );
}

// add qtip to new node
function addQtip(node) {
  node.qtip({
  content: function(){
    return `
    <form>
    <input id="node_${node.data('id')}_label_edit"
    type="text" onchange="editNodeLabel('${node.data('id')}', this.value)"
    value="${node.data('label')}">
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
}