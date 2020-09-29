// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace OpenSkyBackend.Contracts
{
    public class StateVectorResponseDto
    {
        /// <summary>
        /// The time which the state vectors in this response are associated with. All vectors 
        /// represent the state of a vehicle with the interval [time−1, time].
        /// </summary>
        [JsonPropertyName("time")]
        public int Time { get; set; }

        /// <summary>
        /// The state vectors.
        /// </summary>
        [JsonPropertyName("states")]
        public StateVectorDto[] States { get; set; }
    }
}
