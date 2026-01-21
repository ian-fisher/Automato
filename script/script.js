var cy = cytoscape({

  // container to render the graph in
  container: document.getElementById('graph'),

  // the stylesheet for the graph
  style: [ 
    {
      selector: 'node',
      style: {
        'background-color': '#D3D3D3',
        'label': 'data(id)'
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

// can use reference to eles later
AddNode();


function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// add node
function AddNode() {
  var eles = cy.add(
    { group: 'nodes',
      position: {
        x: getRandom(0.3, 0.7) * cy.width(),
        y: getRandom(0.3, 0.7) * cy.height(),
      },
      data: { id: 'n' + cy.nodes().length
      }
    },
  );
  addQtip(eles);
}


// remove node
function RemoveNode(i) {
  var eles = cy.remove(
    cy.nodes()[i]
  );
}

// remove last added node
function RemoveLastNode() {
  RemoveNode(cy.nodes().length - 1);
}

function addQtip(node) {
  node.qtip({
  content: function(){
    return `<b>Node ${this.id()}</b><br>
    <button onclick='RemoveNode("${this.id().substring(1)}")'>Remove</button>
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


// call on core
cy.qtip({
  content: 'qtip on the core background',
  position: {
    my: 'top center',
    at: 'bottom center'
  },
  show: {
    cyBgOnly: true
  },
  style: {
    classes: 'qtip-bootstrap',
    tip: {
      width: 16,
      height: 8
    }
  }
});