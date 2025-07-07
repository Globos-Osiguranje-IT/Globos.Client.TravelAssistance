using Globos.Client.WebShop.HttpClients.Base;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.Collections;

namespace Globos.Client.WebShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseController : ControllerBase
    {
        private readonly ILogger _logger;
        private readonly IServiceProvider _sp;

        public BaseController(ILogger logger, IServiceProvider sp)
        {
            _logger = logger;
            _sp = sp;
        }

        protected string BaseUrl => $"{Request.Scheme}://{Request.Host}";
    }
}
