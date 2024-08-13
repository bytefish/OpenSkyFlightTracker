// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace OpenSkyFlightTracker.Api.Options
{
    public class ApplicationOptions
    {
        /// <summary>
        /// Gets or sets the Path to the Mapbox Tiles.
        /// </summary>
        public required string MbTilesPath { get; set; }

        /// <summary>
        /// Gets or sets the path to the OpenSky Credentials.
        /// </summary>
        public string? CredentialsFile { get; set; }

        /// <summary>
        /// Gets or sets the interval for refreshing the data (in Milliseconds).
        /// </summary>
        public required int RefreshIntervalInMilliseconds { get; set; } = 10_000;

        /// <summary>
        /// Gets or sets the Tilesets available.
        /// </summary>
        public Dictionary<string, Tileset> Tilesets { get; set; } = new();
    }
}
