-- Seed default citation directories
INSERT INTO directories (id, name, slug, type, api_config, rate_limits, health_status, paused)
VALUES
  (
    gen_random_uuid(),
    'Bing Places',
    'bing-places',
    'file_export',
    '{"submitUrl": "https://www.bingplaces.com", "exportFormat": "csv"}',
    '{"requestsPerMinute": 10, "delayMs": 6000}',
    'healthy',
    false
  ),
  (
    gen_random_uuid(),
    'Yelp',
    'yelp',
    'browser',
    '{"loginUrl": "https://biz.yelp.com/login", "submitUrl": "https://biz.yelp.com/claim"}',
    '{"requestsPerMinute": 6, "delayMs": 10000}',
    'healthy',
    false
  ),
  (
    gen_random_uuid(),
    'Facebook Business',
    'facebook',
    'browser',
    '{"loginUrl": "https://www.facebook.com/login", "submitUrl": "https://www.facebook.com/pages/create"}',
    '{"requestsPerMinute": 4, "delayMs": 15000}',
    'healthy',
    false
  ),
  (
    gen_random_uuid(),
    'Google Business Profile',
    'google-business',
    'browser',
    '{"loginUrl": "https://business.google.com", "submitUrl": "https://business.google.com/create"}',
    '{"requestsPerMinute": 6, "delayMs": 10000}',
    'healthy',
    false
  ),
  (
    gen_random_uuid(),
    'Apple Maps',
    'apple-maps',
    'api',
    '{"submitUrl": "https://mapsconnect.apple.com"}',
    '{"requestsPerMinute": 10, "delayMs": 6000}',
    'healthy',
    false
  ),
  (
    gen_random_uuid(),
    'Yellow Pages',
    'yellow-pages',
    'browser',
    '{"loginUrl": "https://adsolutions.yp.com/login", "submitUrl": "https://adsolutions.yp.com/listings"}',
    '{"requestsPerMinute": 6, "delayMs": 10000}',
    'healthy',
    false
  )
ON CONFLICT (slug) DO NOTHING;
