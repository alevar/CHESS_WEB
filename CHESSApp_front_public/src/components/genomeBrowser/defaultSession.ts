export interface BrowserSessionProps {
  assembly_name: string;
  assembly_id: number;
  nomenclature: string;
}

export const getDefaultSession = (session: BrowserSessionProps) => {
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
        }
        // Dynamic tracks will be added here based on user selection
      ],
      // "hideHeader": true,
      "hideHeaderOverview": true,
      "hideNoTracksActive": true,
      "trackSelectorType": "hierarchical",
      "showCenterLine": false,
      "showCytobandsSetting": false,
      "trackLabels": "left",
      "showGridlines": true,
      "highlight": [],
      "colorByCDS": false,
      "showTrackOutlines": true
    }
  };
};

// Function to generate session with dynamic tracks
export const generateSessionWithTracks = (session: BrowserSessionProps, trackIds: string[]) => {
  const baseSession = getDefaultSession(session);
  
  // Add dynamic tracks to the session
  const dynamicTracks = trackIds.map(trackId => ({
    "id": trackId,
    "type": "FeatureTrack",
    "configuration": trackId,
    "minimized": false,
    "displays": [
      {
        "id": `${trackId}-LinearBasicDisplay`,
        "type": "LinearBasicDisplay",
        "height": 80,
        "configuration": `${trackId}-LinearBasicDisplay`
      }
    ]
  }));

  // Insert dynamic tracks after the reference sequence track
  baseSession.view.tracks.splice(
    1,
    0,
    ...dynamicTracks.map(track => ({
      ...track,
      displays: track.displays.map(display => ({
        ...display,
        showForward: false,
        showReverse: false,
        showTranslation: false,
      })),
    }))
  );

  return baseSession;
};