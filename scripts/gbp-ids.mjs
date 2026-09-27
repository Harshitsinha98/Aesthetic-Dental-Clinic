// Prints the Google Business Profile account and location IDs for the
// reviews integration. Run after you have a refresh token:
//
//   GBP_CLIENT_ID=… GBP_CLIENT_SECRET=… GBP_REFRESH_TOKEN=… node scripts/gbp-ids.mjs
//
// Copy the printed GBP_ACCOUNT_ID / GBP_LOCATION_ID into Vercel.

const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET || !GBP_REFRESH_TOKEN) {
  console.error("Set GBP_CLIENT_ID, GBP_CLIENT_SECRET and GBP_REFRESH_TOKEN first.");
  process.exit(1);
}

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_id: GBP_CLIENT_ID, client_secret: GBP_CLIENT_SECRET, refresh_token: GBP_REFRESH_TOKEN, grant_type: "refresh_token" }),
});
const { access_token, error_description } = await tokenRes.json();
if (!access_token) throw new Error(`Token exchange failed: ${error_description}`);
const auth = { Authorization: `Bearer ${access_token}` };

const accounts = await (await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", { headers: auth })).json();
if (accounts.error) throw new Error(`${accounts.error.status}: ${accounts.error.message}`);

for (const account of accounts.accounts ?? []) {
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`;
  const locations = await (await fetch(url, { headers: auth })).json();
  for (const loc of locations.locations ?? []) {
    console.log(`\n${loc.title}  (${loc.storefrontAddress?.locality ?? ""})`);
    console.log(`  GBP_ACCOUNT_ID=${account.name.split("/")[1]}`);
    console.log(`  GBP_LOCATION_ID=${loc.name.split("/")[1]}`);
  }
}
