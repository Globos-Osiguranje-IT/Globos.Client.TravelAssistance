using Newtonsoft.Json.Linq;

namespace Globos.Client.WebShop
{
    public static class Extensions
    {
        public static dynamic ToDynamic(this JToken token)
        {
            if (token == null)
                return null;

            if (token.Type == JTokenType.Object || token.Type == JTokenType.Array)
                return token.ToObject<dynamic>();
            else
                return ((JValue)token).Value;
        }
    }
}