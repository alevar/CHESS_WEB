export const getDefaultSession = (accession_id: string) => {
  return {
    "id": "MoEhmcAxUwmpuPBDxDdrl",
    "name": "this session",
    "margin": 0,
    "drawerPosition": "right",
    "drawerWidth": 384,
    "widgets": {
      "hierarchicalTrackSelector": {
        "id": "hierarchicalTrackSelector",
        "type": "HierarchicalTrackSelectorWidget",
        "view": "linearGenomeView",
        "faceted": {
          "filterText": "",
          "showSparse": false,
          "showFilters": false,
          "showOptions": false,
          "panelWidth": 400
        }
      }
    },
    "activeWidgets": {},
    "minimized": false,
    "connectionInstances": [],
    "sessionTracks": [],
    "view": {
      "id": "linearGenomeView",
      "minimized": false,
      "type": "LinearGenomeView",
      "offsetPx": 0,
      "bpPerPx": 7,
      "tracks": [
        {
          "id": "4aZAiE-A3",
          "type": "ReferenceSequenceTrack",
          "configuration": `ReferenceSequenceTrack`,
          "minimized": false,
          "displays": [
            {
              "type": "LinearReferenceSequenceDisplay",
              "height": 800,
              "configuration": `ReferenceSequenceTrack-LinearReferenceSequenceDisplay`,
              "showForward": true,
              "showReverse": true,
              "showTranslation": true
            }
          ]
        },
        {
          "id": "mCdx9J1_uOSpW-jBh1zLm",
          "type": "FeatureTrack",
          "configuration": "genes",
          "minimized": false,
          "displays": [
            {
              "id": "Gt6r3d-aiCyyT6r6rxI6i",
              "type": "LinearBasicDisplay",
              "height": 500,
              "configuration": "genes-LinearBasicDisplay"
            }
          ]
        }
      ],
      // "hideHeader": true,
      "hideHeaderOverview": true,
      "hideNoTracksActive": true,
      "trackSelectorType": "hierarchical",
      "showCenterLine": false,
      "showCytobandsSetting": false,
      "trackLabels": "hidden",
      "showGridlines": true,
      "highlight": [],
      "colorByCDS": false,
      "showTrackOutlines": true
    }
  };
};