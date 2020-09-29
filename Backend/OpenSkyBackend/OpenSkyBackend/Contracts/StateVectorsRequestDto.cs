// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.AspNetCore.Mvc;

namespace OpenSkyBackend.Contracts
{
    public class StateVectorsRequestDto
    {
        [FromQuery(Name = "time")]
        public int? Time { get; set; }

        [FromQuery(Name = "icao24")]
        public string Icao24 { get; set; }

        [FromQuery(Name = "lamin")]
        public float? LaMin { get; set; }

        [FromQuery(Name = "lomin")]
        public float? LoMin { get; set; }

        [FromQuery(Name = "lamax")]
        public float? LaMax { get; set; }

        [FromQuery(Name = "lomax")]
        public float? LoMax { get; set; }
    }
}
