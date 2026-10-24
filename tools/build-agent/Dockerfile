# An Azure Pipelines Linux agent that runs one job per container, for the lab's own machine (#2212).
# Read README.md before changing anything here: every pull request comes from a fork, and its code runs in this image.
FROM ubuntu:24.04

ARG NODE_VERSION=24.22.1
# The latest v4 agent when this was written, and its SHA-256 from the release notes:
# https://github.com/microsoft/azure-pipelines-agent/releases/tag/v4.275.0
ARG AGENT_VERSION=4.275.0
ARG AGENT_SHA256=416eb9340385d599e3159b86d08c03754af24d1cb2b6624425142a47ca65f346

ENV DEBIAN_FRONTEND=noninteractive

# python3, make and g++ are what npm needs to build a native module, as the node images provide.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git jq xz-utils python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN cd /tmp \
  && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
  && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" | grep " node-v${NODE_VERSION}-linux-x64.tar.xz\$" | sha256sum -c - \
  && tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v${NODE_VERSION}-linux-x64.tar.xz"

# The agent and its work folder belong to 'agent', which runs every job. installdependencies.sh is the
# agent's own installer for the .NET libraries it needs.
RUN useradd --create-home --shell /bin/bash agent \
  && mkdir /azp \
  && cd /azp \
  && curl -fsSLo agent.tar.gz "https://download.agent.dev.azure.com/agent/${AGENT_VERSION}/vsts-agent-linux-x64-${AGENT_VERSION}.tar.gz" \
  && echo "${AGENT_SHA256}  agent.tar.gz" | sha256sum -c - \
  && tar -xzf agent.tar.gz \
  && rm agent.tar.gz \
  && ./bin/installdependencies.sh \
  && rm -rf /var/lib/apt/lists/* \
  && chown -R agent:agent /azp

# COPY then chmod rather than COPY --chmod, which needs BuildKit; Ubuntu's own Docker package builds without it.
COPY start.sh /usr/local/bin/start.sh
RUN chmod 755 /usr/local/bin/start.sh

WORKDIR /azp

# start.sh starts as root only to hold the token where the job cannot read it, and runs the agent as 'agent'.
ENTRYPOINT ["/usr/local/bin/start.sh"]
