# Updating the upstream version

Upstream is the `ghcr.io/umami-software/umami` image, tagged with the bare release version
(`3.4.0`, no `v`). The package pins that tag, plus a PostgreSQL and an nginx image that only move
when they need to.

## Determining the upstream version

```bash
gh release view -R umami-software/umami --json tagName -q .tagName
```

The release tag carries a `v`; the image tag does not. Confirm the image exists for both
architectures before bumping:

```bash
docker manifest inspect ghcr.io/umami-software/umami:<version> | jq -r '.manifests[].platform | "\(.os)/\(.architecture)"'
```

## Applying the bump

1. Set `images.umami.source.dockerTag` in `startos/manifest/index.ts` to the new tag.
2. Set `version` in `startos/versions/current.ts` to `<version>:0`, and replace its release
   notes.
3. Read the release notes for anything that touches the database, the tracker paths, the seeded
   admin account or the environment variables the package sets (`startos/utils.ts`,
   `umamiEnv`). Umami migrates its own database at start, through the `migrate` oneshot.
4. If upstream adds a path the tracker script calls, add it to `assets/nginx.conf`.

## PostgreSQL

`postgres` is pinned to a major-version Alpine tag. A patch bump within the same major is safe.
A new major cannot read the old data directory, so moving major versions needs a dump-and-restore
migration and a new `pgdataSubpath` in `startos/utils.ts`; never change the major in place.
