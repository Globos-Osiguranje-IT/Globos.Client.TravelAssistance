using System.Net;

namespace Globos.Client.WebShop.Models
{
    public class PrintModelResponse
    {
        public byte[] FileBytes { get; set; }
        public string ContentType { get; set; }
        public HttpStatusCode StatusCode { get; set; }
    }
}
