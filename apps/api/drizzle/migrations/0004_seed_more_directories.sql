-- Seed additional citation directories (Tier 2 aggregators + high-value free directories)
INSERT INTO directories (id, name, slug, type, api_config, rate_limits, health_status, paused)
VALUES
  -- Data aggregators
  (gen_random_uuid(), 'Foursquare', 'foursquare', 'browser',
   '{"loginUrl": "https://foursquare.com/login", "submitUrl": "https://foursquare.com/add-place"}',
   '{"requestsPerMinute": 6, "delayMs": 10000}', 'healthy', false),

  (gen_random_uuid(), 'Data Axle', 'data-axle', 'api',
   '{"submitUrl": "https://www.data-axle.com/make-an-inquiry/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'Neustar Localeze', 'neustar-localeze', 'api',
   '{"submitUrl": "https://www.neustarlocaleze.biz/directory/us/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  -- High-DA free directories
  (gen_random_uuid(), 'Better Business Bureau', 'bbb', 'browser',
   '{"loginUrl": "https://www.bbb.org/business-login", "submitUrl": "https://www.bbb.org/request/accreditation"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'MapQuest', 'mapquest', 'browser',
   '{"submitUrl": "https://business.mapquest.com/"}',
   '{"requestsPerMinute": 6, "delayMs": 10000}', 'healthy', false),

  (gen_random_uuid(), 'Nextdoor', 'nextdoor', 'browser',
   '{"loginUrl": "https://nextdoor.com/login/", "submitUrl": "https://business.nextdoor.com/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'LinkedIn Company', 'linkedin', 'browser',
   '{"loginUrl": "https://www.linkedin.com/login", "submitUrl": "https://www.linkedin.com/company/setup/new/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'Manta', 'manta', 'browser',
   '{"submitUrl": "https://www.manta.com/claim"}',
   '{"requestsPerMinute": 6, "delayMs": 10000}', 'healthy', false),

  (gen_random_uuid(), 'Superpages', 'superpages', 'browser',
   '{"submitUrl": "https://www.superpages.com/super/free-business-listing.html"}',
   '{"requestsPerMinute": 6, "delayMs": 10000}', 'healthy', false),

  (gen_random_uuid(), 'Hotfrog', 'hotfrog', 'browser',
   '{"submitUrl": "https://www.hotfrog.com/AddBusiness.aspx"}',
   '{"requestsPerMinute": 6, "delayMs": 10000}', 'healthy', false),

  (gen_random_uuid(), 'Merchant Circle', 'merchant-circle', 'browser',
   '{"submitUrl": "https://www.merchantcircle.com/signup"}',
   '{"requestsPerMinute": 6, "delayMs": 10000}', 'healthy', false),

  -- Industry: hospitality / tourism
  (gen_random_uuid(), 'TripAdvisor', 'tripadvisor', 'browser',
   '{"loginUrl": "https://www.tripadvisor.com/Owners", "submitUrl": "https://www.tripadvisor.com/GetListedNew"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  -- Industry: medical
  (gen_random_uuid(), 'Healthgrades', 'healthgrades', 'browser',
   '{"submitUrl": "https://www.healthgrades.com/business/providers/claim"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'Zocdoc', 'zocdoc', 'browser',
   '{"submitUrl": "https://www.zocdoc.com/join"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  -- Industry: legal
  (gen_random_uuid(), 'Avvo', 'avvo', 'browser',
   '{"submitUrl": "https://www.avvo.com/claim-profile"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'FindLaw', 'findlaw', 'browser',
   '{"submitUrl": "https://lawyers.findlaw.com/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  -- Industry: home services
  (gen_random_uuid(), 'Houzz', 'houzz', 'browser',
   '{"submitUrl": "https://www.houzz.com/for-professionals/how-it-works"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'Angi', 'angi', 'browser',
   '{"submitUrl": "https://pros.angi.com/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  -- Industry: software / SaaS
  (gen_random_uuid(), 'G2', 'g2', 'browser',
   '{"submitUrl": "https://sell.g2.com/"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false),

  (gen_random_uuid(), 'Capterra', 'capterra', 'browser',
   '{"submitUrl": "https://www.capterra.com/vendors/sign-up"}',
   '{"requestsPerMinute": 4, "delayMs": 15000}', 'healthy', false)

ON CONFLICT (slug) DO NOTHING;
