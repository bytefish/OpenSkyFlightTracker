// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace OpenSkyBackend.Contracts
{
    public class StateVectorDto
    {
        /// <summary>
        /// Unique ICAO 24-bit address of the transponder in hex string representation.
        /// </summary>
        [JsonPropertyName("icao24")]
        public string Icao24 { get; set; }

        /// <summary>
        /// Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
        /// </summary>
        [JsonPropertyName("callsign")]
        public string CallSign { get; set; }

        /// <summary>
        /// Country name inferred from the ICAO 24-bit address.
        /// </summary>
        [JsonPropertyName("origin_country")]
        public string OriginCountry { get; set; }

        /// <summary>
        /// Unix timestamp (seconds) for the last position update. Can be null if no position 
        /// report was received by OpenSky within the past 15s.
        /// </summary>
        [JsonPropertyName("time_position")]
        public int? TimePosition { get; set; }

        /// <summary>
        /// Unix timestamp (seconds) for the last update in general. This field is updated for 
        /// any new, valid message received from the transponder.
        /// </summary>
        [JsonPropertyName("last_contact")]
        public int? LastContact { get; set; }

        /// <summary>
        /// WGS-84 longitude in decimal degrees. Can be null.
        /// </summary>
        [JsonPropertyName("longitude")]
        public float? Longitude { get; set; }

        /// <summary>
        /// WGS-84 latitude in decimal degrees. Can be null.
        /// </summary>
        [JsonPropertyName("latitude")]
        public float? Latitude { get; set; }

        /// <summary>
        /// Barometric altitude in meters. Can be null.
        /// </summary>
        [JsonPropertyName("baro_altitude")]
        public float? BarometricAltitude { get; set; }

        /// <summary>
        /// Boolean value which indicates if the position was retrieved from a surface position report.
        /// </summary>
        [JsonPropertyName("on_ground")]
        public bool OnGround { get; set; }

        /// <summary>
        /// Velocity over ground in m/s. Can be null.
        /// </summary>
        [JsonPropertyName("velocity")]
        public float? Velocity { get; set; }

        /// <summary>
        /// True track in decimal degrees clockwise from north (north=0°). Can be null.
        /// </summary>
        [JsonPropertyName("true_track")]
        public float? TrueTrack { get; set; }

        /// <summary>
        /// Vertical rate in m/s. A positive value indicates that the airplane is climbing, 
        /// a negative value indicates that it descends. Can be null.
        /// </summary>
        [JsonPropertyName("vertical_rate")]
        public float? VerticalRate { get; set; }

        /// <summary>
        /// IDs of the receivers which contributed to this state vector. Is null if no filtering for sensor was used in the request.
        /// </summary>
        [JsonPropertyName("sensors")]
        public int[] Sensors { get; set; }

        /// <summary>
        /// Geometric altitude in meters. Can be null.
        /// </summary>
        [JsonPropertyName("geo_altitude")]
        public float? GeometricAltitudeInMeters { get; set; }

        /// <summary>
        /// The transponder code aka Squawk. Can be null.
        /// </summary>
        [JsonPropertyName("squawk")]
        public string Squawk { get; set; }

        /// <summary>
        /// Whether flight status indicates special purpose indicator.
        /// </summary>
        [JsonPropertyName("spi")]
        public bool Spi { get; set; }

        /// <summary>
        /// Origin of this state’s position: 0 = ADS-B, 1 = ASTERIX, 2 = MLAT
        /// </summary>
        [JsonPropertyName("position_source")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PositionSourceEnumDto PositionSource { get; set; }
    }
}
