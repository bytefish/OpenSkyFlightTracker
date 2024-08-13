// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OpenSkyFlightTracker.Api.Options;
using OpenSkyFlightTracker.Api.Services;

namespace OpenSkyFlightTracker.Api.Controllers
{
    [ApiController]
    public class TilesController : ControllerBase
    {
        private readonly ILogger<TilesController> _logger;

        private readonly ApplicationOptions _applicationOptions;
        private readonly MapboxTileService _mapboxTileService;

        public TilesController(ILogger<TilesController> logger, IOptions<ApplicationOptions> applicationOptions, MapboxTileService mapboxTileService)
        {
            _logger = logger;
            _applicationOptions = applicationOptions.Value;
            _mapboxTileService = mapboxTileService;
        }

        [HttpGet]
        [Route("/tiles/{tileset}/{z}/{x}/{y}")]
        public ActionResult Get([FromRoute(Name = "tileset")] string tiles, [FromRoute(Name = "z")] int z, [FromRoute(Name = "x")] int x, [FromRoute(Name = "y")] int y)
        {
            _logger.LogDebug($"Requesting Tiles (tileset = {tiles}, z = {z}, x = {x}, y = {y})");

            if (!_applicationOptions.Tilesets.TryGetValue(tiles, out Tileset? tileset))
            {
                _logger.LogWarning($"No Tileset available for Tileset '{tiles}'");

                return BadRequest();
            }

            var data = _mapboxTileService.Read(tileset, z, x, y);

            if (data == null)
            {
                return Accepted();
            }

            // Mapbox Vector Tiles are already compressed, so we need to tell 
            // the client we are sending gzip Content:
            if (tileset.ContentType == Constants.MimeTypes.ApplicationMapboxVectorTile)
            {
                Response.Headers.TryAdd("Content-Encoding", "gzip");
            }

            return new FileContentResult(data, tileset.ContentType);
        }
    }
}