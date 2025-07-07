using Globos.Client.WebShop.Config;
using Globos.Client.WebShop.HttpClients;
using Globos.Client.WebShop.HttpClients.Base;
using Globos.Logger.Config;
using Globos.Logger.LoggerProviders;
using Globos.Logger.Loggers;
using Globos.Logger.Services;
using Microsoft.Extensions.Options;
using Globos.Authorization;
using Globos.Authorization.Services;
using Microsoft.IdentityModel.Logging;

namespace Globos.Client.WebShop
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection ConfigureServices(this IServiceCollection services, IConfiguration configuration)
        {
            IdentityModelEventSource.ShowPII = true;
            return services
                .AddOptions()
                .AddGlobosAuthorizationServices(configuration)
                .AddAuthorizationCache(configuration.GetConnectionString(Constants.USER_DB)!)
                .AddHttpProxyClient<TravelHubClient>()
                .AddHttpClient<TravelHubClient>()
                .Services

                .AddHttpClientConfig<TravelHubClient>();
        }

        private static IServiceCollection AddHttpClientConfig<THttpClient>(this IServiceCollection services)
            where THttpClient : class, IBaseClient
        {
            return services
                .AddSingleton<IConfigureOptions<HttpClientOptions<THttpClient>>, HttpClientOptionsFactory<THttpClient>>();
        }

        public static void ConfigureLogging(this IServiceCollection services, IConfiguration configuration, ILoggingBuilder logging)
        {
            var loggerCfg = new LoggerConfig();
            configuration.GetSection(nameof(LoggerConfig))
                .Bind(loggerCfg);
            var loggerCfgOpts = Options.Create(loggerCfg!);
            services.AddSingleton<IRequestIdentifierService, RequestIdentifierService>(); // Obezbedi Scoped servis
            services.AddSingleton<ILoggerProvider>(sp =>
            {
                var config = sp.GetRequiredService<IOptions<LoggerConfig>>();
                var fileLogger = new FileLogger(loggerCfgOpts);
                var producerOptions = new List<MessageBroker.Options.Produce.ProducerConnectionaRabbitMQOptions>
                {
                    new ConfigureProducerConnectionaRabbitMQOptions(loggerCfgOpts).MapFromLoggerConfig()
                };
                return PublishLoggerProvider.New(loggerCfgOpts, producerOptions, sp); // Prosledi ServiceProvider
            });
        }

        private static IServiceCollection AddAuthorizationCache(this IServiceCollection services, string connectionString)
        {
            services.AddDistributedSqlServerCache(o =>
            {
                o.ConnectionString = connectionString;
                o.SchemaName = "dbo";
                o.TableName = "DistributedCaches";
            });

            return services;
        }
    }
}
