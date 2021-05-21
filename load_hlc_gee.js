// Define region ID and scale of maps to download
var roi_id = 'Region of Interest';
var scale = 90;

// Define Region of interest (Polygon)
var roi = ee.FeatureCollection('projects/ee-rbfontana/assets/geoft_bho_2017_50k_area_drenagem')
          .filter(ee.Filter.inList('nunivotto5', ['44947', '44948', '44949']))
  ;

Map.centerObject(roi, 8);

// Define thresholds
var slp_th = 5;  // Slope threshold (in %) - if won't use, set to 999
var hand_th = 10; // HAND threshold (in m)
var lc_y = 2015; // Year of land cover classification

// Load raw maps ----------------------------------------------------------
// slope map
var dem = ee.Image("MERIT/DEM/v1_0_3");
var slp = ee.Terrain.slope(dem).divide(180).multiply(ee.Number(Math.PI)).tan().multiply(100);
var parvis = {'min': 0, 
          'max': 30, 
          'palette': ['f7fcf5', 'e5f5e0', 'c7e9c0', 'a1d99b', '74c476', '41ab5d', '238b45', '006d2c', '00441b']};
Map.addLayer(slp, parvis, 'Slope_90m');

// HAND map
var hand = ee.Image("projects/ee-rbfontana/assets/HAND_SA_merit_90m");

var parvis = {'min': 0, 
          'max': 50, 
          'palette': ['08519c', '3182bd', '6baed6', 'bdd7e7', 'eff3ff']};
Map.addLayer(hand, parvis, 'HAND_90m');

/**
# Mapbiomas Land Cover Classes
#    3 - Forest
#    4 - Savanna
#    5 - Mangrove
#    9 - Forest Plantation
#    10 - Non-Forest Natural
#    11 - Wetland
#    12 - Grassland
#    32 - Salt Flat
#    29 - Rocky Outcrop
#    13 - Other Non-Forest Natural
#    15 - Pasture
#    39 - Soy Bean
#    20 - Sugar Cane
#    41 - Other Temporary Crops
#    36 - Perennial Crop
#    21 - Mosaic Agriculture and Plasture
#    23 - Beach and Dune
#    24 - Urban
#    30 - Minning
#    25 - Other Non-Vegetated
#    33 - Water Body
#    31 - Aquaculture

# Classes simplified
# 1: Forest / 2: Savanna-Grassland / 3: Farmland / 4: Semi-permeable / 5: Water
*/
var map_classes = [3, 4, 5, 9, 10, 11, 12, 13, 15, 39, 20, 41, 36, 21, 23, 24, 25, 29, 30, 31, 32, 33];
var new_classes = [1, 2, 1, 1,  2,  5,  2,  2,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  5,  4,  5];

var lc = (ee.Image('projects/mapbiomas-workspace/public/collection5/mapbiomas_collection50_integration_v1')
      .select(ee.String('classification_').cat(ee.Number(lc_y).format('%d')))
      .remap(map_classes, new_classes)
     );

var parvis = {'palette': ['brown', 'green', 'yellow', 'cyan', 'grey',  'blue']};
Map.addLayer(lc, parvis, 'Land Cover Classes');


// Load Hydrological Landscape maps ----------------------------------------------------------
// Relief classes (only HAND and slope)
// 1: Wetland / 2: Plateau / 3: Hillslope
var tc = ee.Image(1).where(
    slp.lte(slp_th).and(hand.gt(hand_th)), 2).where(
    slp.gte(slp_th).and(hand.gt(hand_th)), 3);

var parvis = {'palette': ['blue', 'green', 'red']};
Map.addLayer(tc, parvis, 'Terrain Classes');

// HAND + slope + Land cover
/*
 11: Wetland Forest
 12: Wetland Savanna-Grassland
 13: Wetland Farmland
 21: Plateau Forest
 22: Plateau Savanna-Grassland
 23: Plateau Farmland
 31: Hillslope Forest
 32: Hillslope Savanna-Grassland
 33: Hillslope Farmland
 40: Semi-permeable
 50: Water
*/
var hlc = tc.multiply(10).addBands(lc).reduce(ee.Reducer.sum());
hlc = hlc.where(
    hlc.remap([14, 24, 34], [1, 1, 1]), 40).where(
    hlc.remap([15, 25, 35], [1, 1, 1]), 50);
hlc = hlc.remap([11, 12, 13, 21, 22, 23, 31, 32, 33, 40, 50],
                        [ 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11]);

var hlc_color = [
    "#152106",
    "#387242",
    "#d9903d",
    "#225129",
    "#c3aa69",
    "#cdb33b",
    "#6a2325",
    "#369b47",
    "#91af40",
    "#cc0013",
    "#aec3d4"
    ];
var hlc_class = [
    "Wetland Forest",
    "Wetland Savanna-Grassland",
    "Wetland Farmland",
    "Plateau Forest",
    "Plateau Savanna-Grassland",
    "Plateau Farmland",
    "Hillslope Forest",
    "Hillslope Savanna-Grassland",
    "Hillslope Farmland",
    "Semi-permeable",
    "Water"
    ];
    
var hlc_intervals =
'<RasterSymbolizer>' +
  '<ColorMap type="intervals" extended="false">' +
    '<ColorMapEntry color="#152106" quantity="11" label="Wetland Forest"/>' +
    '<ColorMapEntry color="#387242" quantity="12" label="Wetland Savanna-Grassland"/>' +
    '<ColorMapEntry color="#d9903d" quantity="13" label="Wetland Farmland"/>' +
    '<ColorMapEntry color="#225129" quantity="21" label="Plateau Forest"/>' +
    '<ColorMapEntry color="#c3aa69" quantity="22" label="Plateau Savanna-Grassland"/>' +
    '<ColorMapEntry color="#cdb33b" quantity="23" label="Plateau Farmland"/>' +
    '<ColorMapEntry color="#6a2325" quantity="31" label="Hillslope Forest"/>' +
    '<ColorMapEntry color="#369b47" quantity="32" label="Hillslope Savanna-Grassland"/>' +
    '<ColorMapEntry color="#91af40" quantity="33" label="Hillslope Farmland"/>' +
    '<ColorMapEntry color="#cc0013" quantity="40" label="Semi-permeable"/>' +
    '<ColorMapEntry color="#aec3d4" quantity="50" label="Water"/>' +
  '</ColorMap>' +
'</RasterSymbolizer>';
Map.addLayer(hlc, {'palette': hlc_color}, 'Hydrological Landscape Classes');

var panel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '5px;'
  }
})

var title = ui.Label({
  value: 'Hydrological Landscape Classes',
  style: {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0px;'
  }
})

panel.add(title)

var list_legend = function(color, description) {
  
  var c = ui.Label({
    style: {
      backgroundColor: color,
      padding: '10px',
      margin: '4px'
    }
  });
  
  var ds = ui.Label({
    value: description,
    style: {
      margin: '5px'
    }
  });
  
  return ui.Panel({
    widgets: [c, ds],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

for(var a = 0; a < 11; a++){
  panel.add(list_legend(hlc_color[a], hlc_class[a]));
}

Map.add(panel);

Map.addLayer(roi.union(), {}, roi_id);

// Export maps -----------------------------------------------------------
var refpoly = roi.geometry().bounds().buffer(3000); // add 1km buffer to region

Export.image.toDrive({
          'image': dem.float(),
          'description': 'dem',
          'folder': roi_id,
          'scale': scale,
          'region': refpoly,
          'maxPixels': 1e12
          });

Export.image.toDrive({
          'image': slp.float(),
          'description': 'slp',
          'folder': roi_id,
          'scale': scale,
          'region': refpoly,
          'maxPixels': 1e12
          });

Export.image.toDrive({
          'image': hand.float(),
          'description': 'hand',
          'folder': roi_id,
          'scale': scale,
          'region': refpoly,
          'maxPixels': 1e12
          });

Export.image.toDrive({
          'image': tc.int(),
          'description': 'tc',
          'folder': roi_id,
          'scale': scale,
          'region': refpoly,
          'maxPixels': 1e12
          });

Export.image.toDrive({
          'image': lc.int(),
          'description': 'lcover',
          'folder': roi_id,
          'scale': scale,
          'region': refpoly,
          'maxPixels': 1e12
          });

Export.image.toDrive({
          'image': hlc.int(),
          'description': 'hlc',
          'folder': roi_id,
          'scale': scale,
          'region': refpoly,
          'maxPixels': 1e12
          });
  
  
  
  
  
