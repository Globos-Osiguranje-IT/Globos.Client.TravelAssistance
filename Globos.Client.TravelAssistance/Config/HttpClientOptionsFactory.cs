using Globos.Client.WebShop.HttpClients.Base;
using Microsoft.Extensions.Options;

namespace Globos.Client.WebShop.Config
{
    public class HttpClientOptionsFactory<THttpClient> : IConfigureOptions<HttpClientOptions<THttpClient>>
        where THttpClient : class, IBaseClient
    {
        private readonly IConfiguration _configuration;

        public HttpClientOptionsFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void Configure(HttpClientOptions<THttpClient> options)
        {
            var name = typeof(THttpClient).Name;
            _configuration.Bind(name, options);
        }
    }
}
