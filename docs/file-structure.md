# File Structure of Routes

The routes of the app are split into two main folders: `app/resources` and `app/views`.

The `app/resources` folder contains any resource route that is not a view, like an API endpoint, a dynamically generated file (think PDFs, social images, etc.), a redirect route, a webhook, etc.

The `app/views` folder contains all the routes that render a view, like the home page, the login page, the admin dashboard, etc.

## View Routes

Inside `app/views/layouts` there's also the layouts for the views, like the `app/views/layouts/auth.tsx` which is used for the `/login` and `/register` routes, or the `app/views/layouts/landing.tsx` which is used for the landing pages.

You can then organize other routes however you prefer, one way could be to follow Rails like conventions and create a folder for each resource, like `app/views/users`, `app/views/posts`, etc. And inside each folder, you can create the routes for that resource, like `app/views/users/index.tsx`, `app/views/users/show.tsx`, `app/views/users/edit.tsx`, etc.

```
app/views
├── layouts
│   ├── auth.tsx
│   ├── landing.tsx
├── users
│   ├── edit.tsx
│   ├── index.tsx
│   ├── new.tsx
│   ├── show.tsx
├── posts
│   ├── edit.tsx
│   ├── index.tsx
│   ├── new.tsx
│   ├── show.tsx
```

## Resource Routes

I recommend you to also create `app/resources/api` and `app/resources/webhooks` folders to split the API and webhook routes, respectively, other resources can be created as needed.

```
app/resources
├── api
│   ├── users.ts
│   ├── posts.ts
├── webhooks
│   ├── stripe.ts
│   ├── mailgun.ts
├── file.ts
```
