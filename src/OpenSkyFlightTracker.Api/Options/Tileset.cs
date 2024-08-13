namespace OpenSkyFlightTracker.Api.Options
{
    public class Tileset
    {
        /// <summary>
        /// Path to the Dataset.
        /// </summary>
        public required string Filename { get; set; }

        /// <summary>
        /// The Content-Type to be served.
        /// </summary>
        public required string ContentType { get; set; }
    }
}
