using Globos.Client.WebShop.HttpClients.Base;

namespace Globos.Client.WebShop.Config
{
    public class HttpClientOptions<THttpClient>
        where THttpClient : class, IBaseClient
    {
        public string BaseUrl { get; set; }
    }
}
