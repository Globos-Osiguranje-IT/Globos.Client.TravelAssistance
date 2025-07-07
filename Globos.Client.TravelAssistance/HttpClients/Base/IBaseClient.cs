using Newtonsoft.Json.Linq;

namespace Globos.Client.WebShop.HttpClients.Base
{
    public interface IBaseClient
    {
        Task<string> GetAsync(string url,
            IDictionary<string, string> queryParams = null,
            IDictionary<string, string> headers = null);

        Task<string> PostAsync(string url,
            dynamic body = null,
            IDictionary<string, string> headers = null);
    }
}
