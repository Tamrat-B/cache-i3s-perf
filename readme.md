# cache-i3s-perf

A webapplication to test the performance of SceneServices.

## URL Parameters

| URL Parameter  | Comment | default |
| ------------- | ------------- | ------------- |
| `portal=<full-url-to-portal>` | use this to define the portal on which the webscene exists | "https://devext.arcgis.com/" |
| `webscene=<item-id>` | use this to load webscenes that are stored in portal | "3718113da1de41c9be4ce503bdfae32d" |
| `loop=<number>` | loop trough the different slide multi times (measure the effect of cached information) | 0 |
| `slideanim=<true ¦ false>` | if true it wlaks trough the slides starting with  `slidnr` | false |
| `slidenr` | defines the slide to start with when open the webscene | 0 |
| `clearidb=<true ¦ false>` | if `true` it deletes the IDBCache with the name  "esri-scenelayer-cache".  | false |
| `qualityprofile=<"low" ¦ "medium" ¦ "high">` | sets the qualityprofile: https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html#qualityProfile  | "medium" |

Example for an url:
 https://github.com/Tamrat-B/cache-i3s-perf/index-v412.html?portal=https://3dcities.maps.arcgis.com/&webscene=99c2bc22a0ee42c981abb777710d1518&clearidb=true&qualityprofile=medium&loop=0&slideanim=true&slidenr=0

The application returns different messages in the console. It could look like this:

```log
LOG: URL: https://github.com/Tamrat-B/cache-i3s-perf/index-v412.html?testname=[1.1]-IM-Large-4.12-spain-1.7&portal=https://3dcities.maps.arcgis.com/&webscene=99c2bc22a0ee42c981abb777710d1518&clearidb=true&qualityprofile=medium&loop=0&slideanim=true&slidenr=0&
LOG: CONFIG: portal: https://3dcities.maps.arcgis.com/ webscene: 99c2bc22a0ee42c981abb777710d1518 / qualityprofile:medium / clearidb:true / loop:0 / slideanim:true / slidenr:0
LOG: CLEARIDB: Database deleted successfully
LOG: Failed to load resource: the server responded with a status of 404 (Not Found)
LOG: SLIDES: 5
LOG: RESULTATTRIBUTES: loop,slidnr,version,measuretime
LOG: SCENEVERSION: 1.7
LOG: START
LOG: RESULT: 0,0,1.7,5.873
LOG: RESULT: 0,1,1.7,2.075
LOG: RESULT: 0,2,1.7,1.491
LOG: RESULT: 0,3,1.7,15.468
LOG: RESULT: 0,4,1.7,10.630
LOG: STOP
```

The measurments:

```log
RESULTATTRIBUTES: loop,slidnr,version,measuretime
LOG: RESULT: 0,0,1.7,5.873
LOG: RESULT: 0,1,1.7,2.075
LOG: RESULT: 0,2,1.7,1.491
LOG: RESULT: 0,3,1.7,15.468
LOG: RESULT: 0,4,1.7,10.630
```
