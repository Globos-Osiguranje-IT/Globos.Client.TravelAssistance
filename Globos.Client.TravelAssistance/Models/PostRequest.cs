namespace Globos.Client.WebShop.Models
{
    public class PostRequest
    {
        public PostRequest()
        {
            Headers = new Dictionary<string, string>();
        }

        public string Url { get; set; }
        public dynamic Body { get; set; }
        public IDictionary<string, string> Headers { get; set; }
    }
}
