# Hydrological Landscape Classes (HLC) Generator
Jupyter web app to generate and download Hydrological Landscape Classes via Google Earth Engine.

### If you want more flexibility, feel free to use the codes:
[Jupyter notebook](https://github.com/rbfont/hlc-generator/blob/main/HLC_map_download.ipynb) \
[Javascript code (GEE)](https://github.com/rbfont/hlc-generator/blob/main/load_hlc_gee.js)

## How Hydrological Landscape Classes (HLCs) are defined?
The HLC map is made using Terrain Classes (TC) and Land cover Classes (LC).

### TC map
The Terrain Classes (TC) map is made using local slope and Height Above Nearest Drainage (HAND). Local slope is used to separate the landscape into plateaus (lower values) and hillslopes (higher values) and HAND is used to identify wetlands (low HAND values). The slope can be obtained directly from the DEM. The HAND map computation requires, in addition to a DEM map, computed flow directions and a defined drainage network. In the HLC generator application, the user defines a DEM map to compute the slopes and an already computed HAND map.

![image](https://user-images.githubusercontent.com/83959435/119392605-587b4a00-bca6-11eb-9ca1-ab63b33a5923.png)

### LC map
The LC used for the HLC map composition is a reclassification of LC classification obtained from the databases available, in order to prioritize differences in hydrological behavior. That way, the final LC classes were (1) Forest, (2) Savanna-Grassland, (3) Farmland, (4) Semi-permeable and (5) Water. All forest formations were grouped in the Forest class. Savannas, grasslands and shrublands were grouped into the Savanna-Grassland class. Pastures and croplands were grouped into the Farmland class. Non-vegetated areas were grouped into the Semi-permeable class. And, finally, water bodies of any kind (rivers, lakes, etc) were grouped into the Water class. Yet, LC maps also have a Wetland class, but they were added to the class Savanna-Grassland, because wetlands are defined by the TC map.

### HLC map
The final HLC map is made with the two previous maps overlapped. Thus, forests in wetlands become wetland forests, in hillslopes they become hillslope forests, and so on. This happens except for the LCs Water and Semi-permeable, which do not dependent on TC.
