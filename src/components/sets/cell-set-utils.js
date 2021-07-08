/* eslint-disable no-underscore-dangle */
import uuidv4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import range from 'lodash/range';
import { featureCollection as turfFeatureCollection, point as turfPoint } from '@turf/helpers';
import centroid from '@turf/centroid';
import concaveman from 'concaveman';
import {
  HIERARCHICAL_SCHEMAS,
} from './constants';
import { DEFAULT_COLOR, PALETTE } from '../utils';
import { pathToKey } from './utils';

/**
 * Alias for the uuidv4 function to make code more readable.
 * @returns {string} UUID.
 */
function generateKey() {
  return uuidv4();
}

/**
 * Get the set associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {array} The array representing the set associated with the node.
 */
export function nodeToSet(currNode) {
  if (!currNode) {
    return [];
  }
  if (!currNode.children) {
    return (currNode.set || []);
  }
  return currNode.children.flatMap(c => nodeToSet(c));
}

/**
 * Get the height of a node (the number of levels to reach a leaf).
 * @param {object} currNode A node object.
 * @param {number} level The level that the height will be computed relative to. By default, 0.
 * @returns {number} The height. If the node has a .children property,
 * then the minimum value returned is 1.
 */
export function nodeToHeight(currNode, level = 0) {
  if (!currNode.children) {
    return level;
  }
  const newLevel = level + 1;
  const childrenHeights = currNode.children.map(c => nodeToHeight(c, newLevel));
  return Math.max(...childrenHeights, newLevel);
}

/**
 * Get the size associated with a particular node.
 * Recursive.
 * @param {object} currNode A node object.
 * @returns {number} The length of all the node's children
 */
export function getNodeLength(currNode) {
  if (!currNode) {
    return [];
  }
  if (!currNode.children) {
    return (currNode.set.length || []);
  }
  return currNode.children.reduce((acc, curr) => acc + getNodeLength(curr), 0);
}

/**
 * Find a node with a matching name path, relative to a particular node.
 * @param {object} node A node object.
 * @param {string[]} path The name path for the node of interest.
 * @param {number} currLevelIndex The index of the current hierarchy level.
 * @returns {object|null} A matching node object, or null if none is found.
 */
function nodeFindNodeByNamePath(node, path, currLevelIndex) {
  const currNodeName = path[currLevelIndex];
  if (node.name === currNodeName) {
    if (currLevelIndex === path.length - 1) {
      return node;
    }
    if (node.children) {
      const foundNodes = node.children
        .map(child => nodeFindNodeByNamePath(child, path, currLevelIndex + 1))
        .filter(Boolean);
      if (foundNodes.length === 1) {
        return foundNodes[0];
      }
    }
  }
  return null;
}

/**
 * Find a node with a matching name path, relative to the whole tree.
 * @param {object} currTree A tree object.
 * @param {string[]} targetNamePath The name path for the node of interest.
 * @returns {object|null} A matching node object, or null if none is found.
 */
export function treeFindNodeByNamePath(currTree, targetNamePath) {
  const foundNodes = currTree.tree
    .map(levelZeroNode => nodeFindNodeByNamePath(levelZeroNode, targetNamePath, 0))
    .filter(Boolean);
  if (foundNodes.length === 1) {
    return foundNodes[0];
  }
  return null;
}

/**
 * Transform a node object using a transform function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @param {function} transform Takes the node matching the predicate as input, returns
 * a transformed version of the node.
 * @param {array} transformedPaths This array parameter is mutated. The path of
 * each transformed node is appended to this array.
 * @param {string[]} The current path of the node being updated, used internally
 * during recursion.
 * @returns {object} The updated node.
 */
export function nodeTransform(node, predicate, transform, transformedPaths, currPath) {
  let newPath;
  if (!currPath) {
    newPath = [node.name];
  } else {
    newPath = [...currPath];
  }
  if (predicate(node, newPath)) {
    transformedPaths.push(newPath);
    return transform(node, newPath);
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map(
        child => nodeTransform(
          child, predicate, transform, transformedPaths, newPath.concat([child.name]),
        ),
      ),
    };
  }
  return node;
}

/**
 * Transform many node objects using a transform function.
 * @param {object} node A node object.
 * @param {function} predicate Returns true if a node matches a condition of interest.
 * @param {function} transform Takes the node matching the predicate as input, returns
 * a transformed version of the node.
 * @param {array} transformedPaths This array parameter is mutated. The path of
 * each transformed node is appended to this array.
 * @param {string[]} The current path of the node being updated, used internally
 * during recursion.
 * @returns {object} The updated node.
 */
export function nodeTransformAll(node, predicate, transform, transformedPaths, currPath) {
  let newPath;
  if (!currPath) {
    newPath = [node.name];
  } else {
    newPath = [...currPath];
  }
  let newNode = node;
  if (predicate(node, newPath)) {
    transformedPaths.push(newPath);
    newNode = transform(node, newPath);
  }
  if (node.children) {
    return {
      ...newNode,
      children: newNode.children.map(
        child => nodeTransformAll(
          child, predicate, transform, transformedPaths, newPath.concat([child.name]),
        ),
      ),
    };
  }
  return newNode;
}

/**
 * Append a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodeAppendChild(currNode, newChild) {
  return {
    ...currNode,
    children: [...currNode.children, newChild],
  };
}

/**
 * Prepend a child to a parent node.
 * @param {object} currNode A node object.
 * @param {object} newChild The child node object.
 * @returns {object} The updated node.
 */
export function nodePrependChild(currNode, newChild) {
  return {
    ...currNode,
    children: [newChild, ...currNode.children],
  };
}

/**
 * Insert a child to a parent node.
 * @param {object} currNode A node object.
 * @param {*} newChild The child node object.
 * @param {*} insertIndex The index at which to insert the child.
 * @returns {object} The updated node.
 */
export function nodeInsertChild(currNode, newChild, insertIndex) {
  const newChildren = Array.from(currNode.children);
  newChildren.splice(insertIndex, 0, newChild);
  return {
    ...currNode,
    children: newChildren,
  };
}

/**
 * Get an array representing the union of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the union of the sets of checked nodes.
 */
export function treeToUnion(currTree, checkedPaths) {
  const nodes = checkedPaths.map(path => treeFindNodeByNamePath(currTree, path));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => a.concat(h.filter(hEl => !a.includes(hEl))), nodeSets[0] || []);
}

/**
 * Get an array representing the intersection of the sets of checked nodes.
 * @param {object} currTree A tree object.
 * @returns {array} An array representing the intersection of the sets of checked nodes.
 */
export function treeToIntersection(currTree, checkedPaths) {
  const nodes = checkedPaths.map(path => treeFindNodeByNamePath(currTree, path));
  const nodeSets = nodes.map(node => nodeToSet(node).map(([cellId]) => cellId));
  return nodeSets
    .reduce((a, h) => h.filter(hEl => a.includes(hEl)), nodeSets[0] || []);
}

/**
 * Get an array representing the complement of the union of the sets of checked nodes.
 * @param {object} currTree
 * @returns {array} An array representing the complement of the
 * union of the sets of checked nodes.
 */
export function treeToComplement(currTree, checkedPaths, items) {
  const primaryUnion = treeToUnion(currTree, checkedPaths);
  return items.filter(el => !primaryUnion.includes(el));
}

/**
 * Get an flattened array of descendants at a particular relative
 * level of interest.
 * @param {object} node A node object.
 * @param {number} level The relative level of interest.
 * 0 for this node's children, 1 for grandchildren, etc.
 * @param {boolean} stopEarly Should a node be returned early if no children exist?
 * @returns {object[]} An array of descendants at the specified level,
 * where the level is relative to the node.
 */
export function nodeToLevelDescendantNamePaths(node, level, prevPath, stopEarly = false) {
  if (!node.children) {
    if (!stopEarly) {
      return null;
    }
    return [[...prevPath, node.name]];
  }
  if (level === 0) {
    return [[...prevPath, node.name]];
  }
  return node.children
    .flatMap(c => nodeToLevelDescendantNamePaths(c, level - 1, [...prevPath, node.name], stopEarly))
    .filter(Boolean);
}

/**
 * Export the tree by clearing tree state and all node states.
 * @param {object} currTree A tree object.
 * @returns {object} Tree object with tree and node state removed.
 */
export function treeExport(currTree, datatype) {
  return {
    version: HIERARCHICAL_SCHEMAS[datatype].latestVersion,
    datatype,
    tree: currTree.tree,
  };
}

/**
 * Export the tree by clearing tree state and all node states,
 * and filter so that only the level zero node of interest is included.
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { treeToExport, nodeName }
 * Tree with one level zero node, and with state removed.
 */
export function treeExportLevelZeroNode(currTree, nodePath, datatype, cellSetColors) {
  const node = treeFindNodeByNamePath(currTree, nodePath);
  const nodeWithColors = nodeTransformAll(node, () => true, (n, nPath) => {
    const nodeColor = cellSetColors?.find(c => isEqual(c.path, nPath))?.color ?? DEFAULT_COLOR;
    return {
      ...n,
      color: nodeColor.slice(0, 3),
    };
  }, []);
  const treeWithOneLevelZeroNode = {
    ...currTree,
    tree: [nodeWithColors],
  };
  return {
    treeToExport: treeExport(treeWithOneLevelZeroNode, datatype),
    nodeName: node.name,
  };
}

/**
 * Prepare the set of a node of interest for export.
 * @param {object} currTree A tree object.
 * @param {string} nodeKey The key of the node of interest.
 * @returns {object} { setToExport, nodeName } The set as an array.
 */
export function treeExportSet(currTree, nodePath) {
  const node = treeFindNodeByNamePath(currTree, nodePath);
  return { setToExport: nodeToSet(node), nodeName: node.name };
}

/**
 * Get an empty tree, with a default tree state.
 * @param {string} datatype The type of sets that this tree contains.
 * @returns {object} Empty tree.
 */
export function treeInitialize(datatype) {
  return {
    version: HIERARCHICAL_SCHEMAS[datatype].latestVersion,
    datatype,
    tree: [],
  };
}

/**
 * For convenience, get an object with information required
 * to render a node as a component.
 * @param {object} node A node to be rendered.
 * @returns {object} An object containing properties required
 * by the TreeNode render functions.
 */
export function nodeToRenderProps(node, path, cellSetColor) {
  const level = path.length - 1;
  return {
    title: node.name,
    nodeKey: pathToKey(path),
    path,
    size: getNodeLength(node),
    color: cellSetColor?.find(d => isEqual(d.path, path))?.color,
    level,
    isLeaf: (!node.children || node.children.length === 0) && Boolean(node.set),
    height: nodeToHeight(node),
  };
}

/**
 * Using a color and a probability, mix the color with an "uncertainty" color,
 * for example, gray.
 * Reference: https://github.com/bgrins/TinyColor/blob/80f7225029c428c0de0757f7d98ac15f497bee57/tinycolor.js#L701
 * @param {number[]} originalColor The color assignment for the class.
 * @param {number} p The mixing amount, or level certainty in the originalColor classification,
 * between 0 and 1.
 * @param {number[]} mixingColor The color with which to mix. By default, [128, 128, 128] gray.
 * @returns {number[]} Returns the color after mixing.
 */
function colorMixWithUncertainty(originalColor, p, mixingColor = [128, 128, 128]) {
  return [
    ((originalColor[0] - mixingColor[0]) * p) + mixingColor[0],
    ((originalColor[1] - mixingColor[1]) * p) + mixingColor[1],
    ((originalColor[2] - mixingColor[2]) * p) + mixingColor[2],
  ];
}

/**
 * Given a tree with state, get the cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 *  @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} cellSetColor Array of objects with the
 * properties `path` and `color`.
 * @returns {array} Tuple of [cellIds, cellColors]
 * where cellIds is an array of strings,
 * and cellColors is an object mapping cellIds to color [r,g,b] arrays.
 */
export function treeToCellColorsBySetNames(currTree, selectedNamePaths, cellSetColor) {
  let cellColorsArray = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || DEFAULT_COLOR
      );
      cellColorsArray = [
        ...cellColorsArray,
        ...nodeSet.map(([cellId, prob]) => [
          cellId,
          (isNil(prob) ? nodeColor : colorMixWithUncertainty(nodeColor, prob)),
        ]),
      ];
    }
  });
  return new Map(cellColorsArray);
}

/**
 * Given a tree with state, get an array of
 * objects with cellIds and cellColors,
 * based on the nodes currently marked as "visible".
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} setColor Array of objects with the
 * properties `path` and `color`.
 * @returns {object[]} Array of objects with properties
 * `obsId`, `name`, and `color`.
 */
export function treeToObjectsBySetNames(currTree, selectedNamePaths, setColor) {
  let cellsArray = [];
  for (let i = 0; i < selectedNamePaths.length; i += 1) {
    const setNamePath = selectedNamePaths[i];
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        setColor?.find(d => isEqual(d.path, setNamePath))?.color
        || DEFAULT_COLOR
      );
      cellsArray = cellsArray.concat(nodeSet.map(([cellId]) => ({
        obsId: cellId,
        name: node.name,
        color: nodeColor,
      })));
    }
  }
  return cellsArray;
}

export function treeToCellPolygonsBySetNames(
  currTree, cells, mapping, selectedNamePaths, cellSetColor,
) {
  const cellSetPolygons = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = (
        cellSetColor?.find(d => isEqual(d.path, setNamePath))?.color
        || DEFAULT_COLOR
      );
      const cellPositions = nodeSet
        .map(([cellId]) => ([
          cells[cellId]?.mappings[mapping][0],
          -cells[cellId]?.mappings[mapping][1],
        ]))
        .filter(cell => cell.every(i => typeof i === 'number'));

      if (cellPositions.length > 2) {
        const points = turfFeatureCollection(
          cellPositions.map(turfPoint),
        );
        const concavity = Infinity;
        const hullCoords = concaveman(cellPositions, concavity);
        if (hullCoords) {
          const centroidCoords = centroid(points).geometry.coordinates;
          cellSetPolygons.push({
            path: setNamePath,
            name: setNamePath[setNamePath.length - 1],
            hull: hullCoords,
            color: nodeColor,
            centroid: centroidCoords,
          });
        }
      }
    }
  });
  return cellSetPolygons;
}

/**
 * Given a tree with state, get the sizes of the
 * sets currently marked as "visible".
 * @param {object} currTree A tree object.
 * @param {array} selectedNamePaths Array of arrays of strings,
 * representing set "paths".
 * @param {object[]} setColor Array of objects with the
 * properties `path` and `color`.
 * @returns {object[]} Array of objects
 * with the properties `name`, `size`, `key`,
 * and `color`.
 */
export function treeToSetSizesBySetNames(currTree, selectedNamePaths, setColor) {
  const sizes = [];
  selectedNamePaths.forEach((setNamePath) => {
    const node = treeFindNodeByNamePath(currTree, setNamePath);
    if (node) {
      const nodeSet = nodeToSet(node);
      const nodeColor = setColor.find(d => isEqual(d.path, setNamePath))?.color || DEFAULT_COLOR;
      sizes.push({
        key: generateKey(),
        name: node.name,
        size: nodeSet.length,
        color: nodeColor,
      });
    }
  });
  return sizes;
}

/**
 * Find and remove a node from the descendants of the current node.
 * @param {object} node A node to search on.
 * @param {array} prevPath Path of the current node to be searched.
 * @param {array} filterPath The path sought.
 * @returns {object} A new node without a node at filterPath.
 */
export function filterNode(node, prevPath, filterPath) {
  if (isEqual([...prevPath, node.name], filterPath)) {
    return null;
  }
  if (!node.children) {
    return node;
  }
  return {
    ...node,
    children: node.children.map(
      c => filterNode(c, [...prevPath, node.name], filterPath),
    ).filter(Boolean),
  };
}

export function treeToExpectedCheckedLevel(currTree, checkedPaths) {
  let result = null;
  if (currTree) {
    currTree.tree.forEach((lzn) => {
      const levelZeroPath = [lzn.name];
      const height = nodeToHeight(lzn);
      range(height).forEach((i) => {
        const levelIndex = i + 1;
        const levelNodePaths = nodeToLevelDescendantNamePaths(lzn, levelIndex, [], true);
        if (isEqual(levelNodePaths, checkedPaths)) {
          result = { levelZeroPath, levelIndex };
        }
      });
    });
  }
  return result;
}

export function treesConflict(cellSets, testCellSets) {
  const paths = [];
  const testPaths = [];
  let hasConflict = false;

  function getPaths(node, prevPath) {
    paths.push([...prevPath, node.name]);
    if (node.children) {
      node.children.forEach(c => getPaths(c, [...prevPath, node.name]));
    }
  }
  cellSets.tree.forEach(lzn => getPaths(lzn, []));

  function getTestPaths(node, prevPath) {
    testPaths.push([...prevPath, node.name]);
    if (node.children) {
      node.children.forEach(c => getPaths(c, [...prevPath, node.name]));
    }
  }
  testCellSets.tree.forEach(lzn => getTestPaths(lzn, []));

  testPaths.forEach((testPath) => {
    if (paths.find(p => isEqual(p, testPath))) {
      hasConflict = true;
    }
  });
  return hasConflict;
}

export function initializeCellSetColor(cellSets, cellSetColor) {
  const nextCellSetColor = [...(cellSetColor || [])];
  const nodeCountPerTreePerLevel = cellSets.tree.map(tree => Array
    .from({
      length: nodeToHeight(tree) + 1, // Need to add one because its an array.
    }).fill(0));

  function processNode(node, prevPath, hierarchyLevel, treeIndex) {
    const index = nodeCountPerTreePerLevel[treeIndex][hierarchyLevel];
    const nodePath = [...prevPath, node.name];

    const nodeColor = nextCellSetColor.find(d => isEqual(d.path, nodePath));
    if (!nodeColor) {
      nextCellSetColor.push({
        path: nodePath,
        color: PALETTE[index % PALETTE.length],
      });
    }
    nodeCountPerTreePerLevel[treeIndex][hierarchyLevel] += 1;
    if (node.children) {
      node.children.forEach(c => processNode(c, nodePath, hierarchyLevel + 1, treeIndex));
    }
  }

  cellSets.tree.forEach((lzn, treeIndex) => processNode(lzn, [], 0, treeIndex));
  return nextCellSetColor;
}

export function getCellSetPolygons(params) {
  const {
    cells,
    mapping,
    cellSets,
    cellSetSelection,
    cellSetColor,
  } = params;
  if (cellSetSelection && cellSetSelection.length > 0 && cellSets && cells) {
    return treeToCellPolygonsBySetNames(cellSets, cells, mapping, cellSetSelection, cellSetColor);
  }
  return [];
}
