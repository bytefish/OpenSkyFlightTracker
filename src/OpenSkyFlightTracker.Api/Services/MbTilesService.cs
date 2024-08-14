// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Microsoft.Data.Sqlite;
using OpenSkyFlightTracker.Api.Options;

namespace OpenSkyFlightTracker.Api.Services
{
    public class MapboxTileService
    {
        public byte[]? Read(Tileset tileset, int z, int x, int y)
        {
            using (var connection = new SqliteConnection($"Data Source={tileset.Filename}"))
            {
                connection.Open();

                var command = connection.CreateCommand();

                command.CommandText = "SELECT tile_data FROM tiles WHERE zoom_level = $level AND tile_column = $column AND tile_row = $row";

                command.Parameters.AddWithValue("$level", z);
                command.Parameters.AddWithValue("$column", x);
                command.Parameters.AddWithValue("$row", ReverseY(y, z));

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return GetBytes(reader);
                    }
                }
            }

            return null;
        }

        private static int ReverseY(int y, int z)
        {
            return (int)(Math.Pow(2.0d, z) - 1 - y);
        }

        private static byte[] GetBytes(SqliteDataReader reader)
        {
            byte[] buffer = new byte[2048];

            using (MemoryStream stream = new MemoryStream())
            {
                long bytesRead = 0;
                long fieldOffset = 0;

                while ((bytesRead = reader.GetBytes(0, fieldOffset, buffer, 0, buffer.Length)) > 0)
                {
                    stream.Write(buffer, 0, (int)bytesRead);
                    fieldOffset += bytesRead;
                }

                return stream.ToArray();
            }
        }
    }
}
