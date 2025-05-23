export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>@redwoodjs/starter-drizzle</title>
      <script type="module" src="/src/client.tsx" />
    </head>
    <body>
      <div id="root">{children}</div>
    </body>
  </html>
);
