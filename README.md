# OpenSkyFlightTracker #

This application implements a Backend and Frontend for a flight tracker using the OpenSky Network REST API, 
ASP.NET Core, Angular and Mapbox GL JS. It uses Server-Sent Events to push data from the Backend to the 
Frontend. 

The final result looks like this:

<div style="display:flex; align-items:center; justify-content:center;">
    <a href="https://www.bytefish.de/static/images/blog/opensky_network_flight_tracker/final_app_screenshot.jpg">
        <img src="https://www.bytefish.de/static/images/blog/opensky_network_flight_tracker/final_app_screenshot.jpg">
    </a>
</div>


## Running the OpenSkyFlightTracker ##

The example consists of running two applications. The first one is the actual Flight Tracker, which is needed 
to get the position data of the flights. The second one is the Tile Server to display the map.

Once you have the server up and running you reach the Angular Frontend using:

* http://localhost:4200

### OpenSkyFlight Tracker ###

The OpenSkyFlightTracker can be found in the GitHub repository at:

* [https://github.com/bytefish/OpenSkyFlightTracker](https://github.com/bytefish/OpenSkyFlightTracker)

#### Running the Backend and Frontend ####

You can start it by running the ``docker-compose`` command in the folder [Docker folder](https://github.com/bytefish/MapboxTileServer/tree/master/Docker):

```
docker-compose up --detach --no-deps --build
```


### Tile Server ###

The .NET Tile Server can be found in the GitHub repository at:

* [https://github.com/bytefish/MapboxTileServer](https://github.com/bytefish/MapboxTileServer)

#### Starting the Tile Server ####

You can start it by running the ``docker-compose`` command in the folder [Docker folder](https://github.com/bytefish/MapboxTileServer/tree/master/Docker):

```
docker-compose up --detach --no-deps --build
```

#### Configuring the Tile Server ####

The Backend is configured to load the OpenMapTiles from the file ``/Tiles/2017-07-03_europe_germany.mbtiles``, which 
you can configure to any other filename by changing the ``appsettings.json`` of the Server:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "Application": {
    "SchemaDirectory": "/static/schemas",
    "Photon": {
      "ApiUrl": "http://localhost:2322/api"
    },
    "Tilesets": {
      "openmaptiles": {
        "Filename": "/Tiles/2017-07-03_europe_germany.mbtiles",
        "ContentType": "application/vnd.mapbox-vector-tile"
      },
      "natural_earth_2_shaded_relief.raster": {
        "Filename": "/Tiles/natural_earth_2_shaded_relief.raster.mbtiles",
        "ContentType": "image/png"
      }
    }
  },
  "AllowedHosts": "*"
}
```

The ``/Tiles`` volume is mounted in the ``docker-compose.yaml``, you might configure it:

```yaml
version: '3.0'
services:
  mapbox_tileserver:
    container_name: mapbox_tileserver
    build: 
        context: ../MapboxTileServer
        dockerfile: ../Docker/mapbox_tileserver/Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Linux
    volumes:
      - G:/Tiles:/Tiles
    ports:
      - 9000:9000
```
