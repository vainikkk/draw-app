import {
  Excalidraw,
  exportToBlob,
  MainMenu,
  MIME_TYPES,
  Sidebar,
  useHandleLibrary,
} from "@excalidraw/excalidraw";

import { useCallback, useEffect, useRef, useState } from "react";
import "./App.scss";
import initialData from "./initialData";
import MobileFooter from "./MobileFooter";
import { resolvablePromise } from "./utils";

function App() {
  const appRef = useRef(null);
  // const [viewModeEnabled, setViewModeEnabled] = useState(false);
  // const [zenModeEnabled, setZenModeEnabled] = useState(false);
  // const [gridModeEnabled, setGridModeEnabled] = useState(false);

  const initialStatePromiseRef = useRef({ promise: null });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise = resolvablePromise();
  }

  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  useHandleLibrary({ excalidrawAPI });

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }
    const fetchData = async () => {
      const res = await fetch("/rocket.jpeg");
      const imageData = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(imageData);

      reader.onload = function () {
        const imagesArray = [
          {
            id: "rocket",
            dataURL: reader.result,
            mimeType: MIME_TYPES.jpg,
            created: 1644915140367,
            lastRetrieved: 1644915140367,
          },
        ];

        //@ts-ignore
        initialStatePromiseRef.current.promise.resolve(initialData);
        excalidrawAPI.addFiles(imagesArray);
      };
    };
    fetchData();
  }, [excalidrawAPI]);

  // const handleUploadChange = (event) => {
  //   console.log("FILE", event.target.files[0]);
  //   const file = event.target.files[0];
  //   const scene = loadFromBlob(file, null, null);
  //   excalidrawAPI.updateScene(scene);

  //   // convertPdfToImage(file);
  // };

  const renderTopRightUI = (isMobile) => {
    return (
      <>
        {/* <input type="file" onChange={handleUploadChange} name="file" /> */}
      </>
    );
  };

  const onLinkOpen = useCallback((element, event) => {
    const link = element?.link;
    const { nativeEvent } = event.detail;
    const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const isNewWindow = nativeEvent.shiftKey;
    const isInternalLink =
      link.startsWith("/") || link.includes(window.location.origin);
    if (isInternalLink && !isNewTab && !isNewWindow) {
      // signal that we're handling the redirect ourselves
      event.preventDefault();
      // do a custom redirect, such as passing to react-router
      // ...
    }
  }, []);

  const renderSidebar = () => {
    return (
      <Sidebar>
        <Sidebar.Header>Custom header!</Sidebar.Header>
        Custom sidebar!
      </Sidebar>
    );
  };

  const renderMenu = () => {
    return (
      <MainMenu>
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.Export />
        <MainMenu.Separator />
        <MainMenu.DefaultItems.Help />
        {excalidrawAPI && <MobileFooter excalidrawAPI={excalidrawAPI} />}
      </MainMenu>
    );
  };

  const handleDownload = async () => {
    const blob = await exportToBlob({
      elements: excalidrawAPI?.getSceneElements(),
      mimeType: "image/png",
      appState: {
        ...initialData.appState,
      },
      files: excalidrawAPI?.getFiles(),
    });
    let blobUrl = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.download = "download" + new Date().getTime();
    a.href = blobUrl;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="App" ref={appRef}>
      <div className="excalidraw-wrapper">
        <Excalidraw
          ref={(api) => setExcalidrawAPI(api)}
          initialData={initialStatePromiseRef.current.promise}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme={"light"}
          name="Custom name of drawing"
          UIOptions={{
            canvasActions: { loadScene: false },
          }}
          renderTopRightUI={renderTopRightUI}
          onLinkOpen={onLinkOpen}
          renderSidebar={renderSidebar}
        >
          {renderMenu()}
        </Excalidraw>
      </div>
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

export default App;
