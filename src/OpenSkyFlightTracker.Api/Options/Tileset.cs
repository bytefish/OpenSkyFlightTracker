// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace OpenSkyFlightTracker.Api.Options
{
    public class Tileset
    {
        /// <summary>
        /// Gets or sets the path to the MBTiles.
        /// </summary>
        public required string Filename { get; set; }

        /// <summary>
        /// Gets or sets the Content-Type to be served.
        /// </summary>
        public required string ContentType { get; set; }
    }
}
