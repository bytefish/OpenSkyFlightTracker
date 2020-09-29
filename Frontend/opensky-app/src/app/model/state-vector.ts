export enum PositionSourceEnum {
    // Unknown.
    Unknown = "Unknown",
    // ASBD.
    ASBD = "ASBD",
    //ASTERIX.
    ASTERIX = "ASTERIX",
    // MLAT.
    MLAT = "MLAT"
};

export interface StateVectorResponse {
    
    // The time which the state vectors in this response are associated with. All vectors 
    // represent the state of a vehicle with the interval [time−1, time].
    time: number;

    // The state vectors.    
    states: Array<StateVector>;
}

export interface StateVector {
        // Unique ICAO 24-bit address of the transponder in hex string representation.
        icao24: string;

        // Callsign of the vehicle (8 chars). Can be null if no callsign has been received.
        callsign: string;

        // Country name inferred from the ICAO 24-bit address.
        origin_country: string;
        
        // Unix timestamp (seconds) for the last position update. Can be null if no position 
        // report was received by OpenSky within the past 15s.
        time_position?:number;

        // Unix timestamp (seconds) for the last update in general. This field is updated for 
        // any new, valid message received from the transponder.
        last_contact?: number;

        // WGS-84 longitude in decimal degrees. Can be null.
        longitude?: number;

        // WGS-84 latitude in decimal degrees. Can be null.
        latitude?: number;

        // Barometric altitude in meters. Can be null.
        baro_altitude?: number;

        // Boolean value which indicates if the position was retrieved from a surface position report.
        on_ground: boolean;

        // Velocity over ground in m/s. Can be null.
        velocity?: number;

        // True track in decimal degrees clockwise from north (north=0°). Can be null.
        true_track?: number;

        // Vertical rate in m/s. A positive value indicates that the airplane is climbing, 
        // a negative value indicates that it descends. Can be null.
        vertical_rate?: number;

        // IDs of the receivers which contributed to this state vector. Is null if no filtering for sensor was used in the request.
        sensors?: Array<number>;

        // Geometric altitude in meters. Can be null.
        geo_altitude?: number;

        // The transponder code aka Squawk. Can be null.
        squawk: string;

        // Whether flight status indicates special purpose indicator.
        spi: boolean;

        // Origin of this state’s position: 0 = ADS-B, 1 = ASTERIX, 2 = MLAT
        position_source: PositionSourceEnum;
};