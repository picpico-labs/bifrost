# Bifrost

> Modern JS Client for [Janus](https://janus.conf.meetecho.com/docs/)

## Installation

install the package:

```bash
pnpm install
```

If you run into this Error:

```bash
if (key == null || signature == null) throw new Error(Cannot find matching keyid: ${JSON.stringify({ signatures, keys })});

Error: Cannot find matching keyid: {"signatures": ...
```

Please run the following commands:

```bash
npm uninstall -g corepack
npm install -g corepack
corepack enable
corepack prepare pnpm@latest --activate
```

## TODO

- [x] setup project structure
- [ ] setup lint
- [ ] setup test
- [ ] setup CI/CD
- [ ] unbrella package - `@picpico-labs/bifrost`
- [ ] Supports web
- [ ] Supports native
