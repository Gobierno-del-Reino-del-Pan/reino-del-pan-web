
{
    "rewrites";[
        { "source": "/auth/(.*)", "destination": "/auth/$1" },
        { "source": "/api/(.*)", "destination": "/api/$1" },
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}