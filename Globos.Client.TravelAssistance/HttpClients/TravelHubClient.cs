using Globos.Client.WebShop.Config;
using Globos.Client.WebShop.HttpClients.Base;
using Microsoft.Extensions.Options;

namespace Globos.Client.WebShop.HttpClients
{
    public class TravelHubClient : BaseClient<TravelHubClient>
    {
        public TravelHubClient(
            HttpClient httpClient, 
            IOptions<HttpClientOptions<TravelHubClient>> options) : base(httpClient, options)
        {
        }
    }
}
