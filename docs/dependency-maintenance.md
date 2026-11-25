# Dependency maintenance

## Remediation stages

1. Refresh the npm lockfile within the existing runtime dependency ranges. Update the development tools and use current Node 22 and 24 releases in CI. Use Node 22.13 or newer on the Node 22 release line for local development. Verify that a clean install, lint, fixture tests, Gulp tasks, and coverage reporting work.
2. After merging to `master`, reconcile the 77 original Dependabot alerts against the refreshed default-branch graph. Compare open alerts by ID and investigate any differences from the local lockfile check. Enable Dependabot security updates in the repository's Advanced Security settings and make the **dependency-review** job a required check in the ruleset for `master`.
3. Resolve runtime alerts [#21](https://github.com/jonkemp/gulp-inline-css/security/dependabot/21) (`nth-check`) and [#47](https://github.com/jonkemp/gulp-inline-css/security/dependabot/47) (`lodash.pick`) in a separately reviewed release. Both paths originate from Cheerio 0.22 in the `inline-css` 3.x tree. The tested `inline-css` 4.0.3 tree removes both affected packages but requires Node 20.18.1 or newer and changes serialization in four fixture tests, including insertion of `<tbody>` and changes to document whitespace. Choose the runtime baseline and intended HTML behavior before adopting an upstream release. Verify local and linked CSS, the full fixtures, and a clean install of the packed plugin on the chosen Node baseline.

The local lockfile comparison removes matches for 75 of the 77 exported alert ranges. The separate npm audit still reports high-severity entries in the `inline-css` tree and moderate entries associated with `glob` and `minimatch` under Mocha and c8. Review patched upstream tool releases during the weekly maintenance pass.

## Recurring review

Review Dependabot security pull requests as they arrive. Check the dependency path and severity, prioritize customer-facing and CI exposures, and merge after CI passes. Review the npm and GitHub Actions version update groups weekly. Review major updates individually for runtime, output, and build compatibility.

Use the dependency review check to catch newly introduced high and critical vulnerabilities on pull requests. Check the Dependabot dashboard weekly for new alerts and updates Dependabot could not open. Record each deferred alert's dependency path, reason for deferral, and next review date. Reconcile merged fixes against the default-branch alert list.
