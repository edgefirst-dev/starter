# Static Redirects

You can configure a list of static redirects in the `config/redirects.ts` file.

An example redirect from `/home` to `/` is already there for you to see how it works.

These redirects are checked for every request that doesn't match any route defined in the application, if a match is found the request is redirected to the new path, otherwise a 404 is returned.

For a more dynamic redirect create a custom route to handle them.
