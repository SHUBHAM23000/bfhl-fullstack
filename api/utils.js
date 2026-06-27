const validateNodeFormat = (entry) => {
  if (typeof entry !== 'string') return false;
  const trimmed = entry.trim();
  const pattern = /^[A-Z]->[A-Z]$/;
  return pattern.test(trimmed);
};

const normalizeEntry = (entry) => {
  return typeof entry === 'string' ? entry.trim() : String(entry);
};

const findRoot = (nodes, edges) => {
  const childNodes = new Set();
  edges.forEach(([parent, child]) => {
    childNodes.add(child);
  });
  
  const possibleRoots = nodes.filter(node => !childNodes.has(node));
  
  if (possibleRoots.length > 0) {
    return possibleRoots.sort()[0];
  }
  
  return Array.from(nodes).sort()[0];
};

const hasCycleInGroup = (root, edges) => {
  const adj = {};
  
  edges.forEach(([parent, child]) => {
    if (!adj[parent]) adj[parent] = [];
    adj[parent].push(child);
  });
  
  const visited = new Set();
  const inStack = new Set();
  
  const detectCycle = (node) => {
    visited.add(node);
    inStack.add(node);
    
    const neighbors = adj[node] || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        if (detectCycle(next)) return true;
      } else if (inStack.has(next)) {
        return true;
      }
    }
    
    inStack.delete(node);
    return false;
  };
  
  return detectCycle(root);
};

const buildTree = (root, edges) => {
  const adj = {};
  
  edges.forEach(([parent, child]) => {
    if (!adj[parent]) adj[parent] = [];
    adj[parent].push(child);
  });
  
  const buildSubtree = (node, visited = new Set()) => {
    if (visited.has(node)) return null;
    
    visited.add(node);
    const children = adj[node] || [];
    const subtree = {};
    
    for (const child of children) {
      const childTree = buildSubtree(child, new Set(visited));
      if (childTree === null) return null;
      subtree[child] = childTree;
    }
    
    return subtree;
  };
  
  return buildSubtree(root);
};

const calculateDepth = (root, edges) => {
  const adj = {};
  
  edges.forEach(([parent, child]) => {
    if (!adj[parent]) adj[parent] = [];
    adj[parent].push(child);
  });
  
  const getDepth = (node) => {
    const children = adj[node] || [];
    if (children.length === 0) return 1;
    return 1 + Math.max(...children.map(getDepth));
  };
  
  return getDepth(root);
};

const processBFHL = (data) => {
  const result = {
    user_id: "Shubham_31052005",
    email_id: "shubham0891.be23@chitkara.edu.in",
    college_roll_number: "2310990891",
    hierarchies: [],
    invalid_entries: [],
    duplicate_edges: [],
    summary: {
      total_trees: 0,
      total_cycles: 0,
      largest_tree_root: ""
    }
  };

  if (!Array.isArray(data)) {
    return result;
  }

  const validEdges = [];
  const seen = new Set();
  
  for (const entry of data) {
    const normalized = normalizeEntry(entry);
    
    if (!validateNodeFormat(normalized)) {
      result.invalid_entries.push(normalized);
      continue;
    }
    
    const [parent, child] = normalized.split('->');
    
    if (parent === child) {
      result.invalid_entries.push(normalized);
      continue;
    }
    
    const edgeStr = `${parent}->${child}`;
    
    if (seen.has(edgeStr)) {
      result.duplicate_edges.push(normalized);
    } else {
      seen.add(edgeStr);
      validEdges.push([parent, child]);
    }
  }

  const components = new Map();
  const nodeToComp = new Map();
  
  for (const [p, c] of validEdges) {
    const pComp = nodeToComp.get(p);
    const cComp = nodeToComp.get(c);
    
    let compId;
    if (pComp && cComp) {
      if (pComp !== cComp) {
        const minComp = Math.min(pComp, cComp);
        const maxComp = Math.max(pComp, cComp);
        
        for (const [n, cid] of nodeToComp) {
          if (cid === maxComp) nodeToComp.set(n, minComp);
        }
        compId = minComp;
      } else {
        compId = pComp;
      }
    } else if (pComp) {
      nodeToComp.set(c, pComp);
      compId = pComp;
    } else if (cComp) {
      nodeToComp.set(p, cComp);
      compId = cComp;
    } else {
      compId = Math.max(...Array.from(nodeToComp.values()), 0) + 1;
      nodeToComp.set(p, compId);
      nodeToComp.set(c, compId);
    }
    
    if (!components.has(compId)) {
      components.set(compId, []);
    }
    components.get(compId).push([p, c]);
  }

  const trees = [];
  
  for (const [_, edges] of components) {
    const nodeSet = new Set();
    edges.forEach(([p, c]) => {
      nodeSet.add(p);
      nodeSet.add(c);
    });
    
    const rootNode = findRoot(nodeSet, edges);
    const hasCycle = hasCycleInGroup(rootNode, edges);
    
    const hier = { root: rootNode };
    
    if (hasCycle) {
      hier.tree = {};
      hier.has_cycle = true;
      result.summary.total_cycles++;
    } else {
      const tree = buildTree(rootNode, edges);
      hier.tree = tree !== null ? { [rootNode]: tree } : {};
      const d = calculateDepth(rootNode, edges);
      hier.depth = d;
      result.summary.total_trees++;
      trees.push({ root: rootNode, depth: d });
    }
    
    result.hierarchies.push(hier);
  }

  if (trees.length > 0) {
    trees.sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root.localeCompare(b.root);
    });
    result.summary.largest_tree_root = trees[0].root;
  }

  return result;
};

module.exports = {
  validateNodeFormat,
  normalizeEntry,
  findRoot,
  hasCycleInGroup,
  buildTree,
  calculateDepth,
  processBFHL
};
