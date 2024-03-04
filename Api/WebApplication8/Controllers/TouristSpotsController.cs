using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Newtonsoft.Json;

namespace PlacesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlacesController : ControllerBase
    {
        private static readonly HttpClient client = new HttpClient();
        private static string apiKey = "";

        // GET api/places
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Place>>> Get()
        {
            var places = new string[]
            {
                "Kopiec Koœciuszki",
                "Koœció³ Mariacki Kraków",
                "Fabryka Emalia Oskara Schindlera",
                "Katedra na Wawelu",
                "Sukiennice"
            };

            var placeInfos = new List<Place>();

            foreach (var place in places)
            {
                var placeInfo = await GetPlaceInfo(place);
                placeInfos.Add(placeInfo);
            }

            return placeInfos;
        }

        private static async Task<Place> GetPlaceInfo(string placeName)
        {
            var responseString = await client.GetStringAsync($"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={placeName}&inputtype=textquery&fields=photos,name,geometry,type,formatted_address,rating&key={apiKey}&language=pl");
            dynamic response = JsonConvert.DeserializeObject(responseString);
            var formattedAddress = (string)response.candidates[0].formatted_address;
            var addressComponents = formattedAddress.Split(',');
            var city = addressComponents.Length > 1 ? addressComponents[1].Trim() : "";
            var cityWithoutPostalCode = city.Split(' ')[1];
            var country = addressComponents.Length > 1 ? addressComponents[2].Trim() : "";

            return new Place
            {

                Name = response.candidates[0].name,
                PhotoReference = response.candidates[0].photos[0].photo_reference,
                Latitude = response.candidates[0].geometry.location.lat,
                Longitude = response.candidates[0].geometry.location.lng,
                Type = response.candidates[0].types[0],
                City = cityWithoutPostalCode,
                Country = country,
                Rating = response.candidates[0].rating != null ? (double)response.candidates[0].rating : 0.0,
            };
        }
    }

    public class Place
    {
        private static int nextId = 1;
        private static double nextTime = 1;
        public int Id { get; private set; }
        public string Name { get; set; }
        public string PhotoReference { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Type { get; set; }
        public string City { get; set; }
        public string Country { get;  set; }
        public double Rating { get; set; } // Dodane pole dla oceny

        public double Time { get; set; }
        public Place()
        {   

            Id = nextId;
            nextId = (nextId % 5) + 1;

            Time = nextTime;
            nextTime = (nextTime % 3.5) + 0.5;

        }
    }

}
