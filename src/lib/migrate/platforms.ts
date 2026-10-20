// Platforms owners commonly switch from, with where to find each export.
// Column names differ per platform, but every one is covered by the shared
// alias lists in normalize.ts, so a CSV from any of them (or anywhere else)
// maps automatically.

export type PlatformId = "fresha" | "vagaro" | "square" | "mindbody" | "phorest" | "setmore" | "lightspeed" | "other";

export type Platform = {
  id: PlatformId;
  name: string;
  steps: string[];
};

export const PLATFORMS: Platform[] = [
  {
    id: "fresha",
    name: "Fresha",
    steps: [
      "Clients: Clients > Client list > Options > Export > CSV",
      "Services and team: open each list, then Options > Export",
      "Appointments: Reports > Appointments list > Export",
    ],
  },
  {
    id: "vagaro",
    name: "Vagaro",
    steps: [
      "Clients (account owner only): Reports > Customers > Advanced Filters > Service Provider: All > Run Report > Export > Excel",
      "Appointments: Vagaro has no self-serve export; ask Vagaro support for a CSV of your appointments",
      "Services: copy your service menu into a sheet with Name, Price, Duration",
    ],
  },
  {
    id: "square",
    name: "Square",
    steps: [
      "Clients: Dashboard > Customers > Directory > Import/Export > Export Customers > All Customers > Download",
      "Services: Items > Item library > Actions > Export library",
      "Note: Square only exports customers attached to a sale, signed up by email, or imported",
    ],
  },
  {
    id: "mindbody",
    name: "Mindbody",
    steps: [
      "Clients: Reports > Mailing Lists > List clients: All Clients, Opt-in status: All Clients > Generate > Export to Excel",
      "Appointments: Reports > Appointments > Export, or ask Mindbody for a full data export",
    ],
  },
  {
    id: "phorest",
    name: "Phorest",
    steps: [
      "Clients: Marketing > Client Export > Add All Clients > download CSV",
      "Clients with visit history: Reports > Top Clients, date range from when you joined to today",
      "Appointments and services: export both as CSV (appointments don't include durations)",
      "Full history: email support@phorest.com for a complete data export",
    ],
  },
  {
    id: "setmore",
    name: "Setmore",
    steps: [
      "Clients: Customers > menu next to the search box > Export. Setmore emails the file to the account owner",
      "Services: copy your service list into a sheet with Name, Price, Duration",
    ],
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    steps: [
      "Clients: Back Office > Customers > Customer list > Export",
      "Menus differ by Lightspeed version; look for Export in your Customers section",
    ],
  },
  {
    id: "other",
    name: "Other / spreadsheet",
    steps: [
      "Any CSV or Excel file with a header row works",
      "Clients need a name plus email or phone",
      "Services need a name and price; appointments need a date",
    ],
  },
];
