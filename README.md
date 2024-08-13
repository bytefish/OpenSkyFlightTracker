# OpenSkyFlightTracker #

This application implements a Backend and Frontend for a flight tracker using the OpenSky Network REST API, 
ASP.NET Core, Angular and MapLibre GL JS. It uses Server-Sent Events to push data from the Backend to the 
Frontend. 

## What's included ##

It's a Flight Tracker, that periodically calls the OpenSky Network API and displays the planes on a map:

<a href="https://raw.githubusercontent.com/bytefish/OpenSkyFlightTracker/master/doc/OpenSkyFlightTracker_Flights.jpg">
    <img src="https://raw.githubusercontent.com/bytefish/OpenSkyFlightTracker/master/doc/OpenSkyFlightTracker_Flights.jpg" alt="The final flight tracker" width="100%" />
</a>

## Getting started ##

Getting started is as simple as running:

```
docker-compose --profile dev up
```

Navigate to `https://localhost:5001` and you'll see planes flying around.

### Setting the OpenSky Credentials ###

The safest way to pass the OpenSky Username and Password down to the Docker container is to 
use the User Secrets. In Visual Studio Right-Click on the `OpenSkyFlightTracker.Api`, select 
`Manage User Secrets` and add the Credentials like this:

```json
{
  "Application": {
    "OpenSkyUsername": "<your-username>",
    "OpenSkyPassword": "<your-password>"
  }
}
```

You can also put this in the `appsettings.Docker.json`, but you don't want to accidentally 
commit it, so you should prefer the User Secrets approach.

### Vector Tiles ###

But the map is only... gray? You'll need tiles for the map! 

I am using the Vector Tiles of Münster (Germany):

* [https://data.maptiler.com/downloads/europe/germany/nordrhein-westfalen/muenster-regbez/](https://data.maptiler.com/downloads/europe/germany/nordrhein-westfalen/muenster-regbez/)

And for the Natural Earth Relief I am using the following tiles:

* [https://github.com/lukasmartinelli/naturalearthtiles/releases/download/v1.0/natural_earth_2_shaded_relief.raster.mbtiles](https://github.com/lukasmartinelli/naturalearthtiles/releases/download/v1.0/natural_earth_2_shaded_relief.raster.mbtiles)

Put these files into the folder `docker/opensky-tiles`.

If you want to use different tiles you can configure them in `Application:Tilesets` section of the `appsettings.json`:

```json
  "Application": {
    "Tilesets": {
      "openmaptiles": {
        "Filename": "/opensky-tiles/osm-2020-02-10-v3.11_nordrhein-westfalen_muenster-regbez.mbtiles",
        "ContentType": "application/vnd.mapbox-vector-tile"
      },
      "natural_earth_2_shaded_relief.raster": {
        "Filename": "/opensky-tiles/natural_earth_2_shaded_relief.raster.mbtiles",
        "ContentType": "image/png"
      }
  },
```

### 