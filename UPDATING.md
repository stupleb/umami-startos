# Updating the upstream version

The package pins three images in `startos/manifest/index.ts`: Umami, which is the upstream, and a
PostgreSQL and an nginx image beside it.

## Determining the upstream version

### Umami

`ghcr.io/umami-software/umami`, tagged with the bare release version (`3.5.0`, no `v`):

```bash
gh release view -R umami-software/umami --json tagName -q .tagName
```

The release tag carries a `v`; the image tag does not. Confirm the image exists for both
architectures before bumping:

```bash
docker manifest inspect ghcr.io/umami-software/umami:<version> | jq -r '.manifests[].platform | "\(.os)/\(.architecture)"'
```

### PostgreSQL

`postgres:<major>.<minor>-alpine`, following the newest minor of the pinned major (`REL_18_7` is
`18.7-alpine`):

```bash
gh api 'repos/postgres/postgres/git/matching-refs/tags/REL_18_' --jq '.[].ref | ltrimstr("refs/tags/")' | grep -E '^REL_18_[0-9]+$' | sort -V | tail -1
```

### nginx

`nginx:<version>-alpine`, following the stable line, whose minor version is even
(`release-1.30.7` is `1.30.7-alpine`):

```bash
gh release list -R nginx/nginx --limit 10 --json tagName -q '.[].tagName' | grep -E '^release-1\.[0-9]*[02468]\.[0-9]+$' | head -1
```

## Applying the bump

### Umami

1. Set `images.umami.source.dockerTag` to the new tag.
2. Read the release notes for anything that touches the database, the tracker paths, the seeded
   admin account or the environment variables the package sets (`startos/utils.ts`,
   `umamiEnv`). Umami migrates its own database at start, through the `migrate` oneshot.
3. If upstream adds a path the tracker script calls, add it to `assets/nginx.conf`.

### PostgreSQL

Set `images.postgres.source.dockerTag` to the new tag. A minor bump within the same major is
safe. A new major cannot read the old data directory, so moving major versions needs a
dump-and-restore migration and a new `pgdataSubpath` in `startos/utils.ts`; never change the
major in place.

### nginx

Set `images.nginx.source.dockerTag` to the new tag.
