# Stage 1: Builder
FROM ruby:4.0.1-slim AS builder

# Install build dependencies for gems and Node.js
RUN apt-get update && apt-get install -y \
    build-essential git libvips-dev libssl-dev libyaml-dev \
    zlib1g-dev libffi-dev libreadline-dev ca-certificates gnupg libjemalloc2 \
    libpq-dev curl pkg-config python-is-python3 \
    && curl -fsSL https://deb.nodesource.com/setup_25.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && npm install -g corepack \
    && corepack enable \
    && corepack prepare yarn@4.12.0 --activate \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /rails

# Install gems
COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3

# Install JS dependencies
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --immutable

# Copy app and precompile assets
COPY . .
RUN SECRET_KEY_BASE=dummy_for_build bundle exec rake assets:precompile


# Stage 2: Final Runtime Image
FROM ruby:4.0.1-slim

ENV RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=true

WORKDIR /rails

# Install runtime libraries and Node.js
RUN apt-get update && apt-get install -y \
    libvips42 libvips-tools libjemalloc2 curl ca-certificates gnupg procps postgresql-client \
    && curl -fsSL https://deb.nodesource.com/setup_25.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && npm install -g corepack \
    && corepack enable \
    && corepack prepare yarn@4.12.0 --activate \
    && rm -rf /var/lib/apt/lists/*

# Copy bundler config and gems from builder
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Copy app from builder (includes node_modules and compiled assets)
COPY --from=builder /rails /rails

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /rails/docker-entrypoint.sh
RUN chmod +x /rails/docker-entrypoint.sh

EXPOSE 3000
CMD ["/rails/docker-entrypoint.sh"]
