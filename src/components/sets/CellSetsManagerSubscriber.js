import React, {
  useEffect,
  useReducer,
  useState,
  useMemo,
} from 'react';
import isEqual from 'lodash/isEqual';
import packageJson from '../../../package.json';
import {
  useCoordination,
  useLoaders,
  useSetWarning,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import reducer, {
  treeInitialize, ACTION, treeToVisibleCells,
  treeExportLevelZeroNode, treeExportSet,
  treeHasCheckedSetsToView,
  treeHasCheckedSetsToUnion,
  treeHasCheckedSetsToIntersect,
  treeHasCheckedSetsToComplement,
  treeToVisibleSetNames,
  treeToSetNamesByKeys,
  treeCheckNameConflictsByKey,
  treeToExpectedCheckedLevel,
} from './reducer';
import {
  handleExportJSON, downloadForUser,
  handleExportTabular,
} from './io';
import {
  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
} from './constants';
import { useUrls, useReady } from '../hooks';
import { useCellsData, useCellSetsData } from '../data-hooks';

const SETS_DATATYPE_CELL = 'cell';
const initialTree = treeInitialize(SETS_DATATYPE_CELL);

const CELL_SETS_DATA_TYPES = ['cells', 'cell-sets'];

/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {function} removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {function} onReady The function to call when the component has finished
 * initializing (subscribing to relevant events, etc).
 * @param {boolean} initializeSelection Should an event be emitted upon initialization,
 * so that cells are colored by some heuristic (e.g. the first clustering in the cell_sets tree)?
 */
export default function CellSetsManagerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    initializeSelection = true,
    theme,
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Get "props" from the coordination space.
  const [{
    dataset,
    cellSelection,
    cellSetSelection,
  }, {
    setCellSelection,
    setCellSetSelection,
    setCellColorEncoding,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.cellSets, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    CELL_SETS_DATA_TYPES,
  );

  const [tree, dispatch] = useReducer(reducer, initialTree);
  const [autoSetSelections, setAutoSetSelections] = useState({});

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    setAutoSetSelections(undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(loaders, dataset, setItemIsReady, addUrl, true,
    (data) => {
      if (data && data.tree.length >= 1) {
        // eslint-disable-next-line no-underscore-dangle
        const newAutoSetSelectionKeys = data.tree[0].children.map(node => node._state.key);
        const newAutoSetSelections = treeToSetNamesByKeys(data, newAutoSetSelectionKeys);
        setAutoSetSelections(prev => ({
          [dataset]: [
            ...((prev && prev[dataset]) || []),
            ...newAutoSetSelections,
          ],
        }));
      } else {
        setAutoSetSelections(prev => ({ [dataset]: ((prev && prev[dataset]) || []) }));
      }
    });

  // Try to set up the selected sets array automatically if undefined.
  useEffect(() => {
    // Need to check for `undefined` specifically because the selection tools (lasso / rectangle)
    // use `cellSelection = null` as a special way to inform this component
    // that the selection is coming from a tool.
    if (
      isReady
      && autoSetSelections[dataset] !== undefined
      && cellSetSelection === undefined
      && cellSelection === undefined
      && initializeSelection
    ) {
      setCellSetSelection(autoSetSelections[dataset]);
    }
  }, [dataset, autoSetSelections, isReady, cellSetSelection, cellSelection,
    setCellSetSelection, initializeSelection]);

  // Set the tree in the reducer when it loads initially.
  useEffect(() => {
    if (cellSets) {
      dispatch({ type: ACTION.SET, tree: cellSets });
    }
    if (cellSets && cells) {
      dispatch({ type: ACTION.SET_TREE_ITEMS, cellIds: Object.keys(cells) });
    }
  }, [cellSets, cells]);

  // Listen for changes to `cellSelection`, and create a new
  // set when there is a new selection available.
  useEffect(() => {
    if (!cellSelection) {
      return;
    }
    // Only create a new set if the new set is different than the current selection.
    const [visibleCells] = treeToVisibleCells(tree);
    // Only create a new set if the new set is coming from the lasso or rectangle selection tools,
    // which explicitly set `cellSetSelection = null` so that we can detect it here.
    if (cellSetSelection === null && !isEqual(visibleCells, cellSelection)) {
      dispatch({ type: ACTION.SET_CURRENT_SET, cellIds: cellSelection, publish: true });
    }
  }, [cellSetSelection, cellSelection, tree]);


  // Publish the updated tree when the tree changes.
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (!loaders[dataset] || !tree || (tree && tree._state && tree._state.publish === false)) {
      return;
    }
    if (loaders[dataset].loaders['cell-sets']) {
      loaders[dataset].loaders['cell-sets'].publish(tree);
    }
    // Don't do anything if still waiting for `autoSetSelections`
    // to be initialized.
    if (!autoSetSelections[dataset]) {
      return;
    }
    // Create cell set selections using the names of the "visible" sets.
    const visibleSetNames = treeToVisibleSetNames(tree);
    if (!isEqual(visibleSetNames, cellSetSelection)) {
      setCellSetSelection(visibleSetNames);
      // Create a cell selection consisting of all cells in the "visible" sets.
      const [visibleCells] = treeToVisibleCells(tree);
      if (!isEqual(visibleCells, cellSelection)) {
        setCellSelection(visibleCells);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  // We want the "checked level" radio button to be initialized even when
  // the tree object may not explicitly have the `._state.checkedLevel` set up.
  const checkedLevel = useMemo(() => {
    if (cellSetSelection && tree) {
      return treeToExpectedCheckedLevel(tree, cellSetSelection);
    }
    return null;
  }, [cellSetSelection, tree]);


  // A helper function for updating the encoding for cell colors,
  // which may have previously been set to 'geneSelection'.
  function setCellSetColorEncoding() {
    setCellColorEncoding('cellSetSelection');
  }

  // Callback functions
  function onCheckLevel(levelZeroKey, levelIndex) {
    dispatch({
      type: ACTION.CHECK_LEVEL,
      levelZeroKey,
      levelIndex,
      publish: true,
    });
    setCellSetColorEncoding();
  }

  function onCheckNode(targetKey, checked) {
    dispatch({ type: ACTION.CHECK_NODE, targetKey, checked });
    setCellSetColorEncoding();
  }

  function onExpandNode(expandedKeys, targetKey, expanded) {
    dispatch({
      type: ACTION.EXPAND_NODE, expandedKeys, targetKey, expanded,
    });
  }

  function onDropNode(dropKey, dragKey, dropPosition, dropToGap) {
    dispatch({
      type: ACTION.DROP_NODE, dropKey, dragKey, dropPosition, dropToGap,
    });
  }

  function onNodeSetColor(targetKey, color) {
    dispatch({ type: ACTION.SET_NODE_COLOR, targetKey, color });
  }

  function onNodeSetName(targetKey, name, stopEditing) {
    dispatch({
      type: ACTION.SET_NODE_NAME, targetKey, name, stopEditing,
    });
  }

  function onNodeCheckNewName(targetKey, name) {
    return treeCheckNameConflictsByKey(tree, name, targetKey);
  }

  function onNodeSetIsEditing(targetKey, value) {
    dispatch({
      type: ACTION.SET_NODE_IS_EDITING, targetKey, value,
    });
  }

  function onNodeRemove(targetKey) {
    dispatch({ type: ACTION.REMOVE_NODE, targetKey });
  }

  function onNodeView(targetKey) {
    dispatch({ type: ACTION.VIEW_NODE, targetKey });
    setCellSetColorEncoding();
  }

  function onCreateLevelZeroNode() {
    dispatch({ type: ACTION.CREATE_LEVEL_ZERO_NODE });
  }

  function onUnion() {
    dispatch({ type: ACTION.UNION_CHECKED });
    setCellSetColorEncoding();
  }

  function onIntersection() {
    dispatch({ type: ACTION.INTERSECTION_CHECKED });
    setCellSetColorEncoding();
  }

  function onComplement() {
    dispatch({ type: ACTION.COMPLEMENT_CHECKED });
    setCellSetColorEncoding();
  }

  function onView() {
    dispatch({ type: ACTION.VIEW_CHECKED });
    setCellSetColorEncoding();
  }

  function onImportTree(treeToImport) {
    dispatch({ type: ACTION.IMPORT, levelZeroNodes: treeToImport.tree });
  }

  function onExportLevelZeroNodeJSON(nodeKey) {
    const { treeToExport, nodeName } = treeExportLevelZeroNode(tree, nodeKey);
    downloadForUser(
      handleExportJSON(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_JSON}`,
    );
  }

  function onExportLevelZeroNodeTabular(nodeKey) {
    const { treeToExport, nodeName } = treeExportLevelZeroNode(tree, nodeKey);
    downloadForUser(
      handleExportTabular(treeToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-hierarchy.${FILE_EXTENSION_TABULAR}`,
    );
  }

  function onExportSetJSON(nodeKey) {
    const { setToExport, nodeName } = treeExportSet(tree, nodeKey);
    downloadForUser(
      handleExportJSON(setToExport),
      `${nodeName}_${packageJson.name}-${SETS_DATATYPE_CELL}-set.${FILE_EXTENSION_JSON}`,
      FILE_EXTENSION_JSON,
    );
  }

  return (
    <TitleInfo
      title="Cell Sets"
      isScroll
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <SetsManager
        tree={tree}
        checkedLevel={checkedLevel}
        datatype={SETS_DATATYPE_CELL}
        onError={setWarning}
        onCheckNode={onCheckNode}
        onExpandNode={onExpandNode}
        onDropNode={onDropNode}
        onCheckLevel={onCheckLevel}
        onNodeSetColor={onNodeSetColor}
        onNodeSetName={onNodeSetName}
        onNodeCheckNewName={onNodeCheckNewName}
        onNodeSetIsEditing={onNodeSetIsEditing}
        onNodeRemove={onNodeRemove}
        onNodeView={onNodeView}
        onImportTree={onImportTree}
        onCreateLevelZeroNode={onCreateLevelZeroNode}
        onExportLevelZeroNodeJSON={onExportLevelZeroNodeJSON}
        onExportLevelZeroNodeTabular={onExportLevelZeroNodeTabular}
        onExportSetJSON={onExportSetJSON}
        onUnion={onUnion}
        onIntersection={onIntersection}
        onComplement={onComplement}
        onView={onView}
        hasCheckedSetsToView={treeHasCheckedSetsToView(tree)}
        hasCheckedSetsToUnion={treeHasCheckedSetsToUnion(tree)}
        hasCheckedSetsToIntersect={treeHasCheckedSetsToIntersect(tree)}
        hasCheckedSetsToComplement={treeHasCheckedSetsToComplement(tree)}
      />
    </TitleInfo>
  );
}
