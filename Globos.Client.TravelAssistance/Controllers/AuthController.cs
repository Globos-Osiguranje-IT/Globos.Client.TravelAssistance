using Globos.Authorization.Config;
using Globos.Authorization.Services.Abstraction;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Globos.Client.WebShop.Controllers
{
    [Route("[controller]")]
    public class AuthController : BaseController
    {
        private readonly IOptions<IdentityProviderOptions> _idpOptions;
        private readonly IIDPTokenManagerService _tokenManagerService;

        public AuthController(
            ILogger<AuthController> logger, 
            IServiceProvider sp, 
            IOptions<IdentityProviderOptions> idpOptions,
            IIDPTokenManagerService tokenManagerService) : base(logger, sp)
        {
            _idpOptions = idpOptions;
            _tokenManagerService = tokenManagerService;
        }

        [HttpGet]
        [Route("login")]
        public IActionResult Login()
        {
            return Redirect("/");
        }

        [HttpGet]
        [Route("logoutredirect")]
        public async Task<IActionResult> LogoutRedirect()
        {
            string oidcScheme = await GetOidcSchemeOrDefault();

            var clientCredentials = _idpOptions.Value
                .FindByOidcSchemaOrDefault(oidcScheme)?.ClientSettings;

            await Logout();

            return SignOut(new AuthenticationProperties 
            { 
                RedirectUri = BaseUrl
            }, oidcScheme);
        }


        [HttpPost]
        [Authorize]
        [Route("logout")]
        public async Task Logout()
        {
            string oidcScheme = await GetOidcSchemeOrDefault();

            var clientCredentials = _idpOptions.Value
                .FindByOidcSchemaOrDefault(oidcScheme)?.ClientSettings;

            if (clientCredentials == null)
                return;

            await _tokenManagerService.RevokeTokensSafeAsync();

            await HttpContext.SignOutAsync(clientCredentials.CookieScheme);
            await HttpContext.SignOutAsync(clientCredentials.OidcScheme);
        }

        private async Task<string?> GetOidcSchemeOrDefault()
        {
            var authResult = await HttpContext.AuthenticateAsync();
            return authResult?.Properties?.Items[".AuthScheme"];
        }
    }
}
