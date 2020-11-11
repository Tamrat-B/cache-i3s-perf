// esri
import esriConfig = require("esri/config");
import WebScene = require("esri/WebScene");

// esri.views
import SceneView = require("esri/views/SceneView");
import LayerView = require("esri/views/layers/LayerView");
import SceneLayer = require("esri/layers/SceneLayer");

const IDBCACHESCENELAYER = "esri-scenelayer-cache";

class Application {
    view: SceneView;
    webscene: WebScene;
    starttime: number;
    measuring: boolean;
    slideanim: boolean;
    slidenr: number;
    loop: number;
    loopnumber: number;

    constructor() {
        window["app"] = this;
        //let webscene = "abd5e3c4b173417f8c14f1283dee33c6";
        //let webscene = "1c7a06421a314ac9b7d0fae22aa367fb";
        //let portal = "http://www.arcgis.com/";
        //let webscene = "abd5e3c4b173417f8c14f1283dee33c6";
        let portal = "https://devext.arcgis.com/";
        let webscene = "3718113da1de41c9be4ce503bdfae32d";
        let qualityprofile = "medium";
        let loop = 0;
        let slideanim = true;
        let slidenr = 0;
        console.log("URL: " + window.location.href);
        const urlParams = new URLSearchParams(window.location.search);
        const portal_fromquery = urlParams.get("portal");
        const webscene_fromquery = urlParams.get("webscene");
        const qualityprofile_fromquery = urlParams.get("qualityprofile");
        const loop_fromquery = urlParams.get("loop");
        slideanim = urlParams.get("slideanim") === "true";
        const slidenr_fromquery = urlParams.get("slidenr");
        const clearidb = urlParams.get("clearidb") === "true";

        if (webscene_fromquery) {
            webscene = webscene_fromquery;
        }
        if (portal_fromquery) {
            portal = portal_fromquery;
        }
        if (qualityprofile_fromquery) {
            qualityprofile = qualityprofile_fromquery;
        }
        if (loop_fromquery) {
            loop = parseInt(loop_fromquery, 10);
        }
        if (slidenr_fromquery) {
            slidenr = parseInt(slidenr_fromquery, 10);
        }
        this.startPerformanceMeasurement(portal, webscene, qualityprofile, clearidb, loop, slideanim, slidenr);
    }

    startPerformanceMeasurement(
        portal: string,
        webscene: string,
        qualityprofile: string,
        clearidb: boolean,
        loop: number,
        slideanim: boolean,
        slidenr: number
    ): void {
        console.log(
            "CONFIG: portal: " +
            portal +
            " / webscene: " +
            webscene +
            " / qualityprofile:" +
            qualityprofile +
            " / clearidb:" +
            clearidb +
            " / loop:" +
            loop + " / slideanim:" +
            slideanim + " / slidenr:" +
            slidenr
        );
        if (clearidb) {
            this.clearIDB();
        }
        this.starttime = window.performance.now();
        this.measuring = true;
        this.slideanim = slideanim;
        this.slidenr = slidenr;
        this.loop = loop;
        this.loopnumber = 0;
        esriConfig.portalUrl = portal;
        this.webscene = new WebScene({
            portalItem: {
                id: webscene
            }
        });
        this.webscene.load().then(() => {
            const viewpoint = this.webscene.presentation.slides.getItemAt(this.slidenr).viewpoint;
            this.view = new SceneView({
                container: "viewDiv",
                qualityProfile: qualityprofile,
                map: this.webscene,
                viewpoint: viewpoint
            });
            this.view.when(() => {
                const countlayers = this.view.map.allLayers.length;
                const countslide = this.webscene.presentation.slides.length;
                if (countlayers === 1) {
                    if (countslide > 1) {
                        console.log("SLIDES: " + countslide);
                        console.log("RESULTATTRIBUTES: loop,slidnr,version,measuretime");
                        this.view.whenLayerView(this.view.map.layers.getItemAt(0)).then(layerView => {
                            this.startSlideAnimation(layerView);
                        });
                    } else {
                        console.log("EROOR: Insert more then one slide  --> countslide: " + countslide);
                    }
                } else {
                    console.log("ERROR: Remove layers --> countlayers: " + countlayers);
                }
            });
        });

    }

    startSlideAnimation(layerView: LayerView): void {
        const scenelayer = <SceneLayer>layerView.layer;
        const scenelayerversion = scenelayer.version.versionString;
        console.log("SCENEVERSION: " + scenelayerversion);
        console.log("START");
        this.starttime = window.performance.now();
        this.view.map.layers.getItemAt(0).visible = true; // set the layer visible if is not
        layerView.watch("updating", (value) => {
            wait(this.view).then(() => {
                if (!value && this.measuring) {
                    this.measuring = false;
                    const measuretime = ((window.performance.now() - this.starttime) / 1000.0).toFixed(3);
                    console.log("RESULT: " + this.loopnumber + "," + this.slidenr + "," + scenelayerversion + "," + measuretime);
                    if ((this.slidenr < this.webscene.presentation.slides.length - 1) && this.slideanim) {
                        this.slidenr += 1;
                        this.starttime = window.performance.now();
                        const slide = this.webscene.presentation.slides.getItemAt(this.slidenr);
                        this.view.goTo(slide.viewpoint, { duration: 0 });
                        this.measuring = true;
                    } else {
                        if (this.loopnumber < this.loop) {
                            this.loopnumber += 1;
                            console.log("LOOP: " + this.loopnumber);
                            this.slidenr = 0;
                            this.starttime = window.performance.now();
                            const slide = this.webscene.presentation.slides.getItemAt(this.slidenr);
                            this.view.goTo(slide.viewpoint, { duration: 0 });
                            this.measuring = true;
                        }
                        else {
                            console.log("STOP");
                        }
                    }
                }
            });
        });
    }

    clearIDB(): void {
        const DBDeleteRequest = indexedDB.deleteDatabase(IDBCACHESCENELAYER);
        DBDeleteRequest.onerror = function (): void {
            console.log("CLEARIDB: Error deleting database.");
        };
        DBDeleteRequest.onsuccess = function (event): void {
            console.log("CLEARIDB: Database deleted successfully");
        };
    }
}

function wait(view: SceneView): Promise<void> {
    return new Promise((resolve) => waitForResources(view, () => resolve()));
}

type Callback = () => void;


function waitForResources(view: SceneView, callback: Callback): void {
    if (!view) {
        callback();
        return;
    }

    let waitForIdle = 1;

    function busy(): boolean {
        if (
            // View busy?
            !view.ready ||
            view.updating ||
            // Renderer still loading resources?
            (view as any)._stage.renderView.isLoadingResources ||
            // Note: check for tilingScheme before checking needsRender because a terrain without
            // a tilingscheme will continuously set needsRender (because terrain renderer flags loaded
            // when first time rendering anything, but without tiling scheme it won't start rendering)
            ((view as any).basemapTerrain && (view as any).basemapTerrain.tilingScheme && (view as any)._stage.renderView.needsRender()) ||
            // Textures being acquired asynchronously?
            (view as any)._stage.renderView.test.textureRepository.getLoadingCount() > 0 ||
            // All layers and layer views fullfilled?
            view.map.allLayers.some((l): boolean => !l.isFulfilled() || !view.whenLayerView(l).isFulfilled())
        ) {
            waitForIdle = 1;
            return true;
        }

        --waitForIdle;
        return waitForIdle >= 0;
    }

    function pollBusy(): void {
        if (view.destroyed) {
            return;
        }

        if (busy()) {
            setTimeout(pollBusy, 16);
        } else {
            callback();
        }
    }

    setTimeout(pollBusy, 16);
}
export = Application;
