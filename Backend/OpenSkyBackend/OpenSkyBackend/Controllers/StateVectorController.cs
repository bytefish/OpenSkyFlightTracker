// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenSkyBackend.Contracts;
using OpenSkyBackend.Options;
using OpenSkyRestClient;
using OpenSkyRestClient.Model;
using OpenSkyRestClient.Model.Response;
using OpenSkyRestClient.Options;
using IOFile = System.IO.File;

namespace OpenSkyBackend.Controllers
{
    [ApiController]
    public class StateVectorController : ControllerBase
    {
        private readonly ILogger<StateVectorController> logger;
        private readonly ApplicationOptions applicationOptions;
        private readonly OpenSkyClient client;

        public StateVectorController(ILogger<StateVectorController> logger, IOptions<ApplicationOptions> applicationOptions, OpenSkyClient client)
        {
            this.logger = logger;
            this.applicationOptions = applicationOptions.Value;
            this.client = client;
        }

        [HttpGet]
        [Route("/states/all")]
        public async Task<IActionResult> Get([FromQuery] StateVectorsRequestDto request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                return BadRequest("Invalid Request");
            }

            // Prepare some data for the OpenSkyClient request:
            Credentials credentials = GetCredentials();
            BoundingBox boundingBox = GetBoundingBoxFromRequest(request);
            TimeSpan refreshInterval = GetRefreshInterval();

            Response.Headers.Add("Content-Type", "text/event-stream");
            Response.Headers.Add("Cache-Control", "no-cache");

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    // Get the data for the given Request:
                    var data = await GetDataAsync(request.Time, request.Icao24, boundingBox, credentials, cancellationToken);

                    if(data == null)
                    {
                        logger.LogInformation("No Data received. See Error Logs for details. Skipping Event ...");

                        continue;
                    }

                    // Serialize as a Json String:
                    var dataAsJson = JsonSerializer.Serialize(data);

                    // Send the data as JSON over the wire:
                    await Response.WriteAsync($"data: {dataAsJson}\r\r");

                    Response.Body.Flush();
                } 
                catch(Exception e)
                {
                    logger.LogError(e, "Requesting Data failed");
                }

                await Task.Delay(refreshInterval);
            }

            return Ok();
        }

        private BoundingBox GetBoundingBoxFromRequest(StateVectorsRequestDto request)
        {
            if (request == null)
            {
                return null;
            }

            if (request.LaMin.HasValue && request.LoMin.HasValue && request.LaMax.HasValue && request.LoMax.HasValue)
            {
                return new BoundingBox
                {
                    LaMin = request.LaMin.Value,
                    LoMin = request.LoMin.Value,
                    LaMax = request.LaMax.Value,
                    LoMax = request.LoMax.Value
                };
            }

            return null;
        }

        private Credentials GetCredentials()
        {
            if (applicationOptions == null)
            {
                return null;
            }

            var filename = applicationOptions.CredentialsFile;

            if (string.IsNullOrWhiteSpace(filename))
            {
                return null;
            }

            var content = IOFile.ReadAllText(applicationOptions.CredentialsFile);

            var document = JsonDocument.Parse(content);
            var element = document.RootElement;

            return new Credentials
            {
                Username = element.GetProperty("username").GetString(),
                Password = element.GetProperty("password").GetString()
            };
        }

        private TimeSpan GetRefreshInterval()
        {
            if (applicationOptions == null)
            {
                return TimeSpan.FromSeconds(10);
            }

            if (!applicationOptions.RefreshInterval.HasValue)
            {
                return TimeSpan.FromSeconds(10);
            }

            return TimeSpan.FromSeconds(applicationOptions.RefreshInterval.Value);
        }

        private async Task<StateVectorResponseDto> GetDataAsync(int? time, string icao24, BoundingBox boundingBox, Credentials credentials, CancellationToken cancellationToken)
        {
            try
            {
                var response = await client.GetAllStateVectorsAsync(time, icao24, boundingBox, credentials, cancellationToken);

                return ConvertStateVectorResponse(response);
            }
            catch (Exception e)
            {
                logger.LogError(e, $"Requesting Data failed (time = {time}, icao24 = {icao24}, bb({boundingBox?.LaMin},{boundingBox?.LoMin},{boundingBox?.LaMax},{boundingBox?.LoMax})");

                return null;
            }
        }

        private StateVectorResponseDto ConvertStateVectorResponse(StateVectorResponse response)
        {
            if(response == null)
            {
                return null;
            }

            return new StateVectorResponseDto
            {
                Time = response.Time,
                States = ConvertStates(response.States)
            };
        }

        private StateVectorDto[] ConvertStates(StateVector[] states)
        {
            if(states == null)
            {
                return null;
            }

            return states
                .Select(x => ConvertState(x))
                .ToArray();
        }

        private StateVectorDto ConvertState(StateVector state)
        {
            if(state == null)
            {
                return null;
            }

            return new StateVectorDto
            {
                BarometricAltitude = state.BarometricAltitude,
                CallSign = state.CallSign,
                GeometricAltitudeInMeters = state.GeometricAltitudeInMeters,
                Icao24 = state.Icao24,
                LastContact = state.LastContact,
                Latitude = state.Latitude,
                Longitude = state.Longitude,
                OnGround = state.OnGround,
                OriginCountry = state.OriginCountry,
                PositionSource = ConvertPositionSource(state.PositionSource),
                Sensors = state.Sensors,
                Spi = state.Spi,
                Squawk = state.Squawk,
                TimePosition = state.TimePosition,
                TrueTrack = state.TrueTrack,
                Velocity = state.Velocity,
                VerticalRate = state.VerticalRate
            };

            throw new NotImplementedException();
        }

        private PositionSourceEnumDto ConvertPositionSource(PositionSourceEnum? positionSource)
        {
            if(positionSource == null)
            {
                return PositionSourceEnumDto.Unknown;
            }

            switch(positionSource.Value)
            {
                case PositionSourceEnum.ASBD:
                    return PositionSourceEnumDto.ASBD;
                case PositionSourceEnum.ASTERIX:
                    return PositionSourceEnumDto.ASTERIX;
                case PositionSourceEnum.MLAT:
                    return PositionSourceEnumDto.MLAT;
                default:
                    return PositionSourceEnumDto.Unknown;
            }
        }
    }
}
