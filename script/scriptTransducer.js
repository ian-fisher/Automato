nodeBasicColor = '#D3D3D3';
nodeFinalColor = '#90EE90';
edgeBasicColor = '#ccc';

// Projekt nur verwenden wenn der Typ passt — ID bleibt im localStorage erhalten
const _typeMatches = !localStorage.getItem('currentProjectType') || localStorage.getItem('currentProjectType') === 'transducer';

// Projekt-spezifischer Key — jedes Projekt hat seinen eigenen Eintrag im localStorage
const PROJECT_ID = _typeMatches ? localStorage.getItem('currentProjectID') : null;
const GRAPH_KEY = PROJECT_ID ? `transducer_${PROJECT_ID}` : 'transducer';
const INITIAL_NODE_KEY = PROJECT_ID ? `initialNodeId_${PROJECT_ID}` : 'initialNodeId';

var cyTransducer = cytoscape({

  container: document.getElementById('graph'),

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

  layout: { name: 'grid', rows: 1 }

});

var maxNodeId = 0;

restoreGraph();


function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function addNode() {
  var id = maxNodeId++;
  var node = cyTransducer.add(
    { group: 'nodes',
      position: {
        x: getRandom(0.3, 0.7) * cyTransducer.width(),
        y: getRandom(0.3, 0.7) * cyTransducer.height(),
      },
      data: { id: id, label: `n${id}` }
    },
  );
  node.on('free', function(evt){ saveGraph(); });
  addQtip(node);
  saveGraph();
}

function removeNode(i) {
  node = cyTransducer.$id(i);
  node.qtip('api').destroy();
  cyTransducer.remove(node);
  saveGraph();
  if (window.localStorage.getItem(INITIAL_NODE_KEY) == i) {
    window.localStorage.removeItem(INITIAL_NODE_KEY);
  }
}

function removeEdge(i) {
  edge = cyTransducer.$id(i);
  edge.qtip('api').destroy();
  cyTransducer.remove(edge);
  saveGraph();
}

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
    </form>
    <button onclick='removeNode("${this.id()}")'>Remove node</button>
    <button onclick='addEdgeCallback("${this.id()}")'>Add edge</button>
    `
  },
  position: { my: 'top center', at: 'bottom center' },
  style: { classes: 'qtip-bootstrap', tip: { width: 16, height: 8 } }
});
}

function addQtipEdge(edge) {
  edge.qtip({
  content: function(){
    return `<button onclick='removeEdge("${this.id()}")'>Remove edge</button>`
  },
  position: { my: 'top center', at: 'bottom center' },
  style: { classes: 'qtip-bootstrap', tip: { width: 16, height: 8 } }
});
}

function edgeFormSubmit(event) {
  event.preventDefault();
}

function editNodeLabel(i, newLabel) {
  var node = cyTransducer.$id(i);
  node.data('label', newLabel);
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}

// Speichert in localStorage UND (wenn Projekt offen) in der DB
async function saveGraph() {
  const graphJson = cyTransducer.json();
  const graphJsonStr = JSON.stringify(graphJson);
  window.localStorage.setItem(GRAPH_KEY, graphJsonStr);

  if (PROJECT_ID) {
    try {
      await API.saveProject(PROJECT_ID, graphJson);
    } catch(e) {
      console.warn('Could not save to DB:', e);
    }
  }
}

// Wendet ein Cytoscape-JSON-Objekt auf den Graphen an
function applyGraphObject(graphObj) {
  cyTransducer.elements().remove();
  maxNodeId = 0;
  try {
    cyTransducer.json({ elements: graphObj.elements }).layout({ name: 'preset' }).run();
  } catch(e) {
    console.warn('Could not apply graph data:', e);
    return;
  }
  for (const node of cyTransducer.nodes()) {
    if (node.data('isInitial')) node.style('shape', 'round-triangle');
    addQtip(node);
    var nodeId = parseInt(node.data('id'));
    if (nodeId >= maxNodeId) maxNodeId = nodeId + 1;
    node.on('free', function(evt){ saveGraph(); });
  }
  for (const edge of cyTransducer.edges()) {
    addQtipEdge(edge);
  }
}

// Lädt Graph — DB hat Vorrang, localStorage als Fallback
async function restoreGraph() {
  cyTransducer.elements().remove();

  if (PROJECT_ID) {
    try {
      const graphObj = await API.loadProject(PROJECT_ID);
      if (graphObj && graphObj.elements) {
        applyGraphObject(graphObj);
        return;
      }
    } catch(e) {
      console.warn('Could not load from DB, falling back to localStorage:', e);
    }
  }

  // Fallback: localStorage
  const saved = window.localStorage.getItem(GRAPH_KEY);
  if (!saved) return;
  try {
    const graphObj = JSON.parse(saved);
    applyGraphObject(graphObj);
  } catch(e) {
    console.warn('Could not restore from localStorage:', e);
  }
}

function clearGraph() {
  cyTransducer.elements().remove();
  maxNodeId = 0;
  window.localStorage.removeItem(GRAPH_KEY);
  window.localStorage.removeItem(INITIAL_NODE_KEY);
}

function nodeFinalCallback(i) {
  var node = cyTransducer.$id(i);
  var isFinal = node.data('isFinal') || false;
  if (isFinal) {
    node.data('isFinal', false);
    node.style('background-color', nodeBasicColor);
  } else {
    node.data('isFinal', true);
    node.style('background-color', nodeFinalColor);
  }
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}

function nodeInitialCallback(i) {
  var node = cyTransducer.$id(i);
  var isInitial = node.data('isInitial') || false;
  if (isInitial) {
    node.data('isInitial', false);
    node.style('shape', 'ellipse');
    window.localStorage.removeItem(INITIAL_NODE_KEY);
  } else {
    if (window.localStorage.getItem(INITIAL_NODE_KEY) != null) {
      var initialNode = cyTransducer.$id(window.localStorage.getItem(INITIAL_NODE_KEY));
      initialNode.data('isInitial', false);
      initialNode.style('shape', 'ellipse');
      initialNode.qtip('api').destroy();
      addQtip(initialNode);
    }
    node.data('isInitial', true);
    node.style('shape', 'round-triangle');
    window.localStorage.setItem(INITIAL_NODE_KEY, i);
  }
  node.qtip('api').destroy();
  addQtip(node);
  saveGraph();
}

function addEdgeCallback(sourceId) {
  window.currentAddingEdgeSource = sourceId;
}

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

cyTransducer.on('tap', 'node', function(evt){
  var node = evt.target;
  if (window.currentAddingEdgeSource != null) {
    addEdge(window.currentAddingEdgeSource, node.data('id'));
    window.currentAddingEdgeSource = null;
  } else {
    node.qtip('api').show();
  }
});

cyTransducer.on('tap', function (evt) {
  if (evt.target === cyTransducer) window.currentAddingEdgeSource = null;
});

function exportPNG() {
  var png64 = cyTransducer.png({scale: 1, full: true});
  const a = document.createElement('a');
  a.href = png64;
  a.download = 'graph.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}