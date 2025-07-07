namespace Globos.Client.WebShop.Models
{
    public class GetRequest
    {
        public GetRequest()
        {
            QueryParams = new Dictionary<string, string>();
            Headers = new Dictionary<string, string>();
        }

        public string Url { get; set; }
        public IDictionary<string, string> QueryParams { get; set; }
        public IDictionary<string, string> Headers { get; set; }
    }
}
