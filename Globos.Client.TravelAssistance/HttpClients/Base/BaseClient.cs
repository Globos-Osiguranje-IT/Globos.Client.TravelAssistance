using Globos.Client.WebShop.Config;
using Globos.Client.WebShop.Models;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Text;

namespace Globos.Client.WebShop.HttpClients.Base
{
    public class BaseClient<THttpClient> : IBaseClient
        where THttpClient : class, IBaseClient
    {
        private readonly HttpClient _httpClient;

        public BaseClient(HttpClient httpClient, IOptions<HttpClientOptions<THttpClient>> options)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(options.Value.BaseUrl);
        }

        public async Task<string> GetAsync(string url, IDictionary<string, string> queryParams = null, IDictionary<string, string> headers = null)
        {
            var message = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = queryParams == null ? NewUri(url) : NewUri(url, queryParams)
            };

            InitHeaders(headers, message);
            var response = await _httpClient.SendAsync(message);

            //response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            return responseContent;
        }

        public async Task<string> PostAsync(string url, dynamic body = null, IDictionary<string, string> headers = null)
        {
            var message = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = NewUri(url),
                Content = (body == null) ?
                    new StringContent(null, Encoding.UTF8, "application/json") :
                    new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json")
            };

            InitHeaders(headers, message);
            var response = await _httpClient.SendAsync(message);

            // TODO LC: Custom EnsureSuccessStatusCode
            //response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            return responseContent;
        }

        public async Task<PrintModelResponse> PostAsyncBlob(string url, dynamic body = null, IDictionary<string, string> headers = null)
        {
            var message = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = NewUri(url),
                Content = (body == null) ?
            new StringContent(null, Encoding.UTF8, "application/json") :
            new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json")
            };

            InitHeaders(headers, message);

            var response = await _httpClient.SendAsync(message);
            response.EnsureSuccessStatusCode();

            var fileBytes = await response.Content.ReadAsByteArrayAsync();
            var contentType = response.Content.Headers.ContentType?.ToString() ?? "application/pdf";

            PrintModelResponse result = new PrintModelResponse
            {
                ContentType = contentType,
                FileBytes = fileBytes,
                StatusCode = HttpStatusCode.OK
            };

            return result;
        }

        private void InitHeaders(IDictionary<string, string> headers, HttpRequestMessage message)
        {
            _httpClient.DefaultRequestHeaders.Clear();
            foreach (var header in headers ?? new Dictionary<string, string>())
                message.Headers.Add(header.Key, header.Value);

        }

        private Uri NewUri(string url) => new Uri(FormatUri(url));
        
        private Uri NewUri(string url, IDictionary<string, string> parameters)
            => new Uri(FormatUri($"{url}{ToQueryString3(parameters)}"));

        private string ToQueryString1(IDictionary<string, string> parameters)
            => "?" + string.Join("&", parameters.Select(s => $"{s.Key}={s.Value}"));

        private string ToQueryString2(IDictionary<string, string> parameters)
            => "/" + string.Join("/", parameters.Select(s => $"{s.Key}/{s.Value}"));

        private string ToQueryString3(IDictionary<string, string> parameters)
            => "/" + string.Join("/", parameters.Select(s => $"{s.Value}"));

        private string FormatUri(string uri)
        {
            var baseAddress = _httpClient.BaseAddress!.ToString();

            if (baseAddress.EndsWith('/'))
                baseAddress = baseAddress.Remove(baseAddress.Length - 1, 1);

            return baseAddress + $"/api/{uri}".Replace("//", "/");

        }
    }
}
