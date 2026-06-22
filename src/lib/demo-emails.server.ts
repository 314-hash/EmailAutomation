export const DEMO_EMAILS = [
  {
    from_addr: "j.martinez@acme-logistics.com",
    from_name: "Julia Martinez",
    subject: "URGENT: Container MSCU7841299 stuck at Rotterdam — vessel cut-off in 4h",
    body: `Hi team,

Our container MSCU7841299 (PO #84412, 26 pallets of automotive sensors) has been sitting at Rotterdam terminal since yesterday 18:00. Vessel cut-off for MSC Daniela is 22:00 CET today.

Customs cleared this morning but the terminal still shows "awaiting release". If we miss the cut-off the next sailing is 9 days out and our line in Wolfsburg goes down Tuesday.

Need someone to escalate with APMT immediately. ETA on a resolution?

Julia
Acme Logistics — Sea Freight`,
    received_at_minutes_ago: 12,
  },
  {
    from_addr: "li.chen@shenzhen-precision.cn",
    from_name: "Li Chen",
    subject: "PO 88231 — short shipment on bearings, 1,200 pcs missing",
    body: `Hello,

Reference PO 88231, ASN #A-77104. Received the shipment this morning. Counted 8,800 pcs of part SP-6203-2RS against the 10,000 ordered.

Pictures attached. Cartons 41–48 were empty when opened (seal intact). Suggesting either replacement air shipment by Friday or credit + reorder.

Please confirm route forward today — line schedule depends on it.

Best regards,
Li Chen
Shenzhen Precision Components`,
    received_at_minutes_ago: 47,
  },
  {
    from_addr: "procurement@northwind-foods.com",
    from_name: "Devon Wallace",
    subject: "Re: Q3 packaging contract — counter-proposal",
    body: `Thanks for the revised quote. The 4.2% unit price is workable, but we need:

- 60-day payment terms (vs 30 proposed)
- Volume rebate at 1.8M units (vs 2.2M)
- Quarterly business review with your ops lead

If we can align on these by EOW I'll route the SOW for signature next Monday.

Devon`,
    received_at_minutes_ago: 95,
  },
  {
    from_addr: "warehouse-ops@hub-atlanta.com",
    from_name: "Marcus Reid",
    subject: "Heads up: dock door 14 down for repair until Thursday",
    body: `FYI inbound team —

Dock door 14 hydraulic seal failed this morning. Vendor scheduled Thursday AM. Please reroute any reefer drops to doors 11 or 12 in the meantime.

Daily inbound volume looks fine to absorb on remaining doors. No action needed unless you have a >40k unit drop scheduled before Thursday.

— Marcus`,
    received_at_minutes_ago: 180,
  },
  {
    from_addr: "alerts@globalfreight-track.com",
    from_name: "GlobalFreight Alerts",
    subject: "Delay alert: Shipment GFT-2299184 — 2 days behind",
    body: `Shipment GFT-2299184 (origin: Shanghai → dest: Long Beach) now showing ETA Jun 28 (was Jun 26).

Reason: vessel reroute due to weather. No further action required from your side; we will update when berth assigned.`,
    received_at_minutes_ago: 240,
  },
  {
    from_addr: "amelia.wong@regionsupply.co",
    from_name: "Amelia Wong",
    subject: "Invoice INV-44102 — incorrect tax line",
    body: `Hi,

Invoice INV-44102 dated Jun 18 lists 8.25% sales tax. Our PO is shipping to an export-zone facility (cert on file, see attached). Could you reissue with tax removed? Net payable should be $42,180.00.

Thanks,
Amelia`,
    received_at_minutes_ago: 320,
  },
  {
    from_addr: "ops-team@nordic-cold-chain.no",
    from_name: "Sven Aaberg",
    subject: "Temperature excursion — Trailer 8821 between Hamburg and Oslo",
    body: `Trailer 8821 (PO 90188, 14 pallets pharma) registered a 2h 18m excursion at +8°C (spec +2 to +6°C) between 03:14 and 05:32 local on Jun 20. Cargo is currently at our Oslo cross-dock under hold pending QA decision.

Need your QA team to authorize accept / quarantine / reject by 17:00 CET so we can either release for last mile or initiate insurance claim.`,
    received_at_minutes_ago: 60,
  },
  {
    from_addr: "newsletter@supplychain-weekly.com",
    from_name: "Supply Chain Weekly",
    subject: "This week: red sea shipping volumes hit 18-month low",
    body: `Top stories from the week:
- Red Sea container volumes down 41% YoY
- New EU CBAM reporting kicks in Q3
- Maersk earnings beat on rate recovery

Read more on our site.`,
    received_at_minutes_ago: 1440,
  },
] as const;