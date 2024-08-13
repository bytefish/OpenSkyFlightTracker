// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OpenSkyFlightTracker.Api.Dto;
using OpenSkyFlightTracker.Api.Options;
using OpenSkyRestClient;
using OpenSkyRestClient.Model;
using OpenSkyRestClient.Model.Response;
using OpenSkyRestClient.Options;
using IOFile = System.IO.File;

namespace OpenSkyFlightTracker.Api.Controllers
{
    [ApiController]
    public class StateVectorController : ControllerBase
    {
        private readonly ILogger<StateVectorController> _logger;
        private readonly ApplicationOptions _applicationOptions;
        private readonly OpenSkyClient _client;

        public StateVectorController(ILogger<StateVectorController> logger, IOptions<ApplicationOptions> applicationOptions, OpenSkyClient client)
        {
            _logger = logger;
            _applicationOptions = applicationOptions.Value;
            _client = client;
        }

        [HttpGet]
        [Route("/states")]
        public async Task GetStateVectorsAsync([FromQuery] StateVectorsRequestDto request, CancellationToken cancellationToken)
        {
            // Prepare some data for the OpenSkyClient request:
            var credentials = GetCredentials();
            var boundingBox = GetBoundingBoxFromRequest(request);
            var refreshInterval = GetRefreshInterval();

            Response.Headers.TryAdd("Content-Type", "text/event-stream");
            Response.Headers.TryAdd("Cache-Control", "no-cache");

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    // Get the data for the given Request:
                    var data = await GetDataAsync(request.Time, request.Icao24, boundingBox, credentials, cancellationToken);

                    if (data == null)
                    {
                        _logger.LogInformation("No Data received. See Error Logs for details. Skipping Event ...");

                        continue;
                    }

                    // Serialize as a Json String:
                    var dataAsJson = JsonSerializer.Serialize(data);

                    // Send the data as JSON over the wire:
                    await Response.WriteAsync($"data: {dataAsJson}\r\r", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Requesting Data failed");
                }

                await Task.Delay(refreshInterval);
            }
        }

        private Credentials GetCredentials()
        {
            return new Credentials
            {
                Username = _applicationOptions.OpenSkyUsername,
                Password = _applicationOptions.OpenSkyPassword
            };
        }

        private BoundingBox? GetBoundingBoxFromRequest(StateVectorsRequestDto request)
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

        private TimeSpan GetRefreshInterval()
        {
            _logger.LogInformation($"Refresh interval is {_applicationOptions.RefreshIntervalInMilliseconds} milliseconds.");

            return TimeSpan.FromMilliseconds(_applicationOptions.RefreshIntervalInMilliseconds);
        }

        private async Task<StateVectorResponseDto?> GetDataAsync(int? time, string? icao24, BoundingBox? boundingBox, Credentials credentials, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _client.GetAllStateVectorsAsync(time, icao24, boundingBox, credentials, cancellationToken);

                if(response == null)
                {
                    return null;
                }

                return ConvertStateVectorResponse(response);
            }
            catch (Exception e)
            {
                _logger.LogError(e, $"Requesting Data failed (time = {time}, icao24 = {icao24}, bb({boundingBox?.LaMin},{boundingBox?.LoMin},{boundingBox?.LaMax},{boundingBox?.LoMax})");

                return null;
            }
        }

        private StateVectorResponseDto ConvertStateVectorResponse(StateVectorResponse response)
        {
            return new StateVectorResponseDto
            {
                Time = response.Time,
                States = ConvertStates(response.States)
            };
        }

        private StateVectorDto[] ConvertStates(StateVector[] states)
        {
            return states
                .Select(x => ConvertState(x))
                .ToArray();
        }

        private StateVectorDto ConvertState(StateVector state)
        {
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
            if (positionSource == null)
            {
                return PositionSourceEnumDto.Unknown;
            }

            switch (positionSource.Value)
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
