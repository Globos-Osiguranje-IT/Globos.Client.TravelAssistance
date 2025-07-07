using System.Net;
using Globos.Client.WebShop.HttpClients;
using Globos.Client.WebShop.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace Globos.Client.WebShop.Controllers
{
    [ApiController]
    //[Authorize(AuthenticationSchemes = Constants.TravelCCOidcScheme)]
    [Route("[controller]")]
    public class TravelController : BaseController
    {
        private readonly TravelHubClient travelHub;

        public TravelController(
            ILogger<TravelController> logger, 
            IServiceProvider sp,
            TravelHubClient travelHub) : base(logger, sp)
        {
            this.travelHub = travelHub;
        }

        [HttpPost]
        [Route("GetRequest")]
        public async Task<IActionResult> Get(GetRequest request)
        {
            var response = await travelHub
                .GetAsync(request.Url, request.QueryParams, request.Headers);

            return Content(response, "application/json");
        }

        [HttpPost]
        [Route("PostRequest")]
        public async Task<IActionResult> Post(PostRequest request)
        {
            var response = await travelHub
                .PostAsync(request.Url, request.Body, request.Headers);

            return Content(response, "application/json");
        }

        [HttpPost("PrintPreview")]
        [Route("PrintPreviewPostRequest")]

        public async Task<IActionResult> PrintPreviewPolicy(PostRequest request)
        {
            var response = await travelHub
                .PostAsyncBlob(request.Url, request.Body, request.Headers);

            string contentType = response.ContentType;
            byte[] fileBytes = response.FileBytes;
            HttpStatusCode statusCode = response.StatusCode;

            return File(fileBytes, contentType);
        }
    }
}
