# Powering the Pacific

A desktop-first scrollytelling report about energy production in Fiji, French Polynesia, Samoa, Tonga, Tuvalu, and Vanuatu.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The production build is created with `npm run build` and can be previewed with `npm run preview`.

## Deploy to GitHub Pages

Build with `npm run build` and publish the generated `dist/` directory. The app uses relative data requests through Vite's public root, so it works when hosted from a project subpath.

## Data

The report loads the CSV files from `data/` at runtime. Population, power generation, and Brent crude source links are listed in the final section of the report.
